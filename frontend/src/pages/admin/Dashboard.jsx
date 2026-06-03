import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Article,
  XCircle,
  CheckCircle,
  Trophy,
  ArrowClockwise,
  Trash,
} from '@phosphor-icons/react';
import adminService from '../../services/adminService.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const DOUGHNUT_COLORS = [
  '#0d9488',
  '#14b8a6',
  '#2dd4bf',
  '#5eead4',
  '#99f6e4',
  '#6b7280',
  '#9ca3af',
];

function extractPayload(res) {
  return res?.data ?? res;
}

function normalizeStats(raw) {
  const data = extractPayload(raw);
  const totalLost = Number(data.totalLostPosts ?? data.total_lost_posts ?? 0);
  const totalFound = Number(data.totalFoundPosts ?? data.total_found_posts ?? 0);

  return {
    totalPosts: Number(data.totalPosts ?? totalLost + totalFound),
    totalLostPosts: totalLost,
    totalFoundPosts: totalFound,
    resolvedPosts: Number(data.resolvedPosts ?? data.resolved_posts ?? 0),
    successRate: String(data.successRate ?? data.success_rate ?? '0.0'),
    dailyStats: data.dailyStats ?? data.daily_stats ?? data.recentActivity ?? [],
    categoryStats: data.categoryStats ?? data.category_stats ?? data.categories ?? [],
    recentPosts: data.recentPosts ?? data.recent_posts ?? [],
  };
}

function buildLast30DaysSeries(dailyStats = []) {
  const byDate = new Map(
    dailyStats.map((row) => {
      const key = new Date(row.date).toISOString().slice(0, 10);
      return [
        key,
        {
          lost: Number(row.lost_count ?? row.lost ?? 0),
          found: Number(row.found_count ?? row.found ?? 0),
        },
      ];
    }),
  );

  const labels = [];
  const lostData = [];
  const foundData = [];
  const today = new Date();

  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
    const point = byDate.get(key) || { lost: 0, found: 0 };
    lostData.push(point.lost);
    foundData.push(point.found);
  }

  return { labels, lostData, foundData };
}

function MetricCard({ label, value, subtitle, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={16} className={iconColor} weight="light" />
        </div>
      </div>
      <p className="text-2xl font-semibold font-mono text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="px-8 py-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-80 bg-white rounded-2xl border border-gray-100" />
        <div className="h-80 bg-white rounded-2xl border border-gray-100" />
      </div>
      <div className="h-64 bg-white rounded-2xl border border-gray-100" />
    </div>
  );
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { font: { family: 'Outfit' } } },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, precision: 0 } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: 'Outfit', size: 11 }, padding: 12 },
    },
  },
};

export default function Dashboard() {
  useDocumentTitle('Admin · Dashboard');
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [busyId, setBusyId] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStats();
      setStats(normalizeStats(res));
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err?.message || 'Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const { labels: dailyLabels, lostData, foundData } = useMemo(
    () => buildLast30DaysSeries(stats?.dailyStats),
    [stats?.dailyStats],
  );

  const lineData = useMemo(
    () => ({
      labels: dailyLabels,
      datasets: [
        {
          label: 'Mất đồ',
          data: lostData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
        {
          label: 'Nhặt được',
          data: foundData,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    }),
    [dailyLabels, lostData, foundData],
  );

  const categoryLabels = useMemo(
    () => (stats?.categoryStats || []).map((c) => c.name),
    [stats?.categoryStats],
  );

  const categoryValues = useMemo(
    () => (stats?.categoryStats || []).map((c) => Number(c.count)),
    [stats?.categoryStats],
  );

  const doughnutData = useMemo(
    () => ({
      labels: categoryLabels,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: DOUGHNUT_COLORS.slice(0, categoryLabels.length),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }),
    [categoryLabels, categoryValues],
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài đăng này?')) return;
    setBusyId(id);
    try {
      await adminService.hardDeletePost(id);
      setStats((prev) => ({
        ...prev,
        recentPosts: (prev?.recentPosts || []).filter((p) => p.id !== id),
        totalPosts: Math.max(0, (prev?.totalPosts || 0) - 1),
      }));
      toast.success('Đã xóa bài đăng');
    } catch (err) {
      toast.error(err?.message || 'Xóa thất bại');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  if (error && !stats) {
    return (
      <div className="px-8 py-6">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={loadStats}
          className="mt-3 text-sm text-teal-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const recentPosts = stats?.recentPosts || [];

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cập nhật lúc {updatedAt.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <ArrowClockwise size={15} weight="light" className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tổng bài đăng"
          value={stats?.totalPosts ?? 0}
          subtitle="Tất cả bài đang hiển thị"
          icon={Article}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <MetricCard
          label="Mất đồ"
          value={stats?.totalLostPosts ?? 0}
          subtitle="Bài đăng loại mất"
          icon={XCircle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <MetricCard
          label="Nhặt được"
          value={stats?.totalFoundPosts ?? 0}
          subtitle="Bài đăng loại nhặt"
          icon={CheckCircle}
          iconBg="bg-green-50"
          iconColor="text-green-500"
        />
        <MetricCard
          label="Tỉ lệ thành công"
          value={`${stats?.successRate ?? '0.0'}%`}
          subtitle={`${stats?.resolvedPosts ?? 0} bài đã giải quyết`}
          icon={Trophy}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Bài đăng 30 ngày qua
          </h3>
          <div className="h-72">
            <Line data={lineData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Theo danh mục
          </h3>
          <div className="h-72 flex items-center justify-center">
            {categoryLabels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-sm text-gray-400">Chưa có dữ liệu danh mục</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Bài đăng gần nhất</h3>
          <NavLink to="/admin/posts" className="text-xs text-teal-600 hover:underline">
            Xem tất cả →
          </NavLink>
        </div>

        {recentPosts.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500">Chưa có bài đăng nào.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentPosts.map((post) => {
              const postType = post.type || post.post_type;
              return (
                <div
                  key={post.id}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      postType === 'lost'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {postType === 'lost' ? 'MẤT' : 'NHẶT'}
                  </span>

                  <span className="flex-1 text-sm text-gray-900 truncate">{post.title}</span>

                  <span className="text-xs text-gray-400 hidden md:block w-32 truncate">
                    {post.user_name || post.user?.name || '—'}
                  </span>

                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </span>

                  <button
                    type="button"
                    disabled={busyId === post.id}
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-50"
                    aria-label="Xóa bài đăng"
                  >
                    <Trash size={15} weight="light" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
