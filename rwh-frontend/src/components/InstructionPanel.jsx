function InstructionPanel() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-3">How to use</h2>

      <div className="space-y-3 text-sm text-slate-700">
        <div className="p-3 rounded-xl bg-white border border-blue-100">
          <span className="font-semibold">Step 1:</span> Search your location or move the map manually.
        </div>
        <div className="p-3 rounded-xl bg-white border border-blue-100">
          <span className="font-semibold">Step 2:</span> Zoom into the rooftop clearly.
        </div>
        <div className="p-3 rounded-xl bg-white border border-blue-100">
          <span className="font-semibold">Step 3:</span> Use the polygon tool to draw the rooftop boundary.
        </div>
        <div className="p-3 rounded-xl bg-white border border-blue-100">
          <span className="font-semibold">Step 4:</span> Review area and coordinates.
        </div>
        <div className="p-3 rounded-xl bg-white border border-blue-100">
          <span className="font-semibold">Step 5:</span> Click Assess Potential to view sample results.
        </div>
      </div>
    </div>
  );
}

export default InstructionPanel;