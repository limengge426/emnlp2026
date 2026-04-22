import React from 'react';

export default function DonePage() {
  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-5xl mb-8 text-center text-dark-brown font-serif-title">
          感谢您的参与
        </h1>

        <div className="max-w-2xl mx-auto bg-warm-gray p-10 border border-border-beige text-center">
          <p className="text-lg leading-relaxed text-dark-brown font-serif-body mb-6">
            本研究旨在探究 AI
            检测工具的普及对人类创意写作多样性的潜在影响。为了使实验有效，我们在第一次检测中向您展示的
            AI 率是模拟生成的，并非真实检测结果。您的写作内容完全由您自己创作，与 AI
            生成无关。
          </p>

          <p className="text-lg leading-relaxed text-dark-brown font-serif-body mb-6">
            我们对此造成的困惑表示歉意，并衷心感谢您的参与。如有任何问题，请联系研究者。您的数据将被保密处理，如希望撤回数据，请联系研究者提供您的被试编号。
          </p>

          <p className="text-sm text-med-brown font-serif-body italic">
            本研究已完成。您现在可以关闭此页面。
          </p>
        </div>
      </div>
    </div>
  );
}
