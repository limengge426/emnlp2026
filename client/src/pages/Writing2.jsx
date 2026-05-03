import React, { useState, useEffect, useRef } from 'react';

export default function Writing2Page({ initialText, onSubmit }) {
  const [text, setText] = useState(initialText || '');
  const [keystrokeLog, setKeystrokeLog] = useState([]);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const countWords = (str) => {
    let count = 0;
    const chineseChars = str.match(/[\u4e00-\u9fff]/g);
    if (chineseChars) count += chineseChars.length;
    const englishWords = str.match(/\b[a-zA-Z]+\b/g);
    if (englishWords) count += englishWords.length;
    return count;
  };

  const wordCount = countWords(text);
  const canSubmit = wordCount >= 400;

  const handleKeyDown = (e) => {
    setKeystrokeLog(prev => [...prev, {
      key: e.key,
      timestamp: Date.now(),
      textLength: text.length
    }]);
  };

  // 防止意外关闭
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (text !== initialText) {
        e.preventDefault();
        e.returnValue = '您的数据将会丢失';
        return '您的数据将会丢失';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [text, initialText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      onSubmit({ text, wordCount, startTime }, keystrokeLog);
    } catch (err) {
      console.error('提交失败:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-4xl mb-4 text-center text-dark-brown font-serif-title">
          修改您的文章
        </h1>

        <div className="mb-6 p-4 bg-warm-gray border border-border-beige text-center">
          <p className="text-sm text-med-brown font-serif-body">
            这是您最后一次提交机会
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入文字……"
            className="textarea-base"
            style={{ minHeight: '60vh' }}
          />

          <div className="mt-6 flex justify-between items-center">
            <div className="text-med-brown text-sm font-serif-body">
              字数统计：<span className="font-semibold text-dark-brown">{wordCount}</span> / 400-500
              {wordCount < 400 && (
                <div className="text-burnt-red text-xs mt-1">
                  还需要 {400 - wordCount} 个字
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn-primary"
            >
              {submitting ? '提交中...' : '提交最终稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
