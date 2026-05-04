import React, { useState } from 'react';

export default function PreSurveyPage({ participantId, onSubmit }) {
  const [formData, setFormData] = useState({
    pre_age: '',
    pre_gender: '',
    pre_native_chinese: '',
    pre_writing_frequency: '',
    pre_writing_focus: '',
    pre_ai_tool_usage: '',
    pre_reader_concern: 0,
    pre_misjudgment_distress: 0,
    pre_detector_familiarity: '',
    pre_predicted_ai_score: 50
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pre_age) {
      newErrors.pre_age = '请输入年龄';
    } else if (formData.pre_age < 16 || formData.pre_age > 60) {
      newErrors.pre_age = '年龄范围应为 16-60';
    }

    if (!formData.pre_gender) {
      newErrors.pre_gender = '请选择性别';
    }

    if (!formData.pre_native_chinese) {
      newErrors.pre_native_chinese = '请选择一个选项';
    }

    if (!formData.pre_writing_frequency) {
      newErrors.pre_writing_frequency = '请选择一个选项';
    }

    if (!formData.pre_writing_focus) {
      newErrors.pre_writing_focus = '请选择一个选项';
    }

    if (!formData.pre_ai_tool_usage) {
      newErrors.pre_ai_tool_usage = '请选择一个选项';
    }

    if (formData.pre_reader_concern === 0) {
      newErrors.pre_reader_concern = '请选择一个选项';
    }

    if (formData.pre_misjudgment_distress === 0) {
      newErrors.pre_misjudgment_distress = '请选择一个选项';
    }

    if (!formData.pre_detector_familiarity) {
      newErrors.pre_detector_familiarity = '请选择一个选项';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        <h1 className="text-4xl mb-2 text-center text-dark-brown font-serif-title">
          开始前的几个问题
        </h1>
        <p className="text-center text-med-brown mb-8">
          您的回答将帮助我们更好地解读您的文本风格数据，大约需要 2 分钟。
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* 题目1：年龄 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您的年龄
            </label>
            <input
              type="number"
              min="16"
              max="60"
              value={formData.pre_age}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, pre_age: e.target.value }));
                if (errors.pre_age) setErrors(prev => ({ ...prev, pre_age: '' }));
              }}
              className="w-full px-4 py-2 border border-border-beige bg-white text-dark-brown"
              placeholder="请输入 16-60"
            />
            {errors.pre_age && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_age}</p>
            )}
          </div>

          {/* 题目2：性别 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您的性别
            </label>
            <div className="space-y-3">
              {['女', '男', '其他', '不愿透露'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pre_gender"
                    value={option}
                    checked={formData.pre_gender === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, pre_gender: e.target.value }));
                      if (errors.pre_gender) setErrors(prev => ({ ...prev, pre_gender: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.pre_gender && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_gender}</p>
            )}
          </div>

          {/* 题目3：母语是否为中文 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您的母语是否为中文？
            </label>
            <div className="space-y-3">
              {['是', '否'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pre_native_chinese"
                    value={option}
                    checked={formData.pre_native_chinese === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, pre_native_chinese: e.target.value }));
                      if (errors.pre_native_chinese) setErrors(prev => ({ ...prev, pre_native_chinese: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.pre_native_chinese && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_native_chinese}</p>
            )}
          </div>

          {/* 题目4：写作频率 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您平时多久写一次创意性文字（日记、随笔、散文等）？
            </label>
            <div className="space-y-3">
              {['几乎不写', '偶尔（每月一两次）', '经常（每周）', '非常频繁'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pre_writing_frequency"
                    value={option}
                    checked={formData.pre_writing_frequency === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, pre_writing_frequency: e.target.value }));
                      if (errors.pre_writing_frequency) setErrors(prev => ({ ...prev, pre_writing_frequency: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.pre_writing_frequency && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_writing_frequency}</p>
            )}
          </div>

          {/* 题目5：写作关注点 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您写作时最在意哪个方面？
            </label>
            <div className="space-y-3">
              {['语言是否流畅', '结构是否清晰', '表达是否有个人风格', '内容是否有深度', '其他'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pre_writing_focus"
                    value={option}
                    checked={formData.pre_writing_focus === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, pre_writing_focus: e.target.value }));
                      if (errors.pre_writing_focus) setErrors(prev => ({ ...prev, pre_writing_focus: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.pre_writing_focus && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_writing_focus}</p>
            )}
          </div>

          {/* 题目6：AI工具使用 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您是否使用过 AI 工具辅助自己的写作？
            </label>
            <div className="space-y-3">
              {['从未使用', '偶尔尝试', '经常使用'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pre_ai_tool_usage"
                    value={option}
                    checked={formData.pre_ai_tool_usage === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, pre_ai_tool_usage: e.target.value }));
                      if (errors.pre_ai_tool_usage) setErrors(prev => ({ ...prev, pre_ai_tool_usage: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.pre_ai_tool_usage && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_ai_tool_usage}</p>
            )}
          </div>

          {/* 题目7：读者关注 - 7点李克特量表 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              在写作时，您是否会考虑读者对文章风格的判断？
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">从不考虑</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="pre_reader_concern"
                      value={value}
                      checked={formData.pre_reader_concern === value}
                      onChange={() => handleLikertChange('pre_reader_concern', value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">非常在意</span>
            </div>
            {errors.pre_reader_concern && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_reader_concern}</p>
            )}
          </div>

          {/* 题目8：误判困扰 - 7点李克特量表 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              如果您认真写的一篇文章被他人或系统判定为 AI 生成，您会感到不快吗？
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">完全不会</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="pre_misjudgment_distress"
                      value={value}
                      checked={formData.pre_misjudgment_distress === value}
                      onChange={() => handleLikertChange('pre_misjudgment_distress', value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">非常不快</span>
            </div>
            {errors.pre_misjudgment_distress && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_misjudgment_distress}</p>
            )}
          </div>

          {/* 题目9：检测工具了解 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您对文本风格分析工具（例如语言流畅度检测、AI 生成概率检测）了解多少？
            </label>
            <div className="space-y-3">
              {['完全不了解', '听说过但没用过', '用过一两次', '比较熟悉'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pre_detector_familiarity"
                    value={option}
                    checked={formData.pre_detector_familiarity === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, pre_detector_familiarity: e.target.value }));
                      if (errors.pre_detector_familiarity) setErrors(prev => ({ ...prev, pre_detector_familiarity: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.pre_detector_familiarity && (
              <p className="text-burnt-red text-sm mt-2">{errors.pre_detector_familiarity}</p>
            )}
          </div>

          {/* 题目10：预期AI检测概率 - 滑块 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              您预期自己接下来写的散文，被 AI 检测器判定为 AI 生成的概率大约是多少？
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.pre_predicted_ai_score}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, pre_predicted_ai_score: parseInt(e.target.value) }));
                }}
                className="w-full"
              />
              <div className="text-center">
                <span className="text-2xl font-serif-title text-dark-brown">
                  {formData.pre_predicted_ai_score}%
                </span>
              </div>
            </div>
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
