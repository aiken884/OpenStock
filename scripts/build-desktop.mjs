#!/usr/bin/env node
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, extraEnv = {}, cwd = root) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            env: { ...process.env, ...extraEnv },
        });
        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} ${args.join(' ')} 結束代碼 ${code}`));
        });
    });
}

async function main() {
    const mongoBinDir = path.join(root, 'build-resources', 'mongodb-binaries');
    mkdirSync(mongoBinDir, { recursive: true });

    console.log('啟動暫時資料庫以便 Next.js 建置…');
    const mongod = await MongoMemoryServer.create({
        instance: { dbName: 'openstock' },
        binary: { downloadDir: mongoBinDir },
    });

    try {
        await run('npm', ['run', 'build'], {
            NODE_ENV: 'production',
            MONGODB_URI: mongod.getUri(),
            BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'desktop-build-placeholder-secret-32chars',
            BETTER_AUTH_URL: 'http://127.0.0.1:3847',
            NEXT_PUBLIC_FINNHUB_API_KEY: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '',
            FINNHUB_BASE_URL: 'https://finnhub.io/api/v1',
        });
    } finally {
        await mongod.stop();
    }

    const standalone = path.join(root, '.next', 'standalone');
    if (!existsSync(standalone)) {
        throw new Error('找不到 .next/standalone，Next.js standalone 輸出失敗');
    }

    mkdirSync(path.join(standalone, '.next'), { recursive: true });
    cpSync(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true });
    if (existsSync(path.join(root, 'public'))) {
        cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true });
    }
    copyFileSync(path.join(root, 'desktop', 'launch.cjs'), path.join(standalone, 'desktop-launch.cjs'));

    console.log('在 standalone 安裝內建 MongoDB…');
    await run('npm', ['install', 'mongodb-memory-server@^10.2.3', '--omit=dev', '--no-package-lock'], {}, standalone);

    const binDir = path.join(root, 'build-resources', 'bin');
    mkdirSync(binDir, { recursive: true });
    const nodeDest = path.join(binDir, 'node');
    copyFileSync(process.execPath, nodeDest);
    chmodSync(nodeDest, 0o755);

    console.log('打包 macOS 應用…');
    await run('npx', ['electron-builder', '--mac', 'dir', '--config.mac.identity=null'], {
        ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
    });
    console.log('\n完成。請開啟 release/mac-arm64/OpenStock.app 或 release/mac/OpenStock.app');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
