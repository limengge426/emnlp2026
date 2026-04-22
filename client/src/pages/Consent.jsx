import React, { useState } from 'react';

export default function ConsentPage({ onSubmit }) {
  const [participantId, setParticipantId] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!participantId.trim()) {
      setError('请输入您的被试编号');
      return;
    }

    if (!agreed) {
      setError('请勾选同意框后继续');
      return;
    }

    setLoading(true);
    try {
      // 向后端查询被试组别
      const response = await fetch(`/api/participant/${participantId}`);
      if (!response.ok) {
        throw new Error('被试编号不存在，请检查输入');
      }
      const data = await response.json();
      onSubmit(participantId, data.group);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-5xl mb-8 text-center text-dark-brown font-serif-title">
          创意写作研究
        </h1>

        <div className="max-w-xl mx-auto bg-warm-gray p-8 border border-border-beige">
          <p className="text-lg leading-relaxed mb-6 text-dark-brown font-serif-body">
            您好，感谢参与本次研究。本研究关注创意写作过程中的修改行为。您将完成一篇短篇小说的写作，并有机会在反馈后进行修改。您的写作内容将用于学术研究，数据匿名处理。实验共约 20-30 分钟。
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-dark-brown font-medium mb-2">
                被试编号
              </label>
              <input
                type="text"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value.toUpperCase())}
                placeholder="例如：P01, P02..."
                className="w-full px-4 py-3 border border-border-beige bg-white text-dark-brown focus:outline-none focus:ring-2 focus:ring-warm-gold"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 mr-3 w-5 h-5"
                />
                <span className="text-dark-brown font-serif-body">
                  我已阅读以上说明，自愿参与本研究
                </span>
              </label>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-burnt-red bg-opacity-10 border border-burnt-red text-burnt-red text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? '正在验证...' : '开始实验'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
