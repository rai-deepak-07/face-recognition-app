import axios from "axios";

import toast from "react-hot-toast";


const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/`,
});


// REQUEST INTERCEPTOR
api.interceptors.request.use(

  async (config) => {

    const access =
      localStorage.getItem(
        "access"
      );

    if (access) {

      config.headers.Authorization =
        `Bearer ${access}`;
    }

    return config;
  },

  (error) => {

    return Promise.reject(error);
  }
);


// RESPONSE INTERCEPTOR
api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    // TOKEN EXPIRED
    if (
      error.response?.status === 401
      &&
      !originalRequest._retry
      &&
      !originalRequest.url.includes(
        "token/"
      )
    ) {

      originalRequest._retry = true;

      try {

        const refresh =
          localStorage.getItem(
            "refresh"
          );

        // NO REFRESH TOKEN
        if (!refresh) {

          localStorage.clear();

          window.location.href =
            "/login";

          return;
        }

        // REFRESH ACCESS TOKEN
        const response =
          await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`,
            {
              refresh
            }
          );

        const newAccess =
          response.data.access;

        localStorage.setItem(
          "access",
          newAccess
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;

        return api(
          originalRequest
        );

      } catch (refreshError) {

        localStorage.clear();

        window.location.href =
          "/login";

        return Promise.reject(
          refreshError
        );
      }
    }

    // GLOBAL ERROR TOAST
    const message =

      error.response?.data?.detail
      ||
      error.response?.data?.error
      ||
      "Something went wrong";

    // SKIP LOGIN TOAST
    if (
      !originalRequest.url.includes(
        "token/"
      )
    ) {

      toast.error(message, {

        duration: 4000,
      });
    }

    return Promise.reject(error);
  }
);

export default api;