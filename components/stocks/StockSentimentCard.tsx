import type { StockSentimentInsights } from '@/lib/actions/adanos.helpers';

interface StockSentimentCardProps {
    insight: StockSentimentInsights | null;
}

function formatScore(value: number | null, suffix: string): string {
    if (value === null) return '無資料';
    return `${value.toFixed(1)}${suffix}`;
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('zh-TW', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

const ALIGNMENT_ZH: Record<string, string> = {
    'No sentiment mix': '尚無情緒組合',
    'Single-source view': '單一來源',
    'Bullish alignment': '多方一致',
    'Bearish alignment': '空方一致',
    'Tight alignment': '來源接近',
    'Wide divergence': '來源分歧大',
    'Mixed': '看法分歧',
};

const TREND_ZH: Record<string, string> = {
    rising: '上升',
    falling: '下降',
    stable: '持穩',
};

function getTrendClasses(trend: string | null): string {
    if (trend === 'rising') return 'text-emerald-400';
    if (trend === 'falling') return 'text-rose-400';
    if (trend === 'stable') return 'text-amber-300';
    return 'text-gray-400';
}

function getAlignmentClasses(alignment: string): string {
    if (alignment === 'Bullish alignment') return 'text-emerald-400';
    if (alignment === 'Bearish alignment' || alignment === 'Wide divergence') return 'text-rose-400';
    if (alignment === 'Tight alignment') return 'text-blue-300';
    if (alignment === 'Mixed') return 'text-amber-300';
    if (alignment === 'Single-source view') return 'text-slate-300';
    if (alignment === 'No sentiment mix') return 'text-zinc-400';
    return 'text-gray-300';
}

export default function StockSentimentCard({ insight }: StockSentimentCardProps) {
    if (!insight) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                            情緒洞察
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-white">
                            {insight.symbol} 在社群與公開頻道的情緒
                        </h2>
                        {insight.companyName ? (
                            <p className="mt-1 text-sm font-medium text-gray-300">
                                {insight.companyName}
                            </p>
                        ) : null}
                        <p className="mt-1 text-sm text-gray-400">
                            彙整 Reddit、X.com、新聞與 Polymarket 的結構化情緒快照。
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-800 bg-black/20 p-4 md:min-w-[320px]">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                平均熱度
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                {formatScore(insight.averageBuzz, '/100')}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                平均偏多
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                {formatScore(insight.bullishAverage, '%')}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                來源一致性
                            </p>
                            <p className={`mt-1 text-sm font-semibold ${getAlignmentClasses(insight.sourceAlignment)}`}>
                                {ALIGNMENT_ZH[insight.sourceAlignment] ?? insight.sourceAlignment}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                涵蓋來源
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                {insight.availableSources}/4
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {insight.sources.map((source) => (
                        <article
                            key={source.source}
                            className="rounded-xl border border-gray-800 bg-black/20 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-white">{source.label}</h3>
                                <span className={`text-sm font-medium ${getTrendClasses(source.trend)}`}>
                                    {source.trend ? (TREND_ZH[source.trend] ?? source.trend) : '無趨勢'}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-gray-800 bg-black/20 p-3">
                                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                        熱度
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {formatScore(source.buzzScore, '/100')}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-800 bg-black/20 p-3">
                                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                        偏多
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {formatScore(source.bullishPct, '%')}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-800 bg-black/20 p-3">
                                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                        {source.metricLabel}
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {formatCompactNumber(source.metricValue)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-800 bg-black/20 p-3">
                                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                                        趨勢
                                    </p>
                                    <p className={`mt-2 text-xl font-semibold ${getTrendClasses(source.trend)}`}>
                                        {source.trend ? (TREND_ZH[source.trend] ?? source.trend) : '無資料'}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
