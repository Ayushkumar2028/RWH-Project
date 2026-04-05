import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-8xl font-bold text-slate-200 mb-4">404</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist. Perhaps you refreshed mid-session?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-center hover:bg-slate-700"
          >
            Back to Home
          </Link>
          <Link
            to="/assessment"
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-center hover:bg-blue-700"
          >
            Start Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
