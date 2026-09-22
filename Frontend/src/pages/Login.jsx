import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function validate(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(email, password);
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length) return;

    setLoading(true);
    const result = await login({ email: email.trim(), password });
    setLoading(false);
    if (result.ok) {
      navigate('/chat', { replace: true });
    } else {
      setSubmitError(result.message);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <header className="auth-panel__head">
          <span className="auth-panel__mark" aria-hidden="true" />
          <h1 className="auth-panel__title">Sign in</h1>
          <p className="auth-panel__subtitle">Continue to your conversations.</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {submitError ? (
            <p className="form-banner form-banner--error" role="alert">
              {submitError}
            </p>
          ) : null}

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.email ? (
              <span className="field__error">{fieldErrors.email}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.password ? (
              <span className="field__error">{fieldErrors.password}</span>
            ) : null}
          </label>

          <button type="submit" className="btn btn--primary auth-form__submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-panel__footer">
          No account? <Link to="/register">Create one</Link>
        </p>
        <p className="auth-panel__legal">
          <Link to="/terms">Terms</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/privacy">Privacy</Link>
        </p>
      </div>
    </div>
  );
}
