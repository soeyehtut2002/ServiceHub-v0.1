const STATUS_CONFIG = {
  pending:    { label: 'Pending',    className: 'badge-warning', icon: '⏳' },
  confirmed:  { label: 'Confirmed',  className: 'badge-primary', icon: '✅' },
  completed:  { label: 'Completed',  className: 'badge-success', icon: '🎉' },
  cancelled:  { label: 'Cancelled',  className: 'badge-danger',  icon: '❌' },
  paused:     { label: 'Paused',     className: 'badge-muted',   icon: '⏸️' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-muted', icon: '•' };
  return (
    <span className={`badge ${config.className}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default StatusBadge;
