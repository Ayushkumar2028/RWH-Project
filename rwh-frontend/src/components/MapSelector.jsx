import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";

// Fix Leaflet default marker icons in Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapFlyTo({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || 17, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

function getAreaFromCoordinates(coords) {
  if (!coords || coords.length < 3) return 0;

  const ring = coords.map((point) => [point.lng, point.lat]);
  ring.push([coords[0].lng, coords[0].lat]);

  const polygon = turf.polygon([ring]);
  const area = turf.area(polygon);

  return Number(area.toFixed(2));
}

function extractCoordinates(layer) {
  const latlngs = layer.getLatLngs?.();

  if (!latlngs || !latlngs.length) return [];

  const points = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;

  return points.map((point) => ({
    lat: Number(point.lat.toFixed(6)),
    lng: Number(point.lng.toFixed(6)),
  }));
}

function GeomanControls({ setPolygonData, setArea, mapRef }) {
  const map = useMap();
  const createdLayerRef = useRef(null);

  useEffect(() => {
    mapRef.current = map;

    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
      oneBlock: false,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
    });

    const handleCreate = (e) => {
      if (createdLayerRef.current && createdLayerRef.current !== e.layer) {
        map.removeLayer(createdLayerRef.current);
      }

      createdLayerRef.current = e.layer;

      const coordinates = extractCoordinates(e.layer);
      setPolygonData(coordinates);
      setArea(getAreaFromCoordinates(coordinates));
    };

    const handleEdit = (e) => {
      if (e.layer) {
        const coordinates = extractCoordinates(e.layer);
        setPolygonData(coordinates);
        setArea(getAreaFromCoordinates(coordinates));
        createdLayerRef.current = e.layer;
        return;
      }

      e.layers?.eachLayer?.((layer) => {
        const coordinates = extractCoordinates(layer);
        setPolygonData(coordinates);
        setArea(getAreaFromCoordinates(coordinates));
        createdLayerRef.current = layer;
      });
    };

    const handleRemove = () => {
      createdLayerRef.current = null;
      setPolygonData([]);
      setArea(0);
    };

    map.on("pm:create", handleCreate);
    map.on("pm:edit", handleEdit);
    map.on("pm:remove", handleRemove);

    return () => {
      map.off("pm:create", handleCreate);
      map.off("pm:edit", handleEdit);
      map.off("pm:remove", handleRemove);

      try {
        map.pm.removeControls();
      } catch {
        // ignore cleanup issues
      }
    };
  }, [map, setPolygonData, setArea, mapRef]);

  return null;
}

function MapActionButtons({ mapRef }) {
  const enablePolygon = () => {
    const map = mapRef.current;
    if (!map) return;

    map.pm.disableDraw();
    map.pm.enableDraw("Polygon", {
      snappable: true,
      allowSelfIntersection: false,
      pathOptions: {
        color: "#2563eb",
        fillColor: "#60a5fa",
        fillOpacity: 0.35,
      },
    });
  };

  const stopDrawing = () => {
    const map = mapRef.current;
    if (!map) return;
    map.pm.disableDraw();
  };

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={enablePolygon}
        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium"
      >
        Polygon Mode
      </button>

      <button
        type="button"
        onClick={stopDrawing}
        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-sm font-medium"
      >
        Stop Drawing
      </button>
    </div>
  );
}

function MapSelector({ setPolygonData, area, setArea, searchedLocation }) {
  const mapRef = useRef(null);

  return (
    <div className="w-full">
      <MapActionButtons mapRef={mapRef} />

      <MapContainer
        center={[28.6139, 77.209]}
        zoom={18}
        minZoom={5}
        maxZoom={22}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        scrollWheelZoom={true}
        className="h-[60vh] md:h-[650px] w-full rounded-2xl z-0 shadow border border-slate-200"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxNativeZoom={19}
          maxZoom={22}
        />

        {searchedLocation && <MapFlyTo center={searchedLocation} zoom={17} />}

        <GeomanControls
          setPolygonData={setPolygonData}
          setArea={setArea}
          mapRef={mapRef}
        />
      </MapContainer>

      <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p>
          Use the Geoman toolbar on the left for polygon/edit/remove, or click{" "}
          <strong>Polygon Mode</strong> above.
        </p>
        <p className="mt-1">
          Drawn area:{" "}
          <span className="font-semibold text-slate-800">
            {area > 0 ? `${area.toLocaleString("en-IN", { maximumFractionDigits: 2 })} m²` : "—"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default MapSelector;