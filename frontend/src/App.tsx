import { Dashboard } from "./components/Dashboard";
import { EmployeeSection } from "./components/EmployeeSection";
import { AttendanceSection } from "./components/AttendanceSection";

export const App = () => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-container">
          <h1>HRMS Lite</h1>
          <p className="subtitle">Enterprise-Ready Human Resource Management</p>
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
        <p>© 2026 HRMS Lite &middot; Built for Excellence</p>
      </footer>
    </div>
  );
};

