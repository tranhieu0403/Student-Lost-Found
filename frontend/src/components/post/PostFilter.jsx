import { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, CaretDown } from '@phosphor-icons/react';
import {
  POST_TYPE,
  ITEM_CATEGORIES,
  LOCATIONS,
} from '../../utils/constants.js';

const TYPE_TABS = [
  { value: '', label: 'Tất cả', dot: null },
  { value: POST_TYPE.LOST, label: 'Mất đồ', dot: 'bg-status-lost' },
  { value: POST_TYPE.FOUND, label: 'Nhặt được', dot: 'bg-status-found' },
];

export default function PostFilter({ value, onChange, searchValue, onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="sticky top-12 md:top-14 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
        {/* Row 1 — Type tabs */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
          {TYPE_TABS.map((tab) => {
            const active = (value.type || '') === tab.value;
            return (
              <button
                key={tab.value || 'all'}
                type="button"
                onClick={() => update({ type: tab.value })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                  active
                    ? 'bg-accent-light border-accent text-accent-hover'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                {tab.label}
              </button>
            );
          })}

          {/* Mobile filter toggle pushed to the right */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600"
          >
            <FunnelSimple size={14} weight="light" />
            Bộ lọc
            <CaretDown
              size={12}
              weight="light"
              className={`${mobileOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Row 2 — dropdowns + search */}
        <div
          className={`flex-col md:flex md:flex-row md:items-center gap-2 ${
            mobileOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          <SelectField
            value={value.category || ''}
            onChange={(v) => update({ category: v })}
            placeholder="Danh mục"
            options={ITEM_CATEGORIES}
          />
          <SelectField
            value={value.location || ''}
            onChange={(v) => update({ location: v })}
            placeholder="Khu vực"
            options={LOCATIONS}
          />
          <input
            type="date"
            value={value.date || ''}
            onChange={(e) => update({ date: e.target.value })}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
          />

          <div className="md:ml-auto relative w-full md:w-56 md:focus-within:w-72 transition-[width] duration-200 ease-smooth">
            <MagnifyingGlass
              size={16}
              weight="light"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full text-sm bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectField({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
