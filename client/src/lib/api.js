const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload.message || "Request failed", response.status, payload);
  }

  return payload;
};

export const apiRequest = async (path, { method = "GET", token, body } = {}) => {
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(
      "Cannot connect to backend server. Please start backend and check VITE_API_URL.",
      { cause: error }
    );
  }

  return parseResponse(response);
};

export { API_URL };
