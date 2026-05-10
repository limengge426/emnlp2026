import React from 'react';

export default function DonePage({ group }) {
  const isExperimental = group === 'experimental';

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-5xl mb-8 text-center text-dark-brown font-serif-title">
          感谢您的参与
        </h1>

        <div className="max-w-2xl mx-auto bg-warm-gray p-10 border border-border-beige text-center">
          <p className="text-lg leading-relaxed text-dark-brown font-serif-body mb-6">
            本研究旨在探究 AI 文本检测工具的普及是否会影响人类创意写作的表达多样性。
          </p>

          {isExperimental ? (
            <p className="text-lg leading-relaxed text-dark-brown font-serif-body mb-6">
              实验中您收到的 AI 检测分数（第一次约 60–80%、第二次约 20%）并非真实检测结果，而是由系统随机生成的模拟数据。您的写作内容完全由您本人创作，与 AI 生成无关。我们对此造成的困惑表示诚挚歉意。
            </p>
          ) : (
            <p className="text-lg leading-relaxed text-dark-brown font-serif-body mb-6">
              您在实验中不会收到任何 AI 检测分数，所看到的反馈仅是一句通用的修改提示。您是本研究的对照样本，您的数据将与实验组的数据进行对比，帮助我们检验"AI 检测压力"这一因素对人类写作修改行为的具体影响。
            </p>
          )}

          <p className="text-lg leading-relaxed text-dark-brown font-serif-body mb-6">
            您的数据将以匿名方式用于学术研究，不会与您的姓名或学号关联存储。如您希望撤回全部数据，请联系研究者提供您的被试编号（如 P15），我们将在 24 小时内删除。衷心感谢您的参与。
          </p>

          <p className="text-sm text-med-brown font-serif-body italic">
            本研究已完成。您现在可以关闭此页面。
          </p>
        </div>
      </div>
    </div>
  );
}
