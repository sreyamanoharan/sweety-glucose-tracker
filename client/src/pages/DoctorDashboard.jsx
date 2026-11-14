
import { useEffect, useState } from "react";
import { Users, UserPlus, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientEmail, setPatientEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const response = await api.get("/doctor/patients");
      setPatients(response.data.patients);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!patientEmail.trim()) {
      setError("Please enter a patient email.");
      return;
    }

    setAssigning(true);

    try {
      const response = await api.post("/doctor/patients", {
        patientEmail: patientEmail.trim(),
      });

      setMessage(response.data.message);
      setPatientEmail("");
      await fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign patient.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-sm text-purple-600 font-medium">Doctor Portal</p>
        <h1 className="text-3xl font-bold text-gray-800 mt-1">
          Doctor Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your assigned patients and review their glucose reports.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-purple-100 p-3 rounded-xl">
            <UserPlus className="text-purple-600" size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Assign a Patient</h2>
            <p className="text-sm text-gray-500">
              Enter the registered patient's email address.
            </p>
          </div>
        </div>

        <form onSubmit={handleAssignPatient} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            placeholder="patient@example.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
          />

          <button
            type="submit"
            disabled={assigning}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3 font-medium disabled:opacity-50"
          >
            {assigning ? "Assigning..." : "Assign Patient"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-green-600 mt-3">{message}</p>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Assigned Patients
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Patients connected to your account.
            </p>
          </div>

          <div className="bg-purple-100 p-3 rounded-xl">
            <Users className="text-purple-600" size={22} />
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Total patients: <span className="font-semibold text-gray-800">{patients.length}</span>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading patients...</p>
        ) : patients.length === 0 ? (
          <div className="text-center py-10">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="font-medium text-gray-700">No patients assigned yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Assign a patient using their registered email address.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <Activity className="text-purple-600" size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium text-sm"
                >
                  View Reports
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
