
import { useEffect, useState } from "react";
import { Pencil, Trash2, LoaderCircle, X, Save } from "lucide-react";
import api from "../services/api";

const SLOT_LABELS = {
  MORNING: "Morning fasting",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

const SLOTS = Object.entries(SLOT_LABELS);

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  const value = new Date(date);
  return new Date(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate()
  ).toLocaleDateString("en-IN");
};

const getDateInputValue = (date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(
    value.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
};

export default function Readings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReading, setEditingReading] = useState(null);
  const [form, setForm] = useState({
    date: "",
    slot: "MORNING",
    value: "",
  });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalReadings, setTotalReadings] = useState(0);

const limit = 5;

  const fetchReadings = async (page = currentPage) => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/readings?page=${page}&limit=${limit}`
    );

    setReadings(response.data.readings || []);
    setCurrentPage(response.data.currentPage);
    setTotalPages(response.data.totalPages);
    setTotalReadings(response.data.totalReadings);
  } catch (err) {
    setError(
      err.response?.data?.message || "Failed to load readings."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchReadings(currentPage);
}, [currentPage]);

  const handleEdit = (reading) => {
    setEditingReading(reading);
    setForm({
      date: getDateInputValue(reading.date),
      slot: reading.slot,
      value: String(reading.value),
    });
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");

    const value = Number(form.value);

    if (form.value.trim() === "" || !Number.isInteger(value) || value < 40 || value > 600) {
      setError("Enter a whole number between 40 and 600 mg/dL.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    if (form.date > getToday()) {
      setError("Future dates are not allowed.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/readings/${editingReading.id}`, {
        date: form.date,
        slot: form.slot,
        value,
      });

      setEditingReading(null);
      await fetchReadings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update reading.");
    } finally {
      setSaving(false);
    }
  };

 const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this reading?"
  );

  if (!confirmed) return;

  try {
    setError("");
    await api.delete(`/readings/${id}`);

    if (readings.length === 1 && currentPage > 1) {
      setCurrentPage((previous) => previous - 1);
    } else {
      await fetchReadings(currentPage);
    }
  } catch (err) {
    setError(
      err.response?.data?.message || "Failed to delete reading."
    );
  }
}; 

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="animate-spin text-teal-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Glucose Readings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your glucose history.
          </p>
        </div>

        <a
          href="/readings/add"
          className="rounded-lg bg-teal-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-teal-700"
        >
          + Add Reading
        </a>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {editingReading && (
        <form
          onSubmit={handleUpdate}
          className="space-y-4 rounded-xl border border-teal-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Edit Glucose Reading
            </h2>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                max={getToday()}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Time slot
              </label>
              <select
                value={form.slot}
                onChange={(e) =>
                  setForm({ ...form, slot: e.target.value })
                }
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-teal-500"
              >
                {SLOTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Glucose value (mg/dL)
              </label>
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      )}

      {readings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="font-semibold text-slate-700">No readings yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add your first glucose reading to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Time slot</th>
                  <th className="px-6 py-4 font-semibold">Glucose level</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                      {formatDate(reading.date)}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {SLOT_LABELS[reading.slot] || reading.slot}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                      {reading.value}{" "}
                      <span className="font-normal text-slate-500">
                        mg/dL
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(reading)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                          title="Edit reading"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(reading.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete reading"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row">
  <p className="text-sm text-slate-500">
    Showing {readings.length} of {totalReadings} readings
  </p>

  <div className="flex items-center gap-3">
    <button
      onClick={() => setCurrentPage((page) => page - 1)}
      disabled={currentPage === 1}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Previous
    </button>

    <span className="text-sm font-medium text-slate-700">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() => setCurrentPage((page) => page + 1)}
      disabled={currentPage >= totalPages}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next
    </button>
  </div>
</div>
        </div>
        
      )}
    </div>
  );
}
