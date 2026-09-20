import { Metadata } from 'next';
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Mail,
  Github,
  ChevronDown
} from 'lucide-react';

export const metadata: Metadata = {
  title: '說明中心 | OpenStock',
  description: 'OpenStock 由社群一起支援，沒有付費牆，只有協助。',
};

export default function HelpPage() {
  const faqs = [
    {
      question: "OpenStock 真的會一直免費嗎？",
      answer: "會。我們靠捐款與社群貢獻運作。追蹤、警示、分析等核心功能會維持免費。我們認為金融工具不該變成奢侈品。"
    },
    {
      question: "要怎麼把股票加入自選股？",
      answer: "用上方或頁首的搜尋列找公司。進入個股頁後，點愛心或星星圖示，就會立刻加到你的總覽。"
    },
    {
      question: "市場資料從哪裡來？",
      answer: "我們與 Finnhub 等資料供應商合作，提供即時或延遲行情。資料適合分析使用，不適合高頻交易。"
    },
    {
      question: "我可以貢獻程式或設計嗎？",
      answer: "當然可以。請到 GitHub 倉庫查看標為「good first issue」的議題。設計師、工程師、寫作者都歡迎。"
    },
    {
      question: "警示沒有觸發怎麼辦？",
      answer: "警示每 5 分鐘由背景工作檢查一次。請確認電子郵件已驗證，通知主要以郵件寄出。"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">

      <div className="text-center pt-16 pb-12 space-y-4">
        <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
          <HelpCircle className="text-blue-400 h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">需要幫忙嗎？</h1>
        <p className="text-xl text-gray-400">由社群一起提供支援。</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-16">
        <HelpCard
          icon={<BookOpen className="text-teal-400" />}
          title="閱讀文件"
          desc="深入了解功能與 API 整合方式。"
          link="/api-docs"
          linkText="查看文件"
        />
        <HelpCard
          icon={<MessageCircle className="text-purple-400" />}
          title="社群聊天"
          desc="向其他使用者即時發問。"
          link="https://discord.gg/JkJ8kfxgxB"
          linkText="加入 Discord"
        />
        <HelpCard
          icon={<Github className="text-white" />}
          title="回報問題"
          desc="發現錯誤？請告訴開發者。"
          link="https://github.com/aiken884/OpenStock/issues"
          linkText="開立議題"
        />
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4">常見問題</h2>
        <div className="grid gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-colors">
              <h3 className="font-semibold text-lg text-gray-200 mb-2 flex items-start gap-3">
                <Lightbulb size={20} className="text-yellow-500/50 mt-1 shrink-0" />
                {faq.question}
              </h3>
              <p className="text-gray-400 leading-relaxed ml-8 pl-1 border-l-2 border-gray-800">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">還是卡住了？</h3>
        <p className="text-gray-400 mb-6">團隊與社群會回覆信件，通常完全免費。</p>
        <a
          href="mailto:opendevsociety@gmail.com"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <Mail size={18} />
          聯絡支援
        </a>
      </div>

    </div>
  );
}

function HelpCard({ icon, title, desc, link, linkText }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col items-start hover:border-gray-700 transition-colors">
      <div className="mb-4 bg-gray-800 p-2 rounded-lg">{icon}</div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 flex-grow">{desc}</p>
      <a href={link} className="text-teal-400 text-sm font-medium hover:underline flex items-center gap-1">
        {linkText} <ChevronDown size={14} className="-rotate-90" />
      </a>
    </div>
  );
}
