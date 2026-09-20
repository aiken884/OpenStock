import { Metadata } from 'next';
import { Shield, FileText, Check, AlertTriangle, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: '服務條款 | OpenStock',
  description: '公平、透明、開放的社群條款。',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">

      <div className="text-center pt-16 pb-12 space-y-4">
        <div className="inline-flex p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 mb-4">
          <Scale className="text-teal-400 h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">服務條款</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          建立在信任、透明與社群價值上。沒有藏在細節裡的陷阱，規則寫清楚。
        </p>
        <p className="text-sm text-gray-500">最後更新：2025 年 10 月</p>
      </div>

      <div className="space-y-12">
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="text-teal-500" />
            我們的承諾
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <PromiseItem text="核心功能永遠免費。" />
            <PromiseItem text="我們不會出售你的個人資料。" />
            <PromiseItem text="條款變更會公開討論。" />
            <PromiseItem text="自選股與分析內容屬於你。" />
          </div>
        </section>

        <section className="bg-yellow-900/10 border border-yellow-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-xl font-bold text-yellow-100 mb-2">投資聲明</h3>
              <p className="text-yellow-200/80 leading-relaxed">
                <strong>OpenStock 是教育與分析工具，不是投資顧問。</strong>
                資料依現況提供，僅供參考。請勿投入你無法承受損失的資金。
                做出任何財務決策前，請自行研究，或諮詢合格專業人士。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">社群規則</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">可以做</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex gap-2"><Check size={16} className="text-blue-500 mt-1" /> 自由分享知識</li>
                <li className="flex gap-2"><Check size={16} className="text-blue-500 mt-1" /> 把 API 用在個人專案</li>
                <li className="flex gap-2"><Check size={16} className="text-blue-500 mt-1" /> 尊重其他成員</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-red-400 mb-4">不要做</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex gap-2"><span className="text-red-500 font-bold">×</span> 過度大量抓取資料</li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">×</span> 分享 API 金鑰</li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">×</span> 用於高頻交易</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="text-center pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            對條款有疑問？請來信 <a href="mailto:opendevsociety@gmail.com" className="text-teal-400 hover:underline">opendevsociety@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function PromiseItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg">
      <div className="bg-teal-500/10 p-1 rounded-full">
        <Check size={14} className="text-teal-400" />
      </div>
      <span className="text-gray-300 font-medium">{text}</span>
    </div>
  );
}
