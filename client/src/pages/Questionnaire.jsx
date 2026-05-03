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
    q_deleted_types: [],
    q2_aiMarkers: '',
    q_detection_reaction: '',
    q3_restricted: 0,
    q_abandoned_content: '',
    q_authentic_draft: '',
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

    if (formData.q_deleted_types.length === 0) {
      newErrors.q_deleted_types = '至少选择一项';
    }

    if (!formData.q2_aiMarkers.trim()) {
      newErrors.q2_aiMarkers = '请填写此项';
    }

    if (!formData.q_detection_reaction) {
      newErrors.q_detection_reaction = '请选择一个选项';
    }

    if (formData.q3_restricted === 0) {
      newErrors.q3_restricted = '请选择一个选项';
    }

    if (!formData.q_abandoned_content.trim()) {
      newErrors.q_abandoned_content = '请填写此项';
    }

    if (!formData.q_authentic_draft) {
      newErrors.q_authentic_draft = '请选择一个选项';
    }

    if (formData.q4_dailyConcern === 0) {
      newErrors.q4_dailyConcern = '请选择一个选项';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const updated = prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value];
      return { ...prev, [field]: updated };
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLikertChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-4xl mb-8 text-center text-dark-brown font-serif-title">
          研究问卷
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* 问题 1: 原问题1 */}
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

          {/* 问题 A: 多选问题 - 删减的内容 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您在修改时，主要删减了什么类型的内容？<span className="text-med-brown text-sm">（至少选一项）</span>
            </label>
            <div className="space-y-3">
              {['比喻或修辞', '情感性词语', '某些标点（如破折号、省略号）', '句式结构', '某些主观判断或观点', '具体细节', '没有删减内容', '其他'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.q_deleted_types.includes(option)}
                    onChange={() => handleCheckboxChange('q_deleted_types', option)}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.q_deleted_types && (
              <p className="text-burnt-red text-sm mt-2">{errors.q_deleted_types}</p>
            )}
          </div>

          {/* 问题 2: 原问题2 */}
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

          {/* 问题 C: 单选问题 - 检测结果反应 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              当您看到第一次检测结果时，您的第一反应是？
            </label>
            <div className="space-y-3">
              {['感到意外', '觉得结果可能是准确的', '不太相信', '完全不相信'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="q_detection_reaction"
                    value={option}
                    checked={formData.q_detection_reaction === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, q_detection_reaction: e.target.value }));
                      if (errors.q_detection_reaction) setErrors(prev => ({ ...prev, q_detection_reaction: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.q_detection_reaction && (
              <p className="text-burnt-red text-sm mt-2">{errors.q_detection_reaction}</p>
            )}
          </div>

          {/* 问题 3: 原问题3 */}
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

          {/* 问题 F: 开放题 - 被放弃的内容（现改为必填）*/}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              在修改过程中，您有没有放弃一些原本想写的表达？如果有，那是什么？
            </label>
            <textarea
              value={formData.q_abandoned_content}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q_abandoned_content: e.target.value }));
                if (errors.q_abandoned_content) setErrors(prev => ({ ...prev, q_abandoned_content: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="3"
              placeholder="请描述您放弃了什么，以及为什么放弃……"
            />
            {errors.q_abandoned_content && (
              <p className="text-burnt-red text-sm mt-2">{errors.q_abandoned_content}</p>
            )}
          </div>

          {/* 问题 G: 单选问题 - 哪一稿更像自己 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              修改完成后，您觉得哪一稿更像"你自己"？
            </label>
            <div className="space-y-3">
              {['第一稿更像我', '两稿差不多', '第二稿更像我'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="q_authentic_draft"
                    value={option}
                    checked={formData.q_authentic_draft === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, q_authentic_draft: e.target.value }));
                      if (errors.q_authentic_draft) setErrors(prev => ({ ...prev, q_authentic_draft: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.q_authentic_draft && (
              <p className="text-burnt-red text-sm mt-2">{errors.q_authentic_draft}</p>
            )}
          </div>

          {/* 问题 4: 原问题4 */}
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

          {/* 问题 5: 原问题5 */}
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
