import React from 'react';
import styles from './UI.module.css';

// Button
export function Button({ children, variant = 'primary', size = 'md', loading, icon, ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]} ${loading ? styles.loading : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : icon ? (
        <span className={styles.btnIcon}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// Badge
export function Badge({ children, variant = 'default' }) {
  return (
    <span className={`${styles.badge} ${styles[`badge-${variant}`]}`}>
      {children}
    </span>
  );
}

// Card
export function Card({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}

// Stat card
export function StatCard({ label, value, sub, color = 'accent', icon }) {
  return (
    <div className={`${styles.statCard} ${styles[`stat-${color}`]}`}>
      {icon && <div className={styles.statIcon}>{icon}</div>}
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 24 }) {
  return (
    <svg
      className={styles.spinnerSvg}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
    </svg>
  );
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <div className={styles.emptyTitle}>{title}</div>
      {description && <div className={styles.emptyDesc}>{description}</div>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

// Error state
export function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className={styles.errorTitle}>Something went wrong</div>
      <div className={styles.errorMsg}>{message}</div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}

// Input
export function Input({ label, error, required, ...props }) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}

// Select
export function Select({ label, error, required, children, ...props }) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''}`} {...props}>
        {children}
      </select>
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={styles.modalClose} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

// Toast / Alert inline
export function Alert({ type = 'info', children, onClose }) {
  const variants = {
    success: styles.alertSuccess,
    error: styles.alertError,
    warning: styles.alertWarning,
    info: styles.alertInfo,
  };
  return (
    <div className={`${styles.alert} ${variants[type]}`}>
      <span className={styles.alertContent}>{children}</span>
      {onClose && (
        <button className={styles.alertClose} onClick={onClose}>×</button>
      )}
    </div>
  );
}
