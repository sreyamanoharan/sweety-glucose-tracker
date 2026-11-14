
import { useEffect, useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartReadings, setChartReadings] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/reports/daily", {
          params: { date: getToday() },
        });

        setReport(response.data);
        const readingsResponse = await api.get(
  "/readings?page=1&limit=50"
);

const chartData = [...readingsResponse.data.readings]
  .reverse()
  .map((reading) => ({
    ...reading,
    dateLabel: new Date(reading.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
  }));

setChartReadings(chartData);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Highest Reading",
      value: report?.highest ?? "--",
      unit: "mg/dL",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Lowest Reading",
      value: report?.lowest ?? "--",
      unit: "mg/dL",
      icon: TrendingDown,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Average Reading",
      value: report?.average ?? "--",
      unit: "mg/dL",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total Readings",
      value: report?.totalReadings ?? 0,
      unit: "readings today",
      icon: CalendarDays,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const slotLabels = {
    MORNING: "Morning (fasting)",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">
            Your personal health dashboard
          </p>

          <h1 className="text-3xl font-bold text-gray-800 mt-1">
            Hello, {user?.name || "there"}!
          </h1>

          <p className="text-gray-500 mt-2">
            Here's your glucose summary for today.
          </p>
        </div>

        <Link
          to="/readings/add"
          className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition"
        >
          <PlusCircle size={19} />
          Add Reading
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-5">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <Icon className={stat.color} size={21} />
                </div>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">
                  {loading ? "..." : stat.value}
                </span>

                <span className="text-xs text-gray-400">
                  {stat.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>


{/* Glucose Trend Chart */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
  <div className="mb-6">
    <h2 className="text-lg font-bold text-gray-800">
      Glucose Trend
    </h2>
    <p className="text-sm text-gray-400 mt-1">
      Your recent glucose measurements
    </p>
  </div>

  {loading ? (
    <p className="text-center text-gray-400 py-12">
      Loading chart...
    </p>
  ) : chartReadings.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartReadings}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 12 }}
        />

        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 12 }}
          label={{
            value: "mg/dL",
            angle: -90,
            position: "insideLeft",
          }}
        />

        <Tooltip
          formatter={(value) => [`${value} mg/dL`, "Glucose"]}
          labelFormatter={(_, payload) => {
            const reading = payload?.[0]?.payload;
            return reading
              ? `${reading.dateLabel} - ${
                  slotLabels[reading.slot] || reading.slot
                }`
              : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#9333ea"
          strokeWidth={3}
          dot={{ r: 5, fill: "#9333ea" }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-center text-gray-400 py-12">
      Add glucose readings to see your trend chart.
    </p>
  )}
</div>


      {/* Today's readings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Today's Readings
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Your recorded glucose measurements
            </p>
          </div>

          <Link
            to="/readings"
            className="text-purple-600 text-sm font-semibold flex items-center gap-1"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 py-8 text-center">
            Loading readings...
          </p>
        ) : report?.readings?.length > 0 ? (
          <div className="space-y-3">
            {report.readings.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-4"
              >
                <div>
                  <p className="font-medium text-gray-700">
                    {slotLabels[reading.slot] || reading.slot}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(reading.date).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold text-gray-800">
                    {reading.value}
                  </span>

                  <span className="text-xs text-gray-400 ml-1">
                    mg/dL
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="text-purple-500" size={27} />
            </div>

            <h3 className="font-semibold text-gray-700">
              No readings yet
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              You haven't recorded any readings today.
            </p>

            <Link
              to="/readings/add"
              className="inline-flex items-center gap-2 text-purple-600 font-semibold mt-5"
            >
              Add your first reading <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
