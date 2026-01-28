import { useQuery } from "@tanstack/react-query";
import { api, DashboardSummary } from "../api";

export const Dashboard = () => {
  const { data, isLoading, isError } = useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get<DashboardSummary>("/attendance/dashboard-summary");
      return res.data;
    },
  });

  return (
    <section className="card">
      <div className="card-header">
        <h2>Dashboard</h2>
        <p>Overview of employees and today&apos;s attendance</p>
      </div>
      {isLoading && <p className="muted">Loading dashboard...</p>}
      {isError && <p className="error-text">Failed to load dashboard summary.</p>}
      {data && (
        <div className="dashboard-grid">
          <div className="stat">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{data.totalEmployees}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Present Today</span>
            <span className="stat-value positive">{data.presentToday}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Absent Today</span>
            <span className="stat-value negative">{data.absentToday}</span>
          </div>
        </div>
      )}
    </section>
  );
};

