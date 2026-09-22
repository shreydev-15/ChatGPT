export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  const status = error.response?.status;
  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }

  return fallback;
}

export function getSocketErrorMessage(payload, fallback = 'Unable to generate a response.') {
  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  return fallback;
}
