import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Trash } from '@phosphor-icons/react';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/formatDate.js';
import Badge from '../../components/common/Badge.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const METRIC_CARDS = [
  { key: 'totalPosts', label: 'Tổng bài đăng' },
  { key: 'lostPosts', label: 'Mất đồ' },
  { key: 'foundPosts', label: 'Nhặt được' },
  { key: 'resolvedRate', label: 'Đã tìm thấy', suffix: '%' },
];

const DOUGHNUT_PALETTE = ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#cbd5e1', '#94a3b8', '#64748b', '#475569'];

export default function Dashboard() {
  useDocumentTitle('Admin · Tổng quan');
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let mounted = true;
    adminService
      .getStats()
      .then((res) => mounted && setStats(res?.data || res))
      .catch((e) => mounted && setError(e?.message || 'Không tải được thống kê'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const lineData = useMemo(() => {
    const series = stats?.dailyPosts || [];
    return {
      labels: series.map((d) => formatDate(d.date)),
      datasets: [
        { label: 'Mất đồ', data: series.map((d) => d.lost ?? 0), borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', tension: 0.3, fill: true },
        { label: 'Nhặt được', data: series.map((d) => d.found ?? 0), borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', tension: 0.3, fill: true },
      ],
    };
  }, [stats]);

  const doughnutData = useMemo(() => {
    const cats = stats?.categories || [];
    return {
      labels: cats.map((c) => c.name),
      datasets: [{ data: cats.map((c) => c.count), backgroundColor: DOUGHNUT_PALETTE.slice(0, cats.length), borderWidth: 0 }],
    };
  }, [stats]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài đăng này?')) return;
    setBusyId(id);
    try {
      await adminService.deletePost(id);
      setStats((s) => ({ ...s, recentPosts: (s?.recentPosts || []).filter((p) => p.id !== id) }));
      toast.success('Đã xóa bài đăng');
    } catch (e) {
      toast.error(e?.message || 'Xóa thất bại');
    } finally { setBusyId(null); }
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  const recent = stats?.recentPosts || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Tổng quan</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {METRIC_CARDS.map((m) => (
          <div key={m.key} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{m.label}</p>
            <p className="font-mono text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
              {stats?.[m.key] ?? 0}{m.suffix || ''}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Bài đăng 30 ngày qua</h2>
          <div className="h-64">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { maxTicksLimit: 8 } } } }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Tỉ lệ theo danh mục</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, cutout: '60%' }} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Bài đăng mới nhất</h2>
          <Link to="/admin/posts" className="text-xs text-accent hover:underline">Xem tất cả</Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">Chưa có bài đăng nào.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((p) => (
              <li key={p.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/posts/${p.id}`} className="block text-sm text-gray-900 hover:text-accent truncate">{p.title}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span>{p.user?.name || p.userName || '—'}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span>{p.date ? formatDate(p.date) : ''}</span>
                  </p>
                </div>
                <Badge type={p.type} />
                <button type="button" disabled={busyId === p.id} onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-50" title="Xóa">
                  <Trash size={16} weight="light" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 bg-white border border-gray-200 rounded-xl" />))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 bg-white border border-gray-200 rounded-xl" />
        <div className="h-72 bg-white border border-gray-200 rounded-xl" />
      </div>
      <div className="h-48 bg-white border border-gray-200 rounded-xl" />
    </div>
  );
}
