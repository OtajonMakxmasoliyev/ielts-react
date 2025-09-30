// src/lib/axiosConfig.ts
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://ielts-fssg.onrender.com", // 🔗 Backend API base URL
    timeout: 10000, // 10 soniya
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Agar auth token kerak bo‘lsa interceptor qo‘shib qo‘yish mumkin
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // yoki sessionStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔁 Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Xato logikasi
        if (error.response?.status === 401) {
            console.warn("Unauthorized! Please login again.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
