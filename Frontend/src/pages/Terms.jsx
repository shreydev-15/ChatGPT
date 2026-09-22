import LegalPage from './LegalPage';

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        This application is a personal full-stack project that provides account registration,
        conversation storage, and AI-assisted messaging through a connected backend API.
      </p>
      <p>
        By using the service you agree to use it responsibly and not attempt to disrupt the
        server, other users, or integrated third-party AI and vector services used by the
        backend.
      </p>
      <p>
        The software is provided as-is for learning and demonstration. Availability, response
        quality, and data retention depend on the deployed backend configuration.
      </p>
    </LegalPage>
  );
}
