import React, { useState } from 'react';

export default function PreSurveyPage({ participantId, onSubmit }) {
  const [formData, setFormData] = useState({
    writing_frequency: '',
    ai_tool_usage: '',
    ai_anxiety_baseline: 0,
    ai_detector_familiarity: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.writing_frequency) {
      newErrors.writing_frequency = '请选择一个选项';
    }

    if (!formData.ai_tool_usage) {
      newErrors.ai_tool_usage = '请选择一个选项';
    }

    if (formData.ai_anxiety_baseline === 0) {
      newErrors.ai_anxiety_baseline = '请选择一个选项';
    }

    if (!formData.ai_detector_familiarity) {
      newErrors.ai_detector_familiarity = '请选择一个选项';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLikertChange = (value) => {
    setFormData(prev => ({ ...prev, ai_anxiety_baseline: parseInt(value) }));
    if (errors.ai_anxiety_baseline) {
      setErrors(prev => ({ ...prev, ai_anxiety_baseline: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit/presurvey', {
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
          开始前的几个问题
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* 问题 1 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您平时多久写一次创意性文字（日记、随笔、散文等）？
            </label>
            <div className="space-y-3">
              {['几乎不写', '偶尔（每月一两次）', '经常（每周）', '非常频繁'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="writing_frequency"
                    value={option}
                    checked={formData.writing_frequency === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, writing_frequency: e.target.value }));
                      if (errors.writing_frequency) setErrors(prev => ({ ...prev, writing_frequency: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.writing_frequency && (
              <p className="text-burnt-red text-sm mt-2">{errors.writing_frequency}</p>
            )}
          </div>

          {/* 问题 2 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您是否使用过AI工具辅助自己的写作？
            </label>
            <div className="space-y-3">
              {['从未使用', '偶尔使用', '经常使用'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ai_tool_usage"
                    value={option}
                    checked={formData.ai_tool_usage === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, ai_tool_usage: e.target.value }));
                      if (errors.ai_tool_usage) setErrors(prev => ({ ...prev, ai_tool_usage: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.ai_tool_usage && (
              <p className="text-burnt-red text-sm mt-2">{errors.ai_tool_usage}</p>
            )}
          </div>

          {/* 问题 3 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您是否曾担心过自己的写作被人认为"像AI写的"？
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">从未担心</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="ai_anxiety"
                      value={value}
                      checked={formData.ai_anxiety_baseline === value}
                      onChange={() => handleLikertChange(value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">非常频繁</span>
            </div>
            {errors.ai_anxiety_baseline && (
              <p className="text-burnt-red text-sm mt-2">{errors.ai_anxiety_baseline}</p>
            )}
          </div>

          {/* 问题 4 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您对AI文本检测工具了解多少？
            </label>
            <div className="space-y-3">
              {['完全不了解', '听说过但没用过', '用过一两次', '比较熟悉'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ai_detector_familiarity"
                    value={option}
                    checked={formData.ai_detector_familiarity === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, ai_detector_familiarity: e.target.value }));
                      if (errors.ai_detector_familiarity) setErrors(prev => ({ ...prev, ai_detector_familiarity: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.ai_detector_familiarity && (
              <p className="text-burnt-red text-sm mt-2">{errors.ai_detector_familiarity}</p>
            )}
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
            {submitting ? '提交中...' : '开始写作'}
          </button>
        </form>
      </div>
    </div>
  );
}
