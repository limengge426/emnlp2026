import React, { useState, useEffect } from 'react';

// 生成随机的特征分布图数据
const generateFeatureData = () => {
  return [
    { label: '句式规整度', value: Math.floor(Math.random() * 30) + 60 },
    { label: '词汇重复率', value: Math.floor(Math.random() * 25) + 55 },
    { label: '逻辑结构', value: Math.floor(Math.random() * 28) + 62 },
    { label: '情感表达', value: Math.floor(Math.random() * 20) + 40 },
  ];
};

export default function Result1Page({ group, fakeAIScore, onContinue }) {
  const [featureData] = useState(generateFeatureData());
  const isExperimental = group === 'experimental';

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        {isExperimental ? (
          // 实验组：显示 AI 分数
          <>
            <div className="text-center mb-12">
              <div
                className="big-number-fade inline-block"
                style={{
                  fontSize: '72px',
                  fontFamily: 'Playfair Display, serif',
                  color: '#C96442',
                  fontWeight: 'bold',
                  marginBottom: '0.5em',
                }}
              >
                {fakeAIScore}%
              </div>
              <p className="text-xl text-dark-brown font-serif-body">
                AI 写作特征检测结果
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-warm-gray p-8 border border-border-beige mb-8 bar-chart-fade">
              <h3 className="font-serif-title text-lg text-dark-brown mb-6">
                AI 特征分布
              </h3>

              <div className="space-y-6">
                {featureData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-med-brown font-serif-body">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-dark-brown">
                        {item.value}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white border border-border-beige">
                      <div
                        className="h-full bg-burnt-red"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-white p-8 border border-border-beige mb-8">
              <p className="text-center text-dark-brown font-serif-body leading-relaxed">
                您的文章具有较高的 AI
                写作特征。请尝试修改后重新提交。注意：您只有<strong>一次</strong>
                重新检测的机会，请认真修改。
              </p>
            </div>
          </>
        ) : (
          // 控制组：无 AI 内容
          <div className="max-w-xl mx-auto bg-white p-8 border border-border-beige mb-8">
            <p className="text-center text-dark-brown font-serif-body leading-relaxed text-lg">
              已收到您的第一稿，感谢！请您再次审视自己的文章，进一步完善您的创意表达。注意：您只有<strong>一次</strong>
              修改提交的机会。
            </p>
          </div>
        )}

        <div className="max-w-xl mx-auto">
          <button onClick={onContinue} className="w-full btn-primary">
            开始修改
          </button>
        </div>
      </div>
    </div>
  );
}
