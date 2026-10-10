const API_BASE_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("riskshield_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Request failed. Please try again."
    );
  }

  return data;
}

export function registerUser(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("riskshield_token", data.access_token);
  return data;
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function scanTarget(target, asset_type) {
  return request("/scan", {
    method: "POST",
    body: JSON.stringify({ target, asset_type }),
  });
}

export function logoutUser() {
  localStorage.removeItem("riskshield_token");
}