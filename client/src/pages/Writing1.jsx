import React, { useState, useEffect, useRef } from 'react';

export default function Writing1Page({ participantId, group, onSubmit }) {
  const [text, setText] = useState('');
  const [keystrokeLog, setKeystrokeLog] = useState([]);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const countWords = (str) => {
    let count = 0;
    const chineseChars = str.match(/[一-鿿]/g);
    if (chineseChars) count += chineseChars.length;
    const englishWords = str.match(/\b[a-zA-Z]+\b/g);
    if (englishWords) count += englishWords.length;
    return count;
  };

  const wordCount = countWords(text);
  const canSubmit = wordCount >= 300;

  const handleKeyDown = (e) => {
    setKeystrokeLog(prev => [...prev, {
      key: e.key,
      timestamp: Date.now(),
      textLength: text.length
    }]);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (text.length > 0) {
        e.preventDefault();
        e.returnValue = '您的数据将会丢失';
        return '您的数据将会丢失';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');

    const submitTime = new Date().toISOString();

    try {
      const response = await fetch('/api/submit/draft1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          group,
          draft1Text: text,
          draft1WordCount: wordCount,
          draft1SubmitTime: submitTime,
          draft1StartTime: new Date(startTime).toISOString(),
          keystrokeLog1: keystrokeLog
        })
      });

      if (!response.ok) {
        throw new Error('提交失败，请重试');
      }

      onSubmit({ text, wordCount, startTime }, keystrokeLog);
    } catch (err) {
      setError(err.message || '网络错误，请检查连接后重试');
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-4xl mb-4 text-center text-dark-brown font-serif-title">
          创意写作
        </h1>

        <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
          <h2 className="text-xl font-serif-title text-dark-brown mb-3">
            写作题目
          </h2>
          <p className="text-lg text-med-brown font-serif-body leading-relaxed">
            伍尔夫在《到灯塔去》写过：“她想，这真奇怪，人若是孤独一人，便会依附于无生命的东西：树木、溪流、花朵；觉得它们表达了自我；觉得它们变成了自己；觉得它们了解自己，在某种意义上就是自己；便对这些东西产生了一种不合逻辑的柔情（她看着那长久而稳定的光亮），就像对自己一样。那情景升腾起来，她停下手中紧握的织针，注视着，注视着，那东西从心灵的底蕴上卷起，从生命的湖泊中升起，像迷雾，像去会情人的新娘。“
          </p>
          <p className="text-lg text-med-brown font-serif-body leading-relaxed">
            你是否有过这样的瞬间？这段话让你想起什么、记起什么、感受到什么，都可以成为你的主题。请就此写一篇 400 到 500 字的散文。
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

            <div className="flex flex-col items-end gap-2">
              {error && (
                <div className="text-burnt-red text-sm text-right max-w-xs">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="btn-primary"
              >
                {submitting ? '提交中...' : '提交检测'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
