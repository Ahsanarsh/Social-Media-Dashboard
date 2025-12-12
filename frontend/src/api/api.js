import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling errors (e.g., token expiration -> logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Handle global errors like 401 Unauthorized
    // if (error.response && error.response.status === 401) {
    //   // Dispatch logout action or redirect
    // }
    return Promise.reject(error);
  }
);

export default api;
