import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Employee } from "../api";
import { useState } from "react";

type EmployeeForm = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
};

const emptyForm: EmployeeForm = {
  employeeId: "",
  fullName: "",
  email: "",
  department: "",
};

export const EmployeeSection = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<Employee[]>("/employees");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: EmployeeForm) => {
      const res = await api.post("/employees", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setForm(emptyForm);
      setError(null);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to create employee. Please try again.";
      setError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>Employees</h2>
        <p>Manage employee master data</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Employee ID</label>
          <input
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            placeholder="EMP001"
            required
          />
        </div>
        <div className="field">
          <label>Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john.doe@example.com"
            required
          />
        </div>
        <div className="field">
          <label>Department</label>
          <input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Engineering"
            required
          />
        </div>
        <div className="actions">
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Add Employee"}
          </button>
          {error && <span className="error-text">{error}</span>}
        </div>
      </form>

      <div className="table-wrapper">
        {isLoading && <p className="muted">Loading employees...</p>}
        {!isLoading && !employees?.length && (
          <p className="muted">No employees yet. Start by adding one above.</p>
        )}
        {!!employees?.length && (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.employeeId}</td>
                  <td>{e.fullName}</td>
                  <td>{e.email}</td>
                  <td>{e.department}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

