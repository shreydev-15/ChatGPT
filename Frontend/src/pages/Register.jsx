import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function validate(form) {
  const errors = {};
  if (!form.firstname.trim()) errors.firstname = 'First name is required.';
  if (!form.lastname.trim()) errors.lastname = 'Last name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) errors.password = 'Password is required.';
  else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length) return;

    setLoading(true);
    const result = await register({
      fullname: {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
      },
      email: form.email.trim(),
      password: form.password,
    });
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
          <h1 className="auth-panel__title">Create account</h1>
          <p className="auth-panel__subtitle">Register to save chats on the server.</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {submitError ? (
            <p className="form-banner form-banner--error" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="field-row">
            <label className="field">
              <span className="field__label">First name</span>
              <input
                className="field__input"
                autoComplete="given-name"
                value={form.firstname}
                onChange={(e) => setField('firstname', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.firstname ? (
                <span className="field__error">{fieldErrors.firstname}</span>
              ) : null}
            </label>
            <label className="field">
              <span className="field__label">Last name</span>
              <input
                className="field__input"
                autoComplete="family-name"
                value={form.lastname}
                onChange={(e) => setField('lastname', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.lastname ? (
                <span className="field__error">{fieldErrors.lastname}</span>
              ) : null}
            </label>
          </div>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
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
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              disabled={loading}
            />
            {fieldErrors.password ? (
              <span className="field__error">{fieldErrors.password}</span>
            ) : null}
          </label>

          <button type="submit" className="btn btn--primary auth-form__submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="auth-panel__footer">
          Already have an account? <Link to="/login">Sign in</Link>
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
