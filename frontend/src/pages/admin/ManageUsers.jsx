import { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, LockOpen, Users, MagnifyingGlass } from '@phosphor-icons/react';
import adminService from '../../services/adminService.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';

const PAGE_SIZE = 20;
const GRID_COLS = 'grid grid-cols-[2fr_2fr_80px_1fr_100px_80px] gap-4';
const HEADERS = ['Người dùng', 'Email', 'Số bài', 'Ngày đăng ký', 'Trạng thái', ''];

function extractUsersPayload(res) {
  const data = res?.data ?? res;
  const users = data?.users ?? data?.items ?? (Array.isArray(data) ? data : []);
  return {
    users: Array.isArray(users) ? users : [],
    total: Number(data?.total ?? users.length ?? 0),
    totalPages: Number(data?.totalPages ?? 1),
  };
}

function LockConfirmModal({ target, onCancel, onConfirm, busy }) {
  if (!target) return null;

  const willLock = !target.is_locked;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
            willLock ? 'bg-orange-100' : 'bg-green-100'
          }`}
        >
          {willLock ? (
            <Lock size={20} className="text-orange-500" weight="light" />
          ) : (
            <LockOpen size={20} className="text-green-500" weight="light" />
          )}
        </div>
        <h3 className="text-base font-semibold text-center text-gray-900">
          {willLock ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
        </h3>
        <p className="text-sm text-gray-400 text-center mt-1">
          {willLock
            ? `Khóa tài khoản ${target.name}? Họ sẽ không thể đăng nhập.`
            : `Mở khóa tài khoản ${target.name}?`}
        </p>
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 py-2 text-white rounded-xl text-sm transition-colors active:scale-[0.98] disabled:opacity-60 ${
              willLock ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {willLock ? 'Khóa' : 'Mở khóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  useDocumentTitle('Admin · Người dùng');
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lockedFilter, setLockedFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lockTarget, setLockTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (lockedFilter !== '') params.is_locked = lockedFilter;

      const res = await adminService.getAllUsers(params);
      const payload = extractUsersPayload(res);
      setUsers(payload.users);
      setTotal(payload.total);
      setTotalPages(Math.max(1, payload.totalPages || Math.ceil(payload.total / PAGE_SIZE)));
    } catch (err) {
      setError(err?.message || 'Không tải được người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, lockedFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const computedTotalPages = useMemo(
    () => Math.max(1, totalPages || Math.ceil(total / PAGE_SIZE)),
    [total, totalPages],
  );

  const handleToggleLock = (userId, isLocked) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setLockTarget({
      id: user.id,
      name: user.name,
      is_locked: Boolean(isLocked),
    });
  };

  const confirmToggleLock = async () => {
    if (!lockTarget) return;
    const { id, is_locked: isLocked } = lockTarget;
    setBusyId(id);
    try {
      const res = await adminService.toggleLockUser(id, isLocked);
      const updated = res?.data ?? res;
      setUsers((list) =>
        list.map((u) =>
          u.id === id
            ? {
                ...u,
                is_locked: updated?.is_locked ?? (isLocked ? 0 : 1),
              }
            : u,
        ),
      );
      toast.success(isLocked ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      setLockTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="-mx-4 md:-mx-6 -mt-4 md:-mt-6">
      <div className="px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Quản lý người dùng</h1>
            <p className="text-sm text-gray-400">{total} người dùng</p>
          </div>
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-teal-50 items-center justify-center">
            <Users size={18} className="text-teal-600" weight="light" />
          </div>
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <label className="relative">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Tìm tên, email..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-64"
            />
          </label>
          <select
            value={lockedFilter}
            onChange={(e) => {
              setPage(1);
              setLockedFilter(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="0">Hoạt động</option>
            <option value="1">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="px-8 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className={`${GRID_COLS} px-5 py-3 bg-gray-50 border-b border-gray-100`}>
            {HEADERS.map((h) => (
              <span
                key={h || 'actions'}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`${GRID_COLS} px-5 py-3.5`}>
                  <div className="col-span-6 h-8 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="px-5 py-10 text-sm text-red-600 text-center">{error}</p>
          ) : users.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-500 text-center">
              Không có người dùng nào.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((user) => {
                const isLocked = Boolean(user.is_locked);
                return (
                  <div
                    key={user.id}
                    className={`${GRID_COLS} px-5 py-3.5 items-center hover:bg-gray-50 transition-colors ${
                      isLocked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                        {(user.name?.charAt(0) || '?').toUpperCase()}
                      </div>
                      <span
                        className={`text-sm font-medium text-gray-900 truncate ${
                          isLocked ? 'italic' : ''
                        }`}
                      >
                        {user.name}
                      </span>
                    </div>

                    <span className="text-sm text-gray-500 truncate">{user.email}</span>

                    <span className="text-sm font-mono text-gray-600 text-center">
                      {user.post_count ?? 0}
                    </span>

                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </span>

                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                        isLocked
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => handleToggleLock(user.id, isLocked)}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          isLocked
                            ? 'text-green-500 hover:bg-green-50'
                            : 'text-orange-400 hover:bg-orange-50'
                        }`}
                        title={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                      >
                        {isLocked ? (
                          <LockOpen size={16} weight="light" />
                        ) : (
                          <Lock size={16} weight="light" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Hiển thị {users.length} / {total} người dùng
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Trước
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  {page} / {computedTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(computedTotalPages, p + 1))}
                  disabled={page === computedTotalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LockConfirmModal
        target={lockTarget}
        onCancel={() => setLockTarget(null)}
        onConfirm={confirmToggleLock}
        busy={busyId === lockTarget?.id}
      />
    </div>
  );
}
