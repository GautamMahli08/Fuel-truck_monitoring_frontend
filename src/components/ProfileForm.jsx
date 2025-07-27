import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import '../index.css'; 

export default function ProfileForm() {
  const [form, setForm] = useState({
    vehicle_number: "",
    sensor_id: "",
    fuel_tank_capacity: "",
    assigned_driver: "",
  });
  const [vehicles, setVehicles] = useState([]);
  const mapRef = useRef(null);
  const polygonRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const map = mapRef.current;
    if (!map || !polygonRef.current)
      return alert("Draw a geofence polygon first");

    const latlngs = polygonRef.current.getLatLngs()[0];
    const geofence = latlngs.map((point) => ({ lat: point.lat, lng: point.lng }));

    try {
      await API.post("/vehicles/register", { ...form, geofence });
      alert("Vehicle registered successfully");
      setForm({
        vehicle_number: "",
        sensor_id: "",
        fuel_tank_capacity: "",
        assigned_driver: "",
      });
      fetchVehicles();
    } catch (err) {
      alert("Error: " + err.response?.data?.detail || "Something went wrong");
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await API.get("/vehicles/my");
      setVehicles(res.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const DrawControl = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: true,
          marker: false,
          circle: false,
          polyline: false,
          rectangle: false,
        },
        edit: { featureGroup: drawnItems },
      });

      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e) => {
        drawnItems.clearLayers();
        polygonRef.current = e.layer;
        drawnItems.addLayer(polygonRef.current);
      });
    }, [map]);

    return null;
  };

  const handleVehicleClick = (sensorId) => {
    navigate("/dashboard", { state: { selectedSensorId: sensorId } });
  };
 return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-gray-800 shadow-[0_0_80px_15px_rgba(0,0,255,0.15)] space-y-16">

        {/* Top Nav */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:shadow-indigo-400 transition-all duration-300"
          >
            🎯 Dashboard
          </button>
          <button
            onClick={logout}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:shadow-pink-400 transition-all duration-300"
          >
            🚪 Logout
          </button>
        </div>

        {/* Vehicle Form */}
        <div>
          <h2 className="text-4xl font-extrabold text-pink-500 mb-6 drop-shadow">🚗 Register Your Vehicle</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-gray-700"
          >
            {["vehicle_number", "sensor_id", "fuel_tank_capacity", "assigned_driver"].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                className="p-4 bg-transparent border border-gray-500 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            ))}
            <button
              type="submit"
              className="col-span-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 font-semibold rounded-md hover:scale-105 hover:shadow-green-400 transition-all duration-300"
            >
              🚀 Register Vehicle
            </button>
          </form>
        </div>

        {/* Geofence Section */}
        <div>
          <h3 className="text-3xl font-bold text-cyan-400 mb-4">📍 Draw Geofence</h3>
          <div className="rounded-xl overflow-hidden border-2 border-cyan-500 shadow-md">
            <MapContainer
              center={[23.6913, 85.2722]}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DrawControl />
            </MapContainer>
          </div>
        </div>

        {/* Registered Vehicles */}
        {vehicles.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold text-purple-400 mb-6">🎬 My Registered Vehicles</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  onClick={() => handleVehicleClick(v.sensor_id)}
                  className="cursor-pointer p-6 bg-white/10 border border-gray-700 backdrop-blur-lg rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300"
                >
                  <h4 className="text-xl font-bold text-white mb-2">🚛 {v.vehicle_number}</h4>
                  <p className="text-sm text-gray-300">👤 Driver: {v.assigned_driver}</p>
                  <p className="text-sm text-gray-300">🛰️ Sensor: {v.sensor_id}</p>
                  <p className="text-sm text-gray-300">⛽ Fuel Capacity: {v.fuel_tank_capacity}L</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}