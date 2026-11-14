
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Activity,
  ClipboardList,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";
import api from "../services/api.js";

const SLOT_LABELS = {
  MORNING: "Morning fasting",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const formatDate = (date) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DoctorPatientDetails() {
  const { patientId } = useParams();

  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");
      setReport(null);

      const response = await api.get(
        `/doctor/patients/${patientId}/reports/${reportType}`,
        { params: { date: selectedDate } }
      );

      setReport(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate patient report."
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Highest",
      value: report?.highest ?? "--",
      unit: report?.highest != null ? "mg/dL" : "",
      icon: TrendingUp,
      color: "text-red-600",
      background: "bg-red-50",
    },
    {
      label: "Lowest",
      value: report?.lowest ?? "--",
      unit: report?.lowest != null ? "mg/dL" : "",
      icon: TrendingDown,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      label: "Average",
      value: report?.average ?? "--",
      unit: report?.average != null ? "mg/dL" : "",
      icon: Activity,
      color: "text-teal-600",
      background: "bg-teal-50",
    },
    {
      label: "Total Readings",
      value: report?.totalReadings ?? "--",
      unit: "",
      icon: ClipboardList,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/doctor/dashboard"
        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      <div>
        <p className="text-sm font-medium text-purple-600">Doctor Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          Patient Glucose Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View glucose readings and report summaries for this assigned patient.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">
          Generate Patient Report
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setReport(null);
                setError("");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-purple-500"
            >
              <option value="daily">Daily Report</option>
              <option value="month-to-date">Month-to-date Report</option>
              <option value="monthly">Previous Month Report</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              max={getToday()}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setReport(null);
                setError("");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading || !selectedDate}
          className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <CalendarDays size={18} />
          )}
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {report && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {reportType === "daily"
                ? "Daily Summary"
                : reportType === "month-to-date"
                  ? "Month-to-date Summary"
                  : "Previous Month Summary"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {reportType === "daily"
                ? formatDate(report.date)
                : `${formatDate(report.dateRange.from)} – ${formatDate(report.dateRange.to)}`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <div className={`rounded-lg p-2 ${item.background}`}>
                      <Icon size={19} className={item.color} />
                    </div>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-800">
                    {item.value}
                    {item.unit && (
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        {item.unit}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {report.totalReadings === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-slate-700">
                No readings found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {report.message}
              </p>
            </div>
          ) : reportType === "daily" ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800">
                  Individual Readings
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Time Slot</th>
                      <th className="px-6 py-4 font-semibold">Glucose Level</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {report.readings.map((reading) => (
                      <tr key={reading.id}>
                        <td className="px-6 py-4 text-slate-700">
                          {SLOT_LABELS[reading.slot] || reading.slot}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {reading.value} mg/dL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-800">
                Report Overview
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                This patient recorded {report.totalReadings} glucose readings
                during this reporting period.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
