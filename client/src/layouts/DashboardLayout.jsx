
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ChartNoAxesCombined,
  LogOut,
  Heart,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Add Reading",
      path: "/readings/add",
      icon: PlusCircle,
    },
    {
      name: "Reading History",
      path: "/readings",
      icon: ClipboardList,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7FC] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 hidden md:flex flex-col">

        <div className="flex items-center gap-3 mb-12">
          <div className="bg-purple-100 p-3 rounded-xl">
            <Activity className="text-purple-600" size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sweety
            </h1>
            <p className="text-xs text-gray-400">
              Glucose Tracker
            </p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-purple-100 text-purple-700 font-semibold"
                      : "text-gray-500 hover:bg-gray-50"
                  }`
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t pt-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-500"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-5 md:p-8">
        <Outlet />

        <footer className="mt-10 text-center text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            Made with <Heart size={12} className="text-pink-400" /> Sweety Glucose Tracker
          </span>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
