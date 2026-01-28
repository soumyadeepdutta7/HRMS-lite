import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export type Employee = {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  createdAt: string;
  employee: Employee;
};

export type EmployeeSummary = {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  department: string;
  totalPresent: number;
};

export type DashboardSummary = {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
};

