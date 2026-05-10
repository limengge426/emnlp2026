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
  const isExperimental = group === 'experimental';

  const [formData, setFormData] = useState({
    q1_changes: '',
    q2_abandoned: '',
    q3_ai_markers: '',
    q4_deleted_types: [],
    q5_detection_reaction: '',
    q5_prompt_interpretation: '',
    q6_restricted: 0,
    q6_restriction_source: '',
    q7_revision_goal: '',
    q7b_motivation_accuracy: 0,
    q7c_motivation_stigma: 0,
    q7d_motivation_aesthetic: 0,
    q7e_motivation_compliance: 0,
    q8_daily_concern: 0,
    q9_authentic_draft: '',
    q10_perceived_purpose: '',
    q10b_oddness: '',
    q10c_score_doubt: 0,
    q10d_doubt_impact: '',
    q11_other: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.q1_changes.trim() || formData.q1_changes.trim().length < 20) {
      newErrors.q1_changes = '请至少输入 20 个字';
    }
    if (!formData.q2_abandoned.trim() || formData.q2_abandoned.trim().length < 10) {
      newErrors.q2_abandoned = '请至少输入 10 个字';
    }
    if (!formData.q3_ai_markers.trim() || formData.q3_ai_markers.trim().length < 10) {
      newErrors.q3_ai_markers = '请至少输入 10 个字';
    }
    if (formData.q4_deleted_types.length === 0) {
      newErrors.q4_deleted_types = '至少选择一项';
    }
    if (isExperimental && !formData.q5_detection_reaction) {
      newErrors.q5_detection_reaction = '请选择一个选项';
    }
    if (!isExperimental && (!formData.q5_prompt_interpretation.trim() || formData.q5_prompt_interpretation.trim().length < 10)) {
      newErrors.q5_prompt_interpretation = '请至少输入 10 个字';
    }
    if (formData.q6_restricted === 0) {
      newErrors.q6_restricted = '请选择一个选项';
    }
    if (!formData.q7_revision_goal) {
      newErrors.q7_revision_goal = '请选择一个选项';
    }
    if (isExperimental) {
      if (formData.q7b_motivation_accuracy === 0) newErrors.q7b_motivation_accuracy = '请选择一个分值';
      if (formData.q7c_motivation_stigma === 0) newErrors.q7c_motivation_stigma = '请选择一个分值';
      if (formData.q7d_motivation_aesthetic === 0) newErrors.q7d_motivation_aesthetic = '请选择一个分值';
      if (formData.q7e_motivation_compliance === 0) newErrors.q7e_motivation_compliance = '请选择一个分值';
    }
    if (formData.q8_daily_concern === 0) {
      newErrors.q8_daily_concern = '请选择一个选项';
    }
    if (!formData.q9_authentic_draft) {
      newErrors.q9_authentic_draft = '请选择一个选项';
    }
    if (!formData.q10_perceived_purpose.trim() || formData.q10_perceived_purpose.trim().length < 10) {
      newErrors.q10_perceived_purpose = '请至少输入 10 个字';
    }
    if (!formData.q10b_oddness.trim()) {
      newErrors.q10b_oddness = '请填写此项';
    }
    if (isExperimental) {
      if (formData.q10c_score_doubt === 0) {
        newErrors.q10c_score_doubt = '请选择一个分值';
      } else if (formData.q10c_score_doubt >= 4) {
        if (!formData.q10d_doubt_impact.trim() || formData.q10d_doubt_impact.trim().length < 10) {
          newErrors.q10d_doubt_impact = '请至少输入 10 个字';
        }
      }
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

      // 仅在实验组的"怀疑度"达到 4 分及以上时才发送 q10d，避免误传短文本
      const payload = {
        participantId,
        group,
        ...formData,
        q10d_doubt_impact:
          isExperimental && formData.q10c_score_doubt >= 4
            ? formData.q10d_doubt_impact
            : ''
      };

      const response = await fetch('/api/submit/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  const deletedTypeOptions = [
    '比喻或修辞表达',
    '情感性词语',
    '某些标点（如破折号、省略号）',
    '句式结构',
    '某些主观判断或观点',
    '具体细节描写',
    '没有删减任何内容',
    '其他'
  ];

  const experimentalRevisionGoalOptions = ['让文章变得更好', '让 AI 率降下来', '两者都有', '其他'];
  const controlRevisionGoalOptions = ['让文章变得更好', '让文章更符合"散文"的标准', '两者都有', '其他'];

  return (
    <div className="page-container bg-cream">
      <div className="content-wrapper">
        <h1 className="text-4xl mb-8 text-center text-dark-brown font-serif-title">
          研究问卷
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Q1: 主要改动 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              1. 您在修改时主要做了哪些改动？<span className="text-med-brown text-sm">（至少 20 字）</span>
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

          {/* Q2: 放弃的表达 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              2. 在修改过程中，您有没有放弃一些原本想写的表达？如果有，那是什么？如果没有，请填"没有"。<span className="text-med-brown text-sm">（至少 10 字）</span>
            </label>
            <textarea
              value={formData.q2_abandoned}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q2_abandoned: e.target.value }));
                if (errors.q2_abandoned) setErrors(prev => ({ ...prev, q2_abandoned: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="3"
              placeholder="请描述……"
            />
            {errors.q2_abandoned && (
              <p className="text-burnt-red text-sm mt-2">{errors.q2_abandoned}</p>
            )}
          </div>

          {/* Q3: AI 写法特征 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              3. 您觉得哪些写法会让一篇文章"看起来像 AI 写的"？<span className="text-med-brown text-sm">（至少 10 字）</span>
            </label>
            <textarea
              value={formData.q3_ai_markers}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q3_ai_markers: e.target.value }));
                if (errors.q3_ai_markers) setErrors(prev => ({ ...prev, q3_ai_markers: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="3"
              placeholder="请描述……"
            />
            {errors.q3_ai_markers && (
              <p className="text-burnt-red text-sm mt-2">{errors.q3_ai_markers}</p>
            )}
          </div>

          {/* Q4: 删减类型（多选） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              4. 您在修改时，主要删减了什么类型的内容？<span className="text-med-brown text-sm">（至少选一项）</span>
            </label>
            <div className="space-y-3">
              {deletedTypeOptions.map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.q4_deleted_types.includes(option)}
                    onChange={() => handleCheckboxChange('q4_deleted_types', option)}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.q4_deleted_types && (
              <p className="text-burnt-red text-sm mt-2">{errors.q4_deleted_types}</p>
            )}
          </div>

          {/* Q5: 组别差异题 */}
          {isExperimental ? (
            <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
              <label className="block text-lg font-serif-title text-dark-brown mb-4">
                5. 当您看到第一次检测结果（AI 率较高）时，您的第一反应是？
              </label>
              <div className="space-y-3">
                {['感到意外', '觉得结果可能是准确的', '不太相信', '完全不相信'].map(option => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="q5_detection_reaction"
                      value={option}
                      checked={formData.q5_detection_reaction === option}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, q5_detection_reaction: e.target.value }));
                        if (errors.q5_detection_reaction) setErrors(prev => ({ ...prev, q5_detection_reaction: '' }));
                      }}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-dark-brown font-serif-body">{option}</span>
                  </label>
                ))}
              </div>
              {errors.q5_detection_reaction && (
                <p className="text-burnt-red text-sm mt-2">{errors.q5_detection_reaction}</p>
              )}
            </div>
          ) : (
            <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
              <label className="block text-lg font-serif-title text-dark-brown mb-3">
                5. 当您完成第一稿、看到"请进一步完善您的创意表达"的提示时，您是怎么理解这个提示的？<span className="text-med-brown text-sm">（至少 10 字）</span>
              </label>
              <textarea
                value={formData.q5_prompt_interpretation}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, q5_prompt_interpretation: e.target.value }));
                  if (errors.q5_prompt_interpretation) setErrors(prev => ({ ...prev, q5_prompt_interpretation: '' }));
                }}
                className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
                rows="3"
                placeholder="请描述……"
              />
              {errors.q5_prompt_interpretation && (
                <p className="text-burnt-red text-sm mt-2">{errors.q5_prompt_interpretation}</p>
              )}
            </div>
          )}

          {/* Q6: 受限感（Likert 1-7）+ 控制组追加开放题 */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              {isExperimental
                ? '6. 修改过程中，您是否感到受限或委屈？'
                : '6. 修改过程中，您是否觉得有什么因素限制了您的表达？'}
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">完全没有</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="q6_restricted"
                      value={value}
                      checked={formData.q6_restricted === value}
                      onChange={(e) => handleLikertChange('q6_restricted', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">非常强烈</span>
            </div>
            {errors.q6_restricted && (
              <p className="text-burnt-red text-sm mt-2">{errors.q6_restricted}</p>
            )}
            {!isExperimental && (
              <div className="mt-4">
                <label className="block text-sm font-serif-title text-dark-brown mb-2">
                  如果有，是什么因素？<span className="text-med-brown">（选填）</span>
                </label>
                <textarea
                  value={formData.q6_restriction_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, q6_restriction_source: e.target.value }))}
                  className="w-full p-3 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
                  rows="2"
                  placeholder="请描述……"
                />
              </div>
            )}
          </div>

          {/* Q7: 修改目标（单选，选项按组别不同） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              7. 您在修改时，主要的目标是什么？
            </label>
            <div className="space-y-3">
              {(isExperimental ? experimentalRevisionGoalOptions : controlRevisionGoalOptions).map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="q7_revision_goal"
                    value={option}
                    checked={formData.q7_revision_goal === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, q7_revision_goal: e.target.value }));
                      if (errors.q7_revision_goal) setErrors(prev => ({ ...prev, q7_revision_goal: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.q7_revision_goal && (
              <p className="text-burnt-red text-sm mt-2">{errors.q7_revision_goal}</p>
            )}
          </div>

          {/* Q7b–e: 机制分离题（仅实验组） */}
          {isExperimental && (
            <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
              <label className="block text-lg font-serif-title text-dark-brown mb-2">
                7.1 您选择修改文章，是因为以下哪些原因？
              </label>
              <p className="text-sm text-med-brown font-serif-body mb-5">
                请对每一项打分：1 = 完全不是这个原因 / 7 = 非常强烈是这个原因。各项之间不互斥。
              </p>

              {[
                {
                  field: 'q7b_motivation_accuracy',
                  text: 'a) 我担心 AI 检测器的判断是准确的，文章确实写得"像 AI"。'
                },
                {
                  field: 'q7c_motivation_stigma',
                  text: 'b) 我不希望自己的文字被别人或系统贴上"AI 味"的标签。'
                },
                {
                  field: 'q7d_motivation_aesthetic',
                  text: 'c) 我觉得"AI 味"本身就是一种不好的写作风格。'
                },
                {
                  field: 'q7e_motivation_compliance',
                  text: 'd) 我主要是为了配合任务要求，让分数降下去就好。'
                }
              ].map(({ field, text }) => (
                <div key={field} className="mb-5">
                  <p className="text-dark-brown font-serif-body mb-2">{text}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-med-brown">完全不是</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(value => (
                        <label key={value} className="flex flex-col items-center cursor-pointer">
                          <input
                            type="radio"
                            name={field}
                            value={value}
                            checked={formData[field] === value}
                            onChange={() => handleLikertChange(field, value)}
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-dark-brown mt-1">{value}</span>
                        </label>
                      ))}
                    </div>
                    <span className="text-xs text-med-brown">非常强烈</span>
                  </div>
                  {errors[field] && (
                    <p className="text-burnt-red text-sm mt-2">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Q8: 日常写作顾虑（Likert 1-7） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              {isExperimental
                ? '8. 在日常写作中，您是否也会担心自己的写作风格被认为像 AI？'
                : '8. 在日常写作中，您是否会担心自己的写作风格被认为像 AI？'}
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-med-brown">从不</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(value => (
                  <label key={value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="q8_daily_concern"
                      value={value}
                      checked={formData.q8_daily_concern === value}
                      onChange={(e) => handleLikertChange('q8_daily_concern', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-dark-brown mt-1">{value}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-med-brown">经常</span>
            </div>
            {errors.q8_daily_concern && (
              <p className="text-burnt-red text-sm mt-2">{errors.q8_daily_concern}</p>
            )}
          </div>

          {/* Q9: 哪一稿更像自己（单选） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-4">
              9. 修改完成后，您觉得哪一稿更像"你自己"？
            </label>
            <div className="space-y-3">
              {['第一稿更像我', '两稿差不多', '第二稿更像我'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="q9_authentic_draft"
                    value={option}
                    checked={formData.q9_authentic_draft === option}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, q9_authentic_draft: e.target.value }));
                      if (errors.q9_authentic_draft) setErrors(prev => ({ ...prev, q9_authentic_draft: '' }));
                    }}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="text-dark-brown font-serif-body">{option}</span>
                </label>
              ))}
            </div>
            {errors.q9_authentic_draft && (
              <p className="text-burnt-red text-sm mt-2">{errors.q9_authentic_draft}</p>
            )}
          </div>

          {/* Q10: 研究目的猜测（开放题） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              10. 您觉得这项研究真正想了解的是什么？<span className="text-med-brown text-sm">（至少 10 字）</span>
            </label>
            <textarea
              value={formData.q10_perceived_purpose}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q10_perceived_purpose: e.target.value }));
                if (errors.q10_perceived_purpose) setErrors(prev => ({ ...prev, q10_perceived_purpose: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="3"
              placeholder="请描述……"
            />
            {errors.q10_perceived_purpose && (
              <p className="text-burnt-red text-sm mt-2">{errors.q10_perceived_purpose}</p>
            )}
          </div>

          {/* Q10b: 实验体验中的"不对劲"（两组共用，开放） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              10.1 在整个实验过程中，您有没有觉得哪里让您困惑、不自然，或者"不太对劲"？如果有，是什么？<span className="text-med-brown text-sm">（如果没有，可以直接写"没有"）</span>
            </label>
            <textarea
              value={formData.q10b_oddness}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, q10b_oddness: e.target.value }));
                if (errors.q10b_oddness) setErrors(prev => ({ ...prev, q10b_oddness: '' }));
              }}
              className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
              rows="3"
              placeholder="请描述……"
            />
            {errors.q10b_oddness && (
              <p className="text-burnt-red text-sm mt-2">{errors.q10b_oddness}</p>
            )}
          </div>

          {/* Q10c: 怀疑度（仅实验组，Likert 1-7） */}
          {isExperimental && (
            <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
              <label className="block text-lg font-serif-title text-dark-brown mb-4">
                10.2 您是否怀疑过 AI 检测分数的真实性？
              </label>
              <div className="flex justify-between items-center">
                <span className="text-sm text-med-brown">从未怀疑</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(value => (
                    <label key={value} className="flex flex-col items-center cursor-pointer">
                      <input
                        type="radio"
                        name="q10c_score_doubt"
                        value={value}
                        checked={formData.q10c_score_doubt === value}
                        onChange={() => handleLikertChange('q10c_score_doubt', value)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-dark-brown mt-1">{value}</span>
                    </label>
                  ))}
                </div>
                <span className="text-sm text-med-brown">非常怀疑</span>
              </div>
              {errors.q10c_score_doubt && (
                <p className="text-burnt-red text-sm mt-2">{errors.q10c_score_doubt}</p>
              )}
            </div>
          )}

          {/* Q10d: 怀疑的影响（仅实验组，且 q10c >= 4 时才显示） */}
          {isExperimental && formData.q10c_score_doubt >= 4 && (
            <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
              <label className="block text-lg font-serif-title text-dark-brown mb-3">
                10.3 您刚才表示对分数有所怀疑。这种怀疑是否影响了您的修改方式？怎么影响的？<span className="text-med-brown text-sm">（至少 10 字）</span>
              </label>
              <textarea
                value={formData.q10d_doubt_impact}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, q10d_doubt_impact: e.target.value }));
                  if (errors.q10d_doubt_impact) setErrors(prev => ({ ...prev, q10d_doubt_impact: '' }));
                }}
                className="w-full p-4 bg-white border border-border-beige text-dark-brown font-serif-body focus:outline-none focus:ring-2 focus:ring-warm-gold resize-none"
                rows="3"
                placeholder="请描述……"
              />
              {errors.q10d_doubt_impact && (
                <p className="text-burnt-red text-sm mt-2">{errors.q10d_doubt_impact}</p>
              )}
            </div>
          )}

          {/* Q11: 其他（选填） */}
          <div className="mb-8 p-6 bg-warm-gray border border-border-beige">
            <label className="block text-lg font-serif-title text-dark-brown mb-3">
              11. 其他想法或补充<span className="text-med-brown text-sm">（选填）</span>
            </label>
            <textarea
              value={formData.q11_other}
              onChange={(e) => setFormData(prev => ({ ...prev, q11_other: e.target.value }))}
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
