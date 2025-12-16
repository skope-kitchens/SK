import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function Map() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView(
      [20.5937, 78.9629],
      5
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstance.current);

    mapInstance.current.on("click", (e) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
      reverseGeocode(lat, lng);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const updateMarker = (lat, lng) => {
    if (markerRef.current) {
      mapInstance.current.removeLayer(markerRef.current);
    }

    markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current);
    mapInstance.current.setView([lat, lng], 13);

    setSelectedLocation({ lat, lng, address: "Loading..." });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      setSelectedLocation({
        lat,
        lng,
        address:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.display_name,
      });
    } catch (err) {
      console.error("Reverse geocode error:", err);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    updateMarker(lat, lng);

    setSelectedLocation({
      lat,
      lng,
      address: result.display_name,
    });

    setSearchQuery("");
    setShowResults(false);
  };

  const confirmLocation = () => {
    if (!selectedLocation) return;
    console.log("Confirmed location:", selectedLocation);
    alert(`Location confirmed:\n${selectedLocation.address}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-gray-300 rounded-3xl w-full max-w-3xl p-8 space-y-6">

        <h1 className="text-3xl font-bold text-center">
          Delivery Location
        </h1>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center bg-white rounded-lg border-2 border-gray-300 focus-within:border-blue-600">
            <input
              type="text"
              placeholder="Search location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchLocation()}
              className="flex-1 px-4 py-3 outline-none text-sm"
            />
            <button
              onClick={searchLocation}
              className="px-4 text-gray-600 hover:text-blue-600"
            >
              🔍
            </button>
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 bg-white w-full border rounded-b-lg shadow max-h-60 overflow-auto">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 flex gap-2"
                >
                  📍 <span>{r.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="text-center font-semibold text-lg">
          Leaflet Map
        </div>

        <div className="h-[300px] rounded-xl overflow-hidden shadow">
          <div ref={mapRef} className="h-full w-full" />
        </div>

        {/* Selected location */}
        <div className="bg-gray-700 rounded-lg p-5 text-center text-white min-h-[80px] flex items-center justify-center">
          {selectedLocation ? (
            <div>
              <p className="font-medium mb-1">
                {selectedLocation.address}
              </p>
              <p className="text-xs text-gray-300">
                {selectedLocation.lat.toFixed(4)},{" "}
                {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          ) : (
            <p className="text-gray-300">Enter your location</p>
          )}
        </div>

        {/* Confirm */}
        <button
          onClick={confirmLocation}
          className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-800 transition active:scale-95"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
