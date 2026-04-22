import React, { useState } from 'react';

export default function QuestionnairePage({
  participantId,
  group,
  draft1Data,
  draft2Data,
  draft2SubmitTime,
  fakeAIScore1,
  fakeAIScore2,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    q1_changes: '',
    q2_aiMarkers: '',
    q3_restricted: 0,
    q4_dailyConcern: 0,
    q5_other: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.q1_changes.trim() || formData.q1_changes.trim().length < 20) {
      newErrors.q1_changes = '请至少输入 20 个字';
    }

    if (!formData.q2_aiMarkers.trim()) {
      newErrors.q2_aiMarkers = '请填写此项';
    }

    if (formData.q3_restricted === 0) {
      newErrors.q3_restricted = '请选择一个选项';
    }

    if (formData.q4_dailyConcern === 0) {
      newErrors.q4_dailyConcern = '请选择一个选项';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Submit draft2 data (now we have both AI scores and correct timing)
      if (draft2Data) {
        const draft2Response = await fetch('/api/submit/draft2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId,
            group,
            draft2Text: draft2Data.text,
            draft2WordCount: draft2Data.wordCount,
            draft2SubmitTime: draft2SubmitTime || new Date().toISOString(),
            draft2StartTime: draft2Data.startTime
              ? new Date(draft2Data.startTime).toISOString()
              : new Date().toISOString(),
            fakeAIScore1,
            fakeAIScore2,
            keystrokeLog2: draft2Data.keystrokeLog
          })
        });

        if (!draft2Response.ok) {
          throw new Error('第二稿提交失败，请重试');
        }
      }

      // Submit questionnaire
      const response = await fetch('/api/submit/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('问卷提交失败，请重试');
      }

      onSubmit();
    } catch (err) {
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handleLikertChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-4xl mb-8 text-center text-dark-brown font-serif-title">
          研究问卷
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* 问题 1 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              您在修改时主要做了哪些改动？
            </label>
            <textarea
              value={formData.q1_changes}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q1_changes: e.target.value }));
                if (errors.q1_changes) setErrors(prev => ({ ...prev, q1_changes: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="4"
              placeholder="请描述您的修改……"
            />
            {errors.q1_changes && (
              <p className="text-burnt-red text-sm mt-2">{errors.q1_changes}</p>
            )}
          </div>

          {/* 问题 2 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              您觉得哪些写法会让文章"看起来像 AI 写的"？
            </label>
            <textarea
              value={formData.q2_aiMarkers}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q2_aiMarkers: e.target.value }));
                if (errors.q2_aiMarkers) setErrors(prev => ({ ...prev, q2_aiMarkers: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="4"
              placeholder="请描述……"
            />
            {errors.q2_aiMarkers && (
              <p className="text-burnt-red text-sm mt-2">{errors.q2_aiMarkers}</p>
            )}
          </div>

          {/* 问题 3 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              修改过程中，您是否感到受限或委屈？
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">完全没有</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="q3"
                      value={value}
                      checked={formData.q3_restricted === value}
                      onChange={(e) => handleLikertChange('q3_restricted', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">非常强烈</span>
            </div>
            {errors.q3_restricted && (
              <p className="text-burnt-red text-sm mt-2">{errors.q3_restricted}</p>
            )}
          </div>

          {/* 问题 4 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              在日常写作中，您是否也会有类似的顾虑（担心写作风格被认为像 AI）？
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">从不</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="q4"
                      value={value}
                      checked={formData.q4_dailyConcern === value}
                      onChange={(e) => handleLikertChange('q4_dailyConcern', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">经常</span>
            </div>
            {errors.q4_dailyConcern && (
              <p className="text-burnt-red text-sm mt-2">{errors.q4_dailyConcern}</p>
            )}
          </div>

          {/* 问题 5 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              其他想法或补充<span className="text-med-brown text-sm">（选填）</span>
            </label>
            <textarea
              value={formData.q5_other}
              onChange={(e) => setFormData(prev => ({ ...prev, q5_other: e.target.value }))}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="3"
              placeholder="如有其他想法，请在此输入……"
            />
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-burnt-red bg-opacity-10 border border-burnt-red text-burnt-red text-sm">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary"
          >
            {submitting ? '提交中...' : '提交问卷'}
          </button>
        </form>
      </div>
    </div>
  );
}
