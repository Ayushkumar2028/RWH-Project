import { useState } from "react";

function SearchBox({
  onSearch,
  onUseCurrentLocation,
  loading,
  locationLoading,
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-3 bg-white rounded-2xl p-3 shadow border border-slate-200"
    >
      <input
        type="text"
        placeholder="Search location, city, building, or address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={locationLoading}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-60"
        >
          {locationLoading ? "Locating..." : "Use My Current Location"}
        </button>
      </div>
    </form>
  );
}

export default SearchBox;