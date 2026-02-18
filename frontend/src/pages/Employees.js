import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, createEmployee, deleteEmployee } from '../services/api';
import {
  Button, Badge, Card, Spinner, EmptyState, ErrorState,
  Modal, Input, Select, Alert
} from '../components/UI';
import styles from './Employees.module.css';

const DEPARTMENTS = [
  'Engineering', 'Design', 'Product', 'Marketing',
  'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Customer Support',
];

const EMPTY_FORM = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEmployees();
      setEmployees(res.data.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter(e =>
    !search ||
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddOpen = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowAdd(true);
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFormErrors(fe => ({ ...fe, [e.target.name]: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    try {
      await createEmployee(form);
      setShowAdd(false);
      setAlert({ type: 'success', msg: `Employee "${form.full_name}" added successfully!` });
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
        setFormErrors({ _general: err.response?.data?.detail || 'Failed to add employee.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(deleteConfirm.id);
      setAlert({ type: 'success', msg: `Employee "${deleteConfirm.full_name}" deleted.` });
      setDeleteConfirm(null);
      load();
    } catch (err) {
      setAlert({ type: 'error', msg: 'Failed to delete employee.' });
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Employees</h1>
          <p className={styles.subtitle}>{employees.length} total employees</p>
        </div>
        <Button onClick={handleAddOpen} icon={<PlusIcon />}>Add Employee</Button>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>
      )}

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              placeholder="Search by name, ID, department, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.countLabel}>{filtered.length} results</div>
        </div>

        {loading ? (
          <div className={styles.center}><Spinner size={28} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<UserIcon />}
            title={search ? 'No matching employees' : 'No employees yet'}
            description={search ? 'Try different search terms.' : 'Add your first employee to get started.'}
            action={!search && <Button onClick={handleAddOpen}>Add Employee</Button>}
          />
        ) : (
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.header}`}>
              <div>Employee ID</div>
              <div>Name</div>
              <div>Department</div>
              <div>Email</div>
              <div>Present Days</div>
              <div>Actions</div>
            </div>
            {filtered.map(emp => (
              <div key={emp.id} className={styles.row}>
                <div>
                  <span className={styles.mono}>{emp.employee_id}</span>
                </div>
                <div>
                  <div className={styles.empName}>{emp.full_name}</div>
                </div>
                <div>
                  <Badge variant="accent">{emp.department}</Badge>
                </div>
                <div className={styles.email}>{emp.email}</div>
                <div>
                  <Badge variant="success">{emp.total_present_days} days</Badge>
                </div>
                <div className={styles.actions}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/employees/${emp.id}/attendance`)}
                  >
                    Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirm(emp)}
                    icon={<TrashIcon />}
                    title="Delete employee"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Employee"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>Add Employee</Button>
          </>
        }
      >
        {formErrors._general && (
          <Alert type="error">{formErrors._general}</Alert>
        )}
        <Input
          label="Employee ID"
          name="employee_id"
          placeholder="e.g. EMP-001"
          value={form.employee_id}
          onChange={handleChange}
          error={formErrors.employee_id}
          required
        />
        <Input
          label="Full Name"
          name="full_name"
          placeholder="e.g. Jane Smith"
          value={form.full_name}
          onChange={handleChange}
          error={formErrors.full_name}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="e.g. jane@company.com"
          value={form.email}
          onChange={handleChange}
          error={formErrors.email}
          required
        />
        <Select
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          error={formErrors.department}
          required
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Employee"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className={styles.confirmText}>
          Are you sure you want to delete <strong>{deleteConfirm?.full_name}</strong>?
          This will also delete all their attendance records. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
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
