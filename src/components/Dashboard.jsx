import '../index.css'; 
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedSensorId = location.state?.selectedSensorId || null;

  const [vehicle, setVehicle] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [fuelHistory, setFuelHistory] = useState([]);
  const mapRef = useRef(null);

  const fetchLatestSensor = async (sensorId) => {
    try {
      const res = await API.get(`/sensor/latest/${sensorId}`);
      setSensorData(res.data);
      setFuelHistory((prev) => [
        ...prev.slice(-19),
        {
          fuel_level: res.data.fuel_level,
          time: new Date(res.data.timestamp).toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.warn("No sensor data for", sensorId);
    }
  };

  const fetchVehicle = useCallback(async () => {
    try {
      const res = await API.get("/vehicles/my");
      const found = res.data.find((v) => v.sensor_id === selectedSensorId);
      if (found) {
        setVehicle(found);
        fetchLatestSensor(found.sensor_id);
      }
    } catch (err) {
      console.error("Error loading vehicle:", err);
    }
  }, [selectedSensorId]);

  useEffect(() => {
    fetchVehicle();

    const ws = new WebSocket(
      `ws://localhost:8000/ws/alerts?token=${localStorage.getItem("token")}`
    );
    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      if (!selectedSensorId || alert.sensor_id === selectedSensorId) {
        setAlerts((prev) => [alert, ...prev]);
        fetchLatestSensor(alert.sensor_id);
      }
    };

    return () => ws.close();
  }, [fetchVehicle, selectedSensorId]);

  const defaultPosition = [23.6913, 85.2722];
  const focusedPosition = sensorData
    ? [sensorData.latitude, sensorData.longitude]
    : defaultPosition;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-400 drop-shadow">🛰️ Fleet Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-md hover:scale-105 transition shadow-md"
            >
              Profile
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="px-5 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-md hover:scale-105 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border-2 border-blue-600 shadow-lg">
          <MapContainer
            center={focusedPosition}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "400px", width: "100%" }}
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {vehicle && sensorData && (
              <Marker
                key={vehicle.sensor_id}
                position={[sensorData.latitude, sensorData.longitude]}
                icon={L.icon({
                  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535137.png",
                  iconSize: [35, 35],
                })}
              >
                <Popup>
                  <strong>{vehicle.vehicle_number}</strong><br />
                  Driver: {vehicle.assigned_driver}<br />
                  Fuel: {sensorData.fuel_level}%<br />
                  Tilt: {sensorData.tilt_detected ? "Yes" : "No"}<br />
                  Valve Open: {sensorData.valve_open ? "Yes" : "No"}<br />
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Alerts */}
        <div>
          <h2 className="text-2xl font-semibold text-red-400 mb-4">🚨 Live Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {alerts.map((a, idx) => {
              const alertType = a.alert.toLowerCase();
              let icon = "🛠️";
              let bgStyle = "from-sky-100 to-sky-300 border-sky-200 text-sky-900";

              if (alertType.includes("fuel")) {
                icon = "🔥";
                bgStyle = "from-rose-100 to-rose-300 border-rose-200 text-rose-900";
              } else if (alertType.includes("deviation") || alertType.includes("geofence")) {
                icon = "🚧";
                bgStyle = "from-green-100 to-green-200 border-yellow-200 text-yellow-700";
              }

              return (
                <div
                  key={idx}
                  className={`p-4 bg-gradient-to-br ${bgStyle} border rounded-lg shadow-md hover:shadow-lg transition`}
                >
                  <p className="text-lg font-bold">{icon} {a.alert}</p>
                  <p className="text-sm">Sensor: {a.sensor_id}</p>
                  <p className="text-xs">⏱ {new Date(a.timestamp).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fuel Chart */}
        <div>
          <h2 className="text-2xl font-semibold text-green-400 mb-4">⛽ Fuel Level Over Time</h2>
          <div className="bg-white/5 p-4 rounded-xl border border-green-700">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fuelHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis domain={[0, 100]} stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="fuel_level" stroke="#00ffcc" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
