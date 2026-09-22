export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-state__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loading-state__label">{label}</p>
    </div>
  );
}
