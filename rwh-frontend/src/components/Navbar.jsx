import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <header className="sticky top-0 z-[1000] bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg md:text-xl font-bold text-slate-900">
          RWH Assess
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link to="/assessment" className={navLinkClass("/assessment")}>
            Start
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;