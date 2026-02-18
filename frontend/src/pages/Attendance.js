import React, { useEffect, useState, useCallback } from 'react';
import { getAttendance, createAttendance, getEmployees, deleteAttendance } from '../services/api';
import {
  Button, Badge, Card, Spinner, EmptyState, ErrorState,
  Modal, Select, Input, Alert
} from '../components/UI';
import styles from './Attendance.module.css';

const today = new Date().toISOString().split('T')[0];

const EMPTY_FORM = { employee: '', date: today, status: 'Present' };

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMark, setShowMark] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      if (filterEmployee) params.employee_id = filterEmployee;

      const [attRes, empRes] = await Promise.all([
        getAttendance(params),
        getEmployees(),
      ]);
      setRecords(attRes.data.results);
      setEmployees(empRes.data.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStatus, filterEmployee]);

  useEffect(() => { load(); }, [load]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFormErrors(fe => ({ ...fe, [e.target.name]: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    if (!form.employee) {
      setFormErrors({ employee: 'Please select an employee.' });
      setSubmitting(false);
      return;
    }
    try {
      await createAttendance({ ...form, employee: parseInt(form.employee) });
      setShowMark(false);
      setAlert({ type: 'success', msg: 'Attendance marked successfully!' });
      load();
    } catch (err) {
      const errors = err.response?.data?.errors || {};
      if (Object.keys(errors).length > 0) {
        const flat = {};
        Object.entries(errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : v;
        });
        setFormErrors(flat);
      } else {
        setFormErrors({ _general: err.response?.data?.detail || 'Failed to mark attendance.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteAttendance(id);
      setAlert({ type: 'success', msg: 'Attendance record deleted.' });
      load();
    } catch {
      setAlert({ type: 'error', msg: 'Failed to delete record.' });
    } finally {
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterStatus('');
    setFilterEmployee('');
  };

  const hasFilters = filterDate || filterStatus || filterEmployee;
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Attendance</h1>
          <p className={styles.subtitle}>
            {records.length} records — {presentCount} present, {absentCount} absent
          </p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowMark(true); }} icon={<PlusIcon />}>
          Mark Attendance
        </Button>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>
      )}

      {/* Filters */}
      <Card>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Filter by Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Employee</label>
            <select
              className={styles.filterSelect}
              value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear filters ✕
            </button>
          )}
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className={styles.center}><Spinner size={28} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<CalIcon />}
            title="No attendance records"
            description={hasFilters ? 'Try clearing your filters.' : 'Mark attendance for employees to get started.'}
            action={hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            )}
          />
        ) : (
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.header}`}>
              <div>Employee</div>
              <div>Employee ID</div>
              <div>Department</div>
              <div>Date</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {records.map(r => (
              <div key={r.id} className={styles.row}>
                <div>
                  <div className={styles.empCell}>
                    <div className={styles.avatar}>{r.employee_name[0]}</div>
                    <span className={styles.empName}>{r.employee_name}</span>
                  </div>
                </div>
                <div><span className={styles.mono}>{r.employee_id_code}</span></div>
                <div><Badge variant="accent">{r.department}</Badge></div>
                <div className={styles.date}>{formatDate(r.date)}</div>
                <div>
                  <Badge variant={r.status === 'Present' ? 'success' : 'danger'}>
                    {r.status}
                  </Badge>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(r.id)}
                    loading={deleting === r.id}
                    icon={<TrashIcon />}
                    title="Delete record"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mark Attendance Modal */}
      <Modal
        open={showMark}
        onClose={() => setShowMark(false)}
        title="Mark Attendance"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowMark(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>Mark Attendance</Button>
          </>
        }
      >
        {formErrors._general && <Alert type="error">{formErrors._general}</Alert>}
        <Select
          label="Employee"
          name="employee"
          value={form.employee}
          onChange={handleChange}
          error={formErrors.employee}
          required
        >
          <option value="">Select employee</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
          ))}
        </Select>
        <Input
          label="Date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          error={formErrors.date}
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          error={formErrors.status}
          required
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </Select>
      </Modal>
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function CalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}
