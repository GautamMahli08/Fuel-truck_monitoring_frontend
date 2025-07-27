import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function VehicleDetail() {
  const { sensorId } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    API.get(`/vehicles/by-sensor/${sensorId}`).then((res) => setVehicle(res.data));
  }, [sensorId]);

  if (!vehicle) return <p className="p-4">Loading vehicle details...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Vehicle Detail</h2>
      <ul className="space-y-2">
        <li><strong>Vehicle Number:</strong> {vehicle.vehicle_number}</li>
        <li><strong>Sensor ID:</strong> {vehicle.sensor_id}</li>
        <li><strong>Fuel Tank Capacity:</strong> {vehicle.fuel_tank_capacity} L</li>
        <li><strong>Assigned Driver:</strong> {vehicle.assigned_driver}</li>
        <li><strong>Owner Email:</strong> {vehicle.client_email}</li>
        <li><strong>Owner Company:</strong> {vehicle.company_name}</li>
        <li><strong>Contact Number:</strong> {vehicle.contact_number}</li>
        <li><strong>Location:</strong> {vehicle.location}</li>
      </ul>
    </div>
  );
}