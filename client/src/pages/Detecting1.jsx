import React, { useEffect, useState } from 'react';

export default function Detecting1Page({ onComplete }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 逐行显示消息
    const timings = [
      { delay: 500, message: '正在分析文本结构……' },
      { delay: 5000, message: '正在比对语料特征……' },
      { delay: 10000, message: '正在生成报告……' },
    ];

    const timeouts = timings.map(({ delay, message }) =>
      setTimeout(() => {
        setMessages(prev => [...prev, message]);
      }, delay)
    );

    // 30秒后跳转
    const completeTimeout = setTimeout(() => {
      // 生成随机 AI 分数 (60-80)
      const score = Math.floor(Math.random() * 21) + 60;
      onComplete(score);
    }, 30000);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="page-container bg-cream">
      <div className="flex flex-col items-center justify-center">
        {/* 旋转的环形进度条 */}
        <div className="mb-12">
          <svg
            className="spin-ring"
            width="120"
            height="120"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#C96442"
              strokeWidth="3"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#D4A574"
              strokeWidth="2"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* 逐行显示的消息 */}
        <div className="text-center space-y-3">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className="fade-in text-lg text-med-brown font-serif-body"
              style={{
                animation: `fadeIn 0.6s ease-in-out ${idx * 0.3}s forwards`,
              }}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
