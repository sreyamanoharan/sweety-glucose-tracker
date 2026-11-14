
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AddReading from "./pages/AddReading.jsx";
import Readings from "./pages/Readings.jsx";
import Reports from "./pages/Reports.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import DoctorPatientDetails from "./pages/DoctorPatientDetails.jsx";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "DOCTOR" ? "/doctor/dashboard" : "/dashboard"}
      replace
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={["PATIENT"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/readings/add" element={<AddReading />} />
              <Route path="/readings" element={<Readings />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/doctor/dashboard"
                element={<DoctorDashboard />}
              />
              <Route
                path="/doctor/patients/:patientId"
                element={<DoctorPatientDetails />}
              />
            </Route>
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
