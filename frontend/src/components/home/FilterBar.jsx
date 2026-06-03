const TYPE_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'lost', label: 'Mất đồ' },
  { value: 'found', label: 'Nhặt được' },
];

const CATEGORIES = [
  'Tất cả danh mục',
  'Ví / Túi xách',
  'Điện thoại',
  'Thẻ sinh viên / CCCD',
  'Tai nghe',
  'Chìa khóa',
  'Sách / Tài liệu',
];

const LOCATIONS = [
  'Tất cả khu vực',
  'Thư viện',
  'Căn tin A',
  'Sân bóng',
  'Ký túc xá B3',
  'Giảng đường B2',
];

export default function FilterBar({ filters, onChange }) {
  const updateFilter = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <section className="filter-panel">
      <div className="container">
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div className="nav nav-pills flex-nowrap overflow-auto filter-tabs" aria-label="Lọc theo loại bài">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`nav-link ${filters.type === tab.value ? 'active' : ''}`}
                onClick={() => updateFilter('type', tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="row g-2 w-100 filter-controls">
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={filters.category}
                onChange={(event) => updateFilter('category', event.target.value)}
                aria-label="Danh mục"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={filters.location}
                onChange={(event) => updateFilter('location', event.target.value)}
                aria-label="Khu vực"
              >
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <input
                type="date"
                className="form-control"
                value={filters.date}
                onChange={(event) => updateFilter('date', event.target.value)}
                aria-label="Ngày đăng"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
