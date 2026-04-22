import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/data', {
        headers: { 'x-admin-key': adminKey }
      });

      if (!response.ok) {
        throw new Error('密钥错误，权限不足');
      }

      const result = await response.json();
      setData(result.data);
      setAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        headers: { 'x-admin-key': adminKey }
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('导出失败: ' + err.message);
    }
  };

  if (!authenticated) {
    return (
      <div className="page-container bg-cream">
        <div className="content-wrapper">
          <h1 className="text-4xl mb-8 text-center text-dark-brown font-serif-title">
            管理员登录
          </h1>

          <form
            onSubmit={handleLogin}
            className="max-w-sm mx-auto bg-warm-gray p-8 border border-border-beige"
          >
            <div className="mb-6">
              <label className="block text-dark-brown font-medium mb-2">
                管理员密钥
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 border border-border-beige bg-white text-dark-brown focus:outline-none focus:ring-2 focus:ring-warm-gold"
              />
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
              {loading ? '验证中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-cream min-h-screen">
      <div className="content-wrapper">
        <h1 className="text-4xl mb-8 text-center text-dark-brown font-serif-title">
          数据管理
        </h1>

        <div className="mb-8 text-center">
          <button onClick={handleExport} className="btn-primary mr-4">
            下载 CSV 数据
          </button>
          <button
            onClick={() => {
              setAuthenticated(false);
              setAdminKey('');
              setData([]);
            }}
            className="btn-secondary"
          >
            退出登录
          </button>
        </div>

        <div className="overflow-x-auto bg-white border border-border-beige">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-beige bg-warm-gray">
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  被试编号
                </th>
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  组别
                </th>
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  第一稿字数
                </th>
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  第二稿字数
                </th>
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  AI 分数 1
                </th>
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  AI 分数 2
                </th>
                <th className="px-4 py-3 text-left text-dark-brown font-semibold">
                  完成时间
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-cream'}
                >
                  <td className="px-4 py-3 text-dark-brown">{row.id}</td>
                  <td className="px-4 py-3 text-med-brown">
                    {row.group_name === 'experimental' ? '实验' : '控制'}
                  </td>
                  <td className="px-4 py-3 text-dark-brown">
                    {row.draft1_word_count || '-'}
                  </td>
                  <td className="px-4 py-3 text-dark-brown">
                    {row.draft2_word_count || '-'}
                  </td>
                  <td className="px-4 py-3 text-dark-brown">
                    {row.fake_ai_score1 || '-'}%
                  </td>
                  <td className="px-4 py-3 text-dark-brown">
                    {row.fake_ai_score2 || '-'}%
                  </td>
                  <td className="px-4 py-3 text-med-brown text-xs">
                    {row.questionnaire_submit_time
                      ? new Date(row.questionnaire_submit_time).toLocaleDateString('zh-CN')
                      : '未完成'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-sm text-med-brown">
          共 {data.length} 条记录
        </div>
      </div>
    </div>
  );
}
