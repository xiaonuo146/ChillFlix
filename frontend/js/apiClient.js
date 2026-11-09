import { CONFIG } from './config.js';

const BASE_URL = CONFIG.API_BASE_URL || 'http://localhost:5000';

async function fetchAPI(endpoint, { method = 'GET', body = null } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('chillflix_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
    return data;
}

export const API = {
    // Auth
    login: (email, password) => fetchAPI('/api/auth/login', { method: 'POST', body: { email, password } }),
    register: (payload) => fetchAPI('/api/auth/register', { method: 'POST', body: payload }),
    getMe: () => fetchAPI('/api/auth/me'),

    // Phim TMDB
    getTrendingMovies: () => fetchAPI('/api/movies/trending'),
    getMovieDetail: (id) => fetchAPI(`/api/movies/${id}`),
    getMovieCredits: (id) => fetchAPI(`/api/movies/${id}/credits`),
    getSimilarMovies: (id) => fetchAPI(`/api/movies/${id}/similar`),
    getMovieTrailer: (id) => fetchAPI(`/api/movies/${id}/trailer`),

    // Đặt phòng
    createBooking: (payload) => fetchAPI('/api/bookings', { method: 'POST', body: payload }),
    confirmPayment: (bookingCode) => fetchAPI('/api/bookings/confirm-payment', { method: 'POST', body: { bookingCode } }),
    getTicket: (code) => fetchAPI(`/api/bookings/ticket/${code}`),
    getMyBookings: () => fetchAPI('/api/bookings/my'),
    cancelBooking: (code) => fetchAPI(`/api/bookings/cancel/${code}`, { method: 'PATCH' }),

    // Admin
    getAdminBookings: () => fetchAPI('/api/admin/bookings'),
    checkinBooking: (code) => fetchAPI(`/api/admin/bookings/${code}/checkin`, { method: 'PATCH' })
};

export const api = API;
export default API;