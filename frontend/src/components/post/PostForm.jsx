import { useRef, useState } from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import {
  POST_TYPE,
  ITEM_CATEGORIES,
  LOCATIONS,
} from '../../utils/constants.js';
import ImageUpload from '../common/ImageUpload.jsx';

export const INITIAL_VALUES = {
  type: '',
  title: '',
  category: '',
  description: '',
  date: '',
  location: '',
  specific_location: '',
  images: [],
};

const today = () => new Date().toISOString().slice(0, 10);

function validate(v) {
  const errors = {};
  if (!v.type) errors.type = 'Vui lòng chọn loại bài đăng';
  if (!v.title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
  if (!v.category) errors.category = 'Vui lòng chọn danh mục';
  if (!v.date) errors.date = 'Vui lòng chọn ngày';
  else if (v.date > today()) errors.date = 'Ngày không được ở tương lai';
  if (!v.location) errors.location = 'Vui lòng chọn khu vực';
  return errors;
}

const FIELD_ORDER = ['type', 'title', 'category', 'date', 'location'];

export default function PostForm({ values, onChange, onSubmit, loading }) {
  const [errors, setErrors] = useState({});
  const refs = {
    type: useRef(null),
    title: useRef(null),
    category: useRef(null),
    date: useRef(null),
    location: useRef(null),
  };

  const set = (k, v) => onChange({ ...values, [k]: v });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = FIELD_ORDER.find((k) => errs[k]);
      const node = refs[first]?.current;
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof node.focus === 'function') setTimeout(() => node.focus(), 250);
      }
      return;
    }
    onSubmit(values);
  };

  const inputCls = (key) =>
    `w-full text-sm bg-white border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
      errors[key]
        ? 'border-red-500 focus:border-red-500'
        : 'border-gray-200 focus:border-accent'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* SECTION 1 — Type */}
      <Section title="Loại bài đăng" required>
        <div ref={refs.type} className="grid grid-cols-2 gap-3">
          <TypeCard
            active={values.type === POST_TYPE.LOST}
            onClick={() => set('type', POST_TYPE.LOST)}
            dot="bg-status-lost"
            label="Mất đồ"
            hint="Tôi bị mất đồ và cần tìm lại"
          />
          <TypeCard
            active={values.type === POST_TYPE.FOUND}
            onClick={() => set('type', POST_TYPE.FOUND)}
            dot="bg-status-found"
            label="Nhặt được"
            hint="Tôi nhặt được đồ của ai đó"
          />
        </div>
        {errors.type && <ErrorText>{errors.type}</ErrorText>}
      </Section>

      {/* SECTION 2 — Item info */}
      <Section title="Thông tin đồ vật">
        <Field label="Tiêu đề" required error={errors.title}>
          <input
            ref={refs.title}
            type="text"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="VD: Mất ví da màu đen có CCCD"
            className={inputCls('title')}
          />
        </Field>

        <Field label="Danh mục" required error={errors.category}>
          <select
            ref={refs.category}
            value={values.category}
            onChange={(e) => set('category', e.target.value)}
            className={inputCls('category')}
          >
            <option value="">-- Chọn danh mục --</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Mô tả chi tiết" hint="Màu sắc, đặc điểm nhận dạng, dấu hiệu riêng...">
          <textarea
            rows={4}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Mô tả càng chi tiết, khả năng tìm lại càng cao."
            className={`${inputCls('description')} resize-none`}
          />
        </Field>
      </Section>

      {/* SECTION 3 — Time & location */}
      <Section title="Thời gian & Địa điểm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ngày" required error={errors.date}>
            <input
              ref={refs.date}
              type="date"
              value={values.date}
              max={today()}
              onChange={(e) => set('date', e.target.value)}
              className={inputCls('date')}
            />
          </Field>

          <Field label="Khu vực" required error={errors.location}>
            <select
              ref={refs.location}
              value={values.location}
              onChange={(e) => set('location', e.target.value)}
              className={inputCls('location')}
            >
              <option value="">-- Chọn khu vực --</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Địa điểm cụ thể" hint="Ví dụ: Thư viện tầng 2, bàn góc phải">
          <input
            type="text"
            value={values.specific_location}
            onChange={(e) => set('specific_location', e.target.value)}
            placeholder="Mô tả vị trí chính xác hơn (không bắt buộc)"
            className={inputCls('specific_location')}
          />
        </Field>
      </Section>

      {/* SECTION 4 — Images */}
      <Section title="Ảnh" hint="Tối đa 5 ảnh — sẽ được tải lên khi bạn nhấn Đăng bài">
        <ImageUpload
          files={values.images}
          onChange={(files) => set('images', files)}
          maxFiles={5}
        />
      </Section>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading && <CircleNotch size={16} weight="light" className="animate-spin" />}
        {loading ? 'Đang đăng...' : 'Đăng bài'}
      </button>
    </form>
  );
}

function Section({ title, hint, required, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-medium text-gray-900">
          {title}
          {required && <span className="text-status-lost"> *</span>}
        </h2>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-status-lost"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }) {
  return <p className="text-xs text-red-600">{children}</p>;
}

function TypeCard({ active, onClick, dot, label, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl ${
        active
          ? 'border-2 border-accent bg-accent-light/50'
          : 'border-2 border-transparent ring-1 ring-gray-200 hover:ring-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </button>
  );
}
