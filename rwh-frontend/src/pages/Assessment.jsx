import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBox from "../components/SearchBox";
import InstructionPanel from "../components/InstructionPanel";
import MapSelector from "../components/MapSelector";
import api from "../services/api";

function Assessment() {
  const navigate = useNavigate();

  const [polygonData, setPolygonData] = useState([]);
  const [area, setArea] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [assessing, setAssessing] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (query) => {
    try {
      setError("");
      setSearchLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&accept-language=en`
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        setError("Location not found. Try a more specific search.");
        return;
      }

      const firstResult = data[0];
      const lat = parseFloat(firstResult.lat);
      const lon = parseFloat(firstResult.lon);

      setSearchedLocation([lat, lon]);
      setLocationName(firstResult.display_name || "");
    } catch (err) {
      console.error(err);
      setError("Failed to search location.");
    } finally {
      setSearchLoading(false);
    }
  };

  const reverseGeocodeEnglishName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
      );
      const data = await response.json();
      return data?.display_name || "";
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return "";
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setSearchedLocation([lat, lon]);

        reverseGeocodeEnglishName(lat, lon)
          .then((placeName) => {
            if (placeName) {
              setLocationName(placeName);
            } else {
              setLocationName(`Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`);
            }
          })
          .catch((err) => {
            console.error(err);
            setLocationName(`Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`);
          })
          .finally(() => {
            setLocationLoading(false);
          });
      },
      (geoError) => {
        console.error(geoError);

        if (geoError.code === 1) {
          setError("Location permission denied. Please allow location access.");
        } else if (geoError.code === 2) {
          setError("Unable to detect your location.");
        } else if (geoError.code === 3) {
          setError("Location request timed out.");
        } else {
          setError("Failed to get current location.");
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const getPolygonCentroid = (polygon) => {
    const lat = polygon.reduce((sum, point) => sum + point.lat, 0) / polygon.length;
    const lng = polygon.reduce((sum, point) => sum + point.lng, 0) / polygon.length;
    return { lat, lng };
  };

  const handleAssess = async () => {
    if (polygonData.length < 3) return;

    try {
      setAssessing(true);
      setError("");

      let finalLocationName = locationName;

      if (!finalLocationName) {
        const centroid = getPolygonCentroid(polygonData);
        finalLocationName = await reverseGeocodeEnglishName(
          centroid.lat,
          centroid.lng
        );
      }

      const payload = {
        location_name: finalLocationName,
        polygon_coordinates: polygonData,
        rooftop_area: area,
      };

      const response = await api.post("/assessments/create/", payload);

      navigate("/result", {
        state: {
          assessment: response.data,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to create assessment. Make sure backend is running.");
    } finally {
      setAssessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Assessment Workspace</h1>
          <p className="text-slate-600 mt-2">
            Search a location or use your current location, then draw rooftop polygon.
          </p>
        </div>

        <div className="mb-5">
          <SearchBox
            onSearch={handleSearch}
            onUseCurrentLocation={handleUseCurrentLocation}
            loading={searchLoading}
            locationLoading={locationLoading}
          />

          {locationName && (
            <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
              <span className="font-semibold">Selected location:</span> {locationName}
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-6 order-2 lg:order-1">
            <InstructionPanel />

            {/* Live area display */}
            {area > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Polygon Drawn</p>
                <p className="text-2xl font-bold text-slate-900">
                  {area.toLocaleString("en-IN", { maximumFractionDigits: 2 })} m²
                </p>
                <p className="text-xs text-slate-500 mt-1">{polygonData.length} coordinate points</p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 shadow border border-slate-200">
              <button
                onClick={handleAssess}
                disabled={polygonData.length < 3 || assessing}
                className="w-full px-5 py-4 rounded-2xl bg-slate-900 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assessing ? "Analyzing..." : polygonData.length < 3 ? "Draw a Polygon First" : "Assess Potential"}
              </button>

              {polygonData.length >= 3 && (
                <p className="text-xs text-green-600 mt-3 text-center font-medium">✓ Polygon ready — click to assess</p>
              )}
              {polygonData.length < 3 && (
                <p className="text-xs text-slate-500 mt-3 text-center">Draw a rooftop polygon on the map first.</p>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <MapSelector
              setPolygonData={setPolygonData}
              area={area}
              setArea={setArea}
              searchedLocation={searchedLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assessment;