import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, AttendanceRecord, Employee, EmployeeSummary } from "../api";
import { useMemo, useState } from "react";

type AttendanceForm = {
  employeeId: string;
  date: string;
  status: "PRESENT" | "ABSENT";
};

const todayStr = new Date().toISOString().slice(0, 10);

export const AttendanceSection = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AttendanceForm>({
    employeeId: "",
    date: todayStr,
    status: "PRESENT",
  });
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<Employee[]>("/employees");
      return res.data;
    },
  });

  const { data: attendance, isLoading: isAttendanceLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", filterEmployeeId, fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterEmployeeId) params.employeeId = filterEmployeeId;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await api.get<AttendanceRecord[]>("/attendance", { params });
      return res.data;
    },
  });

  const { data: summary } = useQuery<EmployeeSummary[]>({
    queryKey: ["attendance-summary"],
    queryFn: async () => {
      const res = await api.get<EmployeeSummary[]>("/attendance/summary/by-employee");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: AttendanceForm) => {
      const res = await api.post("/attendance", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      setError(null);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to mark attendance. Please try again.";
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }
    createMutation.mutate(form);
  };

  const filteredSummary = useMemo(() => {
    if (!summary) return [];
    if (!filterEmployeeId) return summary;
    return summary.filter((s) => s.employeeId === filterEmployeeId);
  }, [summary, filterEmployeeId]);

  return (
    <section className="card">
      <div className="card-header">
        <h2>Attendance</h2>
        <p>Mark and review daily attendance</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Employee</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            required
          >
            <option value="">Select employee</option>
            {employees?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as "PRESENT" | "ABSENT" })
            }
          >
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
        <div className="actions">
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Mark Attendance"}
          </button>
          {error && <span className="error-text">{error}</span>}
        </div>
      </form>

      <div className="filters">
        <div className="field">
          <label>Filter by employee</label>
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
          >
            <option value="">All employees</option>
            {employees?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
        <div className="field-inline">
          <div>
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label>To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <h3 className="section-subtitle">Attendance Records</h3>
        {isAttendanceLoading && <p className="muted">Loading attendance...</p>}
        {!isAttendanceLoading && !attendance?.length && (
          <p className="muted">No attendance records for the selected filters.</p>
        )}
        {!!attendance?.length && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>
                    {a.employee.fullName} ({a.employee.employeeId})
                  </td>
                  <td>{a.employee.department}</td>
                  <td>
                    <span
                      className={
                        a.status === "PRESENT"
                          ? "badge badge-success"
                          : "badge badge-danger"
                      }
                    >
                      {a.status === "PRESENT" ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-wrapper">
        <h3 className="section-subtitle">Total Present Days per Employee</h3>
        {!filteredSummary?.length && (
          <p className="muted">No summary available yet. Mark some attendance first.</p>
        )}
        {!!filteredSummary?.length && (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Total Present</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map((s) => (
                <tr key={s.employeeId}>
                  <td>
                    {s.fullName} ({s.employeeCode})
                  </td>
                  <td>{s.department}</td>
                  <td>{s.totalPresent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

