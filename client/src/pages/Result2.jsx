import React from 'react';

export default function Result2Page({ group, fakeAIScore2, onContinue }) {
  const isExperimental = group === 'experimental';

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        {isExperimental ? (
          <>
            <div className="text-center mb-8">
              <div
                className="big-number-fade inline-block"
                style={{
                  fontSize: '72px',
                  fontFamily: 'Playfair Display, serif',
                  color: '#5A7A5A',
                  fontWeight: 'bold',
                  marginBottom: '0.25em',
                }}
              >
                {fakeAIScore2}%
              </div>
              <p className="text-xl text-dark-brown font-serif-body">
                AI 写作特征检测结果
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white p-8 border border-border-beige text-center mb-8">
              <p className="text-lg text-dark-brown font-serif-body leading-relaxed">
                您的文章 AI 特征已显著降低，感谢您的参与！
              </p>
            </div>
          </>
        ) : (
          <div className="max-w-xl mx-auto bg-white p-8 border border-border-beige text-center mb-8">
            <p className="text-lg text-dark-brown font-serif-body leading-relaxed">
              感谢您完成两次写作，您的认真态度对本研究非常重要！
            </p>
          </div>
        )}

        <div className="max-w-xl mx-auto">
          <button onClick={onContinue} className="w-full btn-primary">
            继续，完成问卷
          </button>
        </div>
      </div>
    </div>
  );
}
