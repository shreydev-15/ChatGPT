import { Link } from 'react-router-dom';

export default function LegalPage({ title, children }) {
  return (
    <div className="legal-shell">
      <article className="legal-doc">
        <header className="legal-doc__head">
          <Link to="/login" className="legal-doc__back">
            Back to app
          </Link>
          <h1>{title}</h1>
          <p className="legal-doc__notice">
            Placeholder text for portfolio use. Replace with counsel-reviewed policies before
            production launch.
          </p>
        </header>
        <div className="legal-doc__body">{children}</div>
      </article>
    </div>
  );
}
