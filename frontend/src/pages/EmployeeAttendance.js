import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeAttendance, getEmployee, createAttendance, deleteAttendance } from '../services/api';
import {
  Button, Badge, Card, StatCard, Spinner, EmptyState, ErrorState,
  Modal, Select, Input, Alert
} from '../components/UI';
import styles from './EmployeeAttendance.module.css';

const today = new Date().toISOString().split('T')[0];

export default function EmployeeAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMark, setShowMark] = useState(false);
  const [form, setForm] = useState({ date: today, status: 'Present' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const [empRes, attRes] = await Promise.all([
        getEmployee(id),
        getEmployeeAttendance(id, params),
      ]);
      setEmployee(empRes.data);
      setAttendance(attRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id, startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFormErrors(fe => ({ ...fe, [e.target.name]: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    try {
      await createAttendance({ ...form, employee: parseInt(id) });
      setShowMark(false);
      setAlert({ type: 'success', msg: 'Attendance marked!' });
      load();
    } catch (err) {
      const errors = err.response?.data?.errors || {};
      const flat = {};
      Object.entries(errors).forEach(([k, v]) => {
        flat[k] = Array.isArray(v) ? v[0] : v;
      });
      if (Object.keys(flat).length > 0) setFormErrors(flat);
      else setFormErrors({ _general: err.response?.data?.detail || 'Failed to mark attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recId) => {
    setDeleting(recId);
    try {
      await deleteAttendance(recId);
      setAlert({ type: 'success', msg: 'Record deleted.' });
      load();
    } catch {
      setAlert({ type: 'error', msg: 'Failed to delete.' });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className={styles.center}><Spinner size={32} /></div>
  );

  if (error) return <ErrorState message={error} onRetry={load} />;

  const rate = attendance.count > 0
    ? Math.round((attendance.total_present / attendance.count) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/employees')}>
        ← Back to Employees
      </button>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      {/* Employee header */}
      <Card className={styles.empCard}>
        <div className={styles.empHeader}>
          <div className={styles.bigAvatar}>{employee.full_name[0]}</div>
          <div className={styles.empInfo}>
            <h1 className={styles.empName}>{employee.full_name}</h1>
            <div className={styles.empMeta}>
              <span className={styles.mono}>{employee.employee_id}</span>
              <span className={styles.dot}>·</span>
              <Badge variant="accent">{employee.department}</Badge>
              <span className={styles.dot}>·</span>
              <span className={styles.email}>{employee.email}</span>
            </div>
          </div>
          <Button onClick={() => { setForm({ date: today, status: 'Present' }); setFormErrors({}); setShowMark(true); }} icon={<PlusIcon />}>
            Mark Attendance
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard label="Total Records" value={attendance.count} color="accent" />
        <StatCard label="Present Days" value={attendance.total_present} color="success" />
        <StatCard label="Absent Days" value={attendance.total_absent} color="danger" />
        <StatCard label="Attendance Rate" value={`${rate}%`} color={rate >= 75 ? 'success' : 'warning'} />
      </div>

      {/* Attendance table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Attendance Records</h2>
          <div className={styles.dateFilters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>From</label>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>To</label>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <button className={styles.clearBtn} onClick={() => { setStartDate(''); setEndDate(''); }}>
                Clear ✕
              </button>
            )}
          </div>
        </div>

        {attendance.results.length === 0 ? (
          <EmptyState
            icon={<CalIcon />}
            title="No attendance records"
            description="No records found for the selected date range."
          />
        ) : (
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.header}`}>
              <div>Date</div>
              <div>Day</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {attendance.results.map(r => (
              <div key={r.id} className={styles.row}>
                <div className={styles.dateCell}>{formatDate(r.date)}</div>
                <div className={styles.dayCell}>{getDayName(r.date)}</div>
                <div>
                  <Badge variant={r.status === 'Present' ? 'success' : 'danger'}>
                    {r.status === 'Present' ? '✓ Present' : '✗ Absent'}
                  </Badge>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={deleting === r.id}
                    onClick={() => handleDelete(r.id)}
                    icon={<TrashIcon />}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mark Modal */}
      <Modal
        open={showMark}
        onClose={() => setShowMark(false)}
        title={`Mark Attendance — ${employee.full_name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowMark(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>Mark</Button>
          </>
        }
      >
        {formErrors._general && <Alert type="error">{formErrors._general}</Alert>}
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

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getDayName(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
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
    </svg>
  );
}
