import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getEmployees, getAttendance } from '../services/api';
import { StatCard, Card, Spinner, ErrorState, Badge } from '../components/UI';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, empRes, attRes] = await Promise.all([
        getDashboard(),
        getEmployees(),
        getAttendance({ date: today }),
      ]);
      setSummary(dashRes.data);
      setRecentEmployees(empRes.data.results.slice(0, 5));
      setTodayAttendance(attRes.data.results);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  if (loading) return (
    <div className={styles.center}>
      <Spinner size={32} />
      <p className={styles.loadingText}>Loading dashboard...</p>
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={load} />;

  const notMarked = summary.total_employees - summary.total_present_today - summary.total_absent_today;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Good {getGreeting()}, Admin</h1>
          <p className={styles.pageSubtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Employees"
          value={summary.total_employees}
          color="accent"
          icon={<UserGroupIcon />}
        />
        <StatCard
          label="Present Today"
          value={summary.total_present_today}
          color="success"
          icon={<CheckIcon />}
        />
        <StatCard
          label="Absent Today"
          value={summary.total_absent_today}
          color="danger"
          icon={<XIcon />}
        />
        <StatCard
          label="Not Marked"
          value={notMarked}
          color="warning"
          sub="Attendance pending"
          icon={<ClockIcon />}
        />
      </div>

      <div className={styles.row}>
        {/* Department breakdown */}
        <Card className={styles.deptCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Departments</h2>
            <button className={styles.viewAll} onClick={() => navigate('/employees')}>
              View all →
            </button>
          </div>
          {summary.departments.length === 0 ? (
            <p className={styles.emptyMsg}>No departments yet</p>
          ) : (
            <div className={styles.deptList}>
              {summary.departments.map(d => (
                <div key={d.department} className={styles.deptRow}>
                  <div className={styles.deptName}>{d.department}</div>
                  <div className={styles.deptBar}>
                    <div
                      className={styles.deptBarFill}
                      style={{
                        width: `${Math.min(100, (d.count / summary.total_employees) * 100)}%`
                      }}
                    />
                  </div>
                  <div className={styles.deptCount}>{d.count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's attendance */}
        <Card className={styles.attCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Today's Attendance</h2>
            <button className={styles.viewAll} onClick={() => navigate('/attendance')}>
              View all →
            </button>
          </div>
          {todayAttendance.length === 0 ? (
            <p className={styles.emptyMsg}>No attendance marked today</p>
          ) : (
            <div className={styles.attList}>
              {todayAttendance.slice(0, 6).map(r => (
                <div key={r.id} className={styles.attRow}>
                  <div className={styles.attAvatar}>{r.employee_name[0]}</div>
                  <div className={styles.attInfo}>
                    <div className={styles.attName}>{r.employee_name}</div>
                    <div className={styles.attDept}>{r.department}</div>
                  </div>
                  <Badge variant={r.status === 'Present' ? 'success' : 'danger'}>
                    {r.status}
                  </Badge>
                </div>
              ))}
              {todayAttendance.length > 6 && (
                <div className={styles.moreText}>+{todayAttendance.length - 6} more</div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent employees */}
      <Card>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recent Employees</h2>
          <button className={styles.viewAll} onClick={() => navigate('/employees')}>
            View all →
          </button>
        </div>
        {recentEmployees.length === 0 ? (
          <p className={styles.emptyMsg}>No employees added yet</p>
        ) : (
          <div className={styles.table}>
            <div className={`${styles.tableRow} ${styles.tableHeader}`}>
              <div>Employee ID</div>
              <div>Name</div>
              <div>Department</div>
              <div>Email</div>
              <div>Present Days</div>
            </div>
            {recentEmployees.map(e => (
              <div key={e.id} className={styles.tableRow} onClick={() => navigate(`/employees/${e.id}/attendance`)}>
                <div><span className={styles.mono}>{e.employee_id}</span></div>
                <div>{e.full_name}</div>
                <div><Badge variant="accent">{e.department}</Badge></div>
                <div className={styles.email}>{e.email}</div>
                <div><Badge variant="success">{e.total_present_days} days</Badge></div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function UserGroupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
