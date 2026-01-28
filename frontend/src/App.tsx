import { Dashboard } from "./components/Dashboard";
import { EmployeeSection } from "./components/EmployeeSection";
import { AttendanceSection } from "./components/AttendanceSection";

export const App = () => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>HRMS Lite</h1>
          <p className="subtitle">Lightweight HR tool for employee and attendance management</p>
        </div>
      </header>
      <main className="app-main">
        <Dashboard />
        <div className="grid-two">
          <EmployeeSection />
          <AttendanceSection />
        </div>
      </main>
      <footer className="app-footer">
        <span>HRMS Lite &middot; Demo-ready, production-focused</span>
      </footer>
    </div>
  );
};

