import { MagnifyingGlass } from '@phosphor-icons/react';

export default function SearchBar({ value, onChange }) {
  return (
    <form className="hero-search mx-auto" role="search">
      <MagnifyingGlass className="search-icon" size={22} />
      <input
        type="search"
        className="form-control form-control-lg"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm ví, thẻ sinh viên, tai nghe..."
        aria-label="Tìm kiếm bài đăng"
      />
      <button className="btn btn-primary home-primary-btn" type="submit">
        Tìm kiếm
      </button>
    </form>
  );
}
