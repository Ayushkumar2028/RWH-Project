import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.assessment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-6 shadow border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">No result found</h1>
            <p className="text-slate-600 mb-5">Please complete the assessment flow first.</p>
            <button
              onClick={() => navigate("/assessment")}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white"
            >
              Go to Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { assessment } = state;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 md:p-8">
            <p className="text-sm uppercase tracking-wide opacity-80 mb-2">
              Assessment Result
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Rooftop Rainwater Harvesting Report
            </h1>
            <p className="text-slate-300 mt-3 text-sm md:text-base">
              AI-generated analysis based on hydrology, terrain, and soil data for your selected location.
            </p>
          </div>

          <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Site Information</h2>
                <div className="space-y-3 text-sm">
                  <p><span className="font-semibold">Location:</span> 
                      <span className="break-words">{assessment.location_name || "Not selected"}</span>
                    </p>
                  <p><span className="font-semibold">Rooftop Area:</span> {assessment.rooftop_area} m²</p>
                  <p><span className="font-semibold">Rainfall Estimate:</span> {assessment.rainfall_estimate}</p>
                  <p><span className="font-semibold">Polygon Points:</span> {assessment.polygon_coordinates?.length || 0}</p>
                  <p><span className="font-semibold">Assessment ID:</span> {assessment.id}</p>
                  <p><span className="font-semibold">Matched Grid:</span> {assessment.grid_latitude}, {assessment.grid_longitude}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Prediction Summary</h2>
                <div className="space-y-3 text-sm">
                  <p><span className="font-semibold">Hydrology Zone:</span> {assessment.hydrology_zone}</p>
                  <p><span className="font-semibold">Estimated Annual RWH Potential:</span> {assessment.annual_potential} liters/year</p>
                  <p><span className="font-semibold">Recommended Tank Size:</span> {assessment.recommended_tank_size}</p>
                  <p><span className="font-semibold">Recharge Feasibility:</span> {assessment.recharge_feasibility}</p>
                  <p><span className="font-semibold">Suggested Structure:</span> {assessment.structure_type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Engineering Interpretation</h2>
                <p className="text-sm text-slate-700 leading-7">
                  {assessment.engineering_note || "No engineering note available."}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Terrain & Soil Details</h2>
                <div className="space-y-3 text-sm">
                  <p><span className="font-semibold">Sand %:</span> {assessment.soil_sand_pct}</p>
                  <p><span className="font-semibold">Clay %:</span> {assessment.soil_clay_pct}</p>
                  <p><span className="font-semibold">Slope (deg):</span> {assessment.slope_deg} deg</p>
                  <p><span className="font-semibold">Ruggedness TRI:</span> {assessment.ruggedness_tri} index</p>
                  <p><span className="font-semibold">Max Dry Days:</span> {assessment.max_dry_days} days</p>
                  <p><span className="font-semibold">Peak Daily Rainfall:</span> {assessment.peak_daily_mm} mm/day</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Polygon Coordinates
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({assessment.polygon_coordinates?.length || 0} points)
                  </span>
                </h2>
                <div className="max-h-64 overflow-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-slate-600">#</th>
                        <th className="px-3 py-2 font-semibold text-slate-600">Latitude</th>
                        <th className="px-3 py-2 font-semibold text-slate-600">Longitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(assessment.polygon_coordinates || []).map((pt, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-3 py-1.5 text-slate-400 font-mono">{i + 1}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-700">{pt.lat}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-700">{pt.lng}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/assessment"
              className="px-5 py-3 rounded-xl bg-slate-900 text-white text-center font-semibold"
            >
              Back to Assessment
            </Link>

            {assessment.pdf_report_url ? (
              <a
                href={assessment.pdf_report_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-green-600 text-white text-center font-semibold"
              >
                Download PDF Report
              </a>
            ) : (
              <button
                className="px-5 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold cursor-not-allowed"
                disabled
              >
                PDF Not Available
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
