'use strict';

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = String(process.env.PORT || '3847');
const userData =
    process.env.OPENSTOCK_USER_DATA ||
    path.join(os.homedir(), 'Library/Application Support/OpenStock');
const configPath = path.join(userData, 'config.json');
const dbPath = path.join(userData, 'mongo');
const mongoBinDir = path.join(userData, 'mongodb-binaries');

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return {};
    }
}

function saveConfig(cfg) {
    fs.mkdirSync(userData, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

function waitForHttp(url, timeoutMs) {
    const started = Date.now();
    return new Promise((resolve, reject) => {
        const tryOnce = () => {
            const req = http.get(url, (res) => {
                res.resume();
                resolve();
            });
            req.on('error', () => {
                if (Date.now() - started > timeoutMs) {
                    reject(new Error(`等待 OpenStock 啟動逾時（${url}）`));
                    return;
                }
                setTimeout(tryOnce, 400);
            });
        };
        tryOnce();
    });
}

async function main() {
    fs.mkdirSync(dbPath, { recursive: true });
    fs.mkdirSync(mongoBinDir, { recursive: true });

    const cfg = loadConfig();
    if (!cfg.betterAuthSecret) {
        cfg.betterAuthSecret = crypto.randomBytes(32).toString('hex');
        saveConfig(cfg);
    }

    console.log('OpenStock：正在啟動內建資料庫…');
    const mongod = await MongoMemoryServer.create({
        instance: {
            dbName: 'openstock',
            dbPath,
            storageEngine: 'wiredTiger',
        },
        binary: {
            downloadDir: mongoBinDir,
        },
    });

    const mongoUri = mongod.getUri();
    const standaloneDir = process.env.OPENSTOCK_STANDALONE || __dirname;
    const serverJs = path.join(standaloneDir, 'server.js');
    const nodeBin = process.env.OPENSTOCK_NODE || process.execPath;

    if (!fs.existsSync(serverJs)) {
        throw new Error(`找不到 Next 伺服器：${serverJs}`);
    }

    const env = {
        ...process.env,
        NODE_ENV: 'production',
        PORT,
        HOSTNAME: '127.0.0.1',
        MONGODB_URI: mongoUri,
        BETTER_AUTH_SECRET: cfg.betterAuthSecret,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || `http://127.0.0.1:${PORT}`,
        FINNHUB_API_KEY: cfg.finnhubApiKey || process.env.FINNHUB_API_KEY || '',
        NEXT_PUBLIC_FINNHUB_API_KEY:
            cfg.finnhubApiKey ||
            process.env.NEXT_PUBLIC_FINNHUB_API_KEY ||
            process.env.FINNHUB_API_KEY ||
            '',
        FINNHUB_BASE_URL: process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
    };

    console.log(`OpenStock：正在啟動網頁服務（http://127.0.0.1:${PORT}）…`);
    const child = spawn(nodeBin, [serverJs], {
        cwd: standaloneDir,
        env,
        stdio: 'inherit',
    });

    let shuttingDown = false;
    const shutdown = async () => {
        if (shuttingDown) return;
        shuttingDown = true;
        if (!child.killed) child.kill('SIGTERM');
        try {
            await mongod.stop({ doCleanup: false, force: true });
        } catch (error) {
            console.error('停止資料庫時發生錯誤：', error);
        }
    };

    process.on('SIGTERM', () => {
        shutdown().finally(() => process.exit(0));
    });
    process.on('SIGINT', () => {
        shutdown().finally(() => process.exit(0));
    });
    child.on('exit', (code) => {
        shutdown().finally(() => process.exit(code ?? 0));
    });

    await waitForHttp(`http://127.0.0.1:${PORT}`, 120000);
    console.log('OpenStock：已就緒');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
