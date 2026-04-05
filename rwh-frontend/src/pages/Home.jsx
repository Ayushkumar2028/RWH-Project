import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const stats = [
  { value: "1.5B+", label: "Litres saved annually via RWH" },
  { value: "60%", label: "Of India is water-stressed" },
  { value: "600M", label: "People face high/extreme water stress" },
  { value: "2min", label: "Average assessment time" },
];

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              AI-Powered Water Conservation
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
              Rooftop Rainwater<br />
              <span className="text-blue-600">Harvesting Potential</span> Assessment
            </h1>

            <p className="text-slate-600 text-base md:text-lg mb-6 leading-7">
              Select a location on the map, draw the rooftop polygon, get an
              AI-powered estimate of rainwater harvesting potential, and download a
              detailed PDF report.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/assessment"
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-center font-semibold shadow hover:bg-slate-700"
              >
                Start Assessment →
              </Link>

              <a
                href="#how-it-works"
                className="px-6 py-3 rounded-2xl bg-white text-slate-800 text-center font-semibold border border-slate-300 hover:bg-slate-100"
              >
                See Workflow
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Application Flow</h2>

            <div className="space-y-3">
              {[
                { step: "1", title: "Select Location", desc: "Search a place or navigate directly on map." },
                { step: "2", title: "Draw Rooftop Polygon", desc: "Mark rooftop boundary accurately using the polygon tool." },
                { step: "3", title: "AI Prediction", desc: "Polygon sent to backend — ML model estimates RWH potential." },
                { step: "4", title: "Download PDF Report", desc: "Full report includes RWH potential, tank suggestions, soil & terrain data." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                    {step}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm text-blue-100 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          How it works
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Four simple steps from rooftop to report.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { num: "01", title: "Search Site", desc: "Find your rooftop area using the location search or GPS." },
            { num: "02", title: "Draw Roof", desc: "Use the polygon tool to capture rooftop geometry on satellite map." },
            { num: "03", title: "Analyze", desc: "System calculates area and AI model estimates annual potential." },
            { num: "04", title: "Get Report", desc: "Review results and download the detailed PDF report instantly." },
          ].map(({ num, title, desc }) => (
            <div key={num} className="bg-white rounded-2xl p-5 shadow border border-slate-200 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-blue-600 mb-3">{num}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        <p>RWH Assess — AI-Powered Rainwater Harvesting Assessment Tool</p>
        <p className="mt-1 text-xs">Built with React, Django, Leaflet &amp; a Random Forest ML model trained on Indian hydrology data.</p>
      </footer>
    </div>
  );
}

export default Home;