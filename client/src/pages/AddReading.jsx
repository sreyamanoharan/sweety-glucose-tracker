
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArrowLeft, Save } from "lucide-react";
import api from "../services/api.js";

const getToday = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};

const AddReading = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: getToday(),
    slot: "",
    value: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const slots = [
    { value: "MORNING", label: "Morning (fasting)" },
    { value: "AFTER_BREAKFAST", label: "After breakfast" },
    { value: "AFTER_LUNCH", label: "After lunch" },
    { value: "AFTER_DINNER", label: "After dinner" },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.value) {
      setError("Please enter a glucose value.");
      return;
    }

    const value = Number(form.value);

    if (
      !Number.isInteger(value) ||
      value < 40 ||
      value > 600
    ) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    if (form.date > getToday()) {
      setError("Date cannot be in the future.");
      return;
    }

    if (!form.slot) {
      setError("Please select a time slot.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/readings", {
        date: form.date,
        slot: form.slot,
        value,
      });

      setSuccess("Glucose reading added successfully!");

      setForm({
        date: getToday(),
        slot: "",
        value: "",
      });

      setTimeout(() => {
        navigate("/readings");
      }, 1000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save glucose reading."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-purple-100 p-4 rounded-xl">
            <Activity className="text-purple-600" size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add Glucose Reading
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Record your blood glucose measurement.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reading Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              max={getToday()}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time Slot
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, slot: slot.value })
                  }
                  className={`p-4 rounded-xl border text-left transition ${
                    form.slot === slot.value
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <span className="font-medium">
                    {slot.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Glucose Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Glucose Value (mg/dL)
            </label>

            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="Enter value (40–600)"
              min="40"
              max="600"
              step="1"
              className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-400"
              required
            />

            <p className="text-xs text-gray-400 mt-2">
              Enter a whole number between 40 and 600 mg/dL.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-60"
          >
            <Save size={19} />
            {loading ? "Saving..." : "Save Reading"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddReading;
