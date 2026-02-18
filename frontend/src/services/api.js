import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Employees
export const getEmployees = () => api.get('/employees/');
export const createEmployee = (data) => api.post('/employees/', data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}/`);
export const getEmployee = (id) => api.get(`/employees/${id}/`);

// Attendance
export const getAttendance = (params = {}) => api.get('/attendance/', { params });
export const createAttendance = (data) => api.post('/attendance/', data);
export const getEmployeeAttendance = (employeeId, params = {}) =>
  api.get(`/employees/${employeeId}/attendance/`, { params });
export const deleteAttendance = (id) => api.delete(`/attendance/${id}/`);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}/`, data);

// Dashboard
export const getDashboard = () => api.get('/dashboard/');

export default api;
