import LegalPage from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        When you register or sign in, the backend stores your name, email address, and a hashed
        password in MongoDB. Authentication uses a JWT issued by the server, typically stored in
        an HTTP cookie and optionally sent as a Bearer token for API and Socket.IO requests.
      </p>
      <p>
        Conversations and message content are stored in MongoDB and associated with your user
        account. The backend may also generate vector embeddings and store them in Pinecone for
        retrieval-augmented responses, as implemented in the server code.
      </p>
      <p>
        AI replies are generated through the backend&apos;s configured Google GenAI integration.
        Do not submit secrets or sensitive personal data you are not willing to store in these
        systems.
      </p>
      <p>
        Log out to clear the session cookie on the server response path provided by the backend.
        For a production deployment, data export and deletion practices should be documented here
        after legal review.
      </p>
    </LegalPage>
  );
}
