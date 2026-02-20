const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('jsmart_token');
    }
    return null;
};


async function fetchAPI(endpoint, options = {}) {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Handle 401 Unauthorized or 403 Forbidden (No token provided) - clear auth and redirect to login
        if (response.status === 401 || response.status === 403) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jsmart_token');
                localStorage.removeItem('jsmart_user');
                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
}

export const productService = {
    getAll: () => fetchAPI('/products'),
    getById: (id) => fetchAPI(`/products/${id}`),
    create: (data) => fetchAPI('/products', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id, data) => fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
    uploadImage: (productId, formData) => fetchAPI(`/products/${productId}/images`, {
        method: 'POST',
        body: formData
    }),
};


export const stockService = {
    getAllBatches: () => fetchAPI('/stock-batches'),
    getBatchesByProduct: (productId) => fetchAPI(`/stock-batches/product/${productId}`),
    addBatch: (data) => fetchAPI('/stock-batches', { method: 'POST', body: JSON.stringify(data) }),
    updateBatch: (id, data) => fetchAPI(`/stock-batches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBatch: (id) => fetchAPI(`/stock-batches/${id}`, { method: 'DELETE' }),
};

export const supplierService = {
    getAll: () => fetchAPI('/suppliers'),
    getById: (id) => fetchAPI(`/suppliers/${id}`),
    create: (data) => fetchAPI('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/suppliers/${id}`, { method: 'DELETE' }),
};

export const stockLogService = {
    getAll: () => fetchAPI('/stock-logs'),
    getPaginated: (page = 1, limit = 10) => fetchAPI(`/stock-logs/paginated?page=${page}&limit=${limit}`),
    getPending: () => fetchAPI('/stock-logs/pending'),
    adjust: (data) => fetchAPI('/stock-logs/adjust', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    approve: (id, approved) => fetchAPI(`/stock-logs/approve/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ approved })
    }),
};



export const categoryService = {
    getAll: () => fetchAPI('/product-categories'),
    create: (data) => fetchAPI('/product-categories', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id, data) => fetchAPI(`/product-categories/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id) => fetchAPI(`/product-categories/${id}`, { method: 'DELETE' }),
};


export const brandService = {
    getAll: () => fetchAPI('/brands'),
    create: (data) => fetchAPI('/brands', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id, data) => fetchAPI(`/brands/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id) => fetchAPI(`/brands/${id}`, { method: 'DELETE' }),
};

export const userRoleService = {
    getAll: () => fetchAPI('/user-roles'),
    getById: (id) => fetchAPI(`/user-roles/${id}`),
    create: (data) => fetchAPI('/user-roles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/user-roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/user-roles/${id}`, { method: 'DELETE' }),
};

export const promotionService = {
    getAll: () => fetchAPI('/promotions'),
    getByLevel: (level) => fetchAPI(`/promotions/level/${level}`),
    create: (data) => fetchAPI('/promotions', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id, data) => fetchAPI(`/promotions/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id) => fetchAPI(`/promotions/${id}`, { method: 'DELETE' }),
};

export const offerService = {
    getAll: () => fetchAPI('/offers'),
    getById: (id) => fetchAPI(`/offers/${id}`),
    create: (data) => fetchAPI('/offers', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id, data) => fetchAPI(`/offers/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id) => fetchAPI(`/offers/${id}`, { method: 'DELETE' }),
};

export const offerTypeService = {
    getAll: () => fetchAPI('/offer-types'),
};

export const couponService = {
    getAll: () => fetchAPI('/coupons'),
    getById: (id) => fetchAPI(`/coupons/${id}`),
    create: (data) => fetchAPI('/coupons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/coupons/${id}`, { method: 'DELETE' }),
    validate: (code, amount) => fetchAPI('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),
};



export const authService = {
    login: async (emailAddress, password) => {
        const response = await fetchAPI('/users/login', {
            method: 'POST',
            body: JSON.stringify({ emailAddress, password }),
        });
        if (response.token) {
            localStorage.setItem('jsmart_token', response.token);
            localStorage.setItem('jsmart_user', JSON.stringify(response.user));
        }
        return response;
    },
    logout: () => {
        localStorage.removeItem('jsmart_token');
        localStorage.removeItem('jsmart_user');
    },
    forgotPassword: async (emailAddress) => {
        const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailAddress }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
        return data;
    },
    resetPassword: async (emailAddress, otp, newPassword) => {
        const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailAddress, otp, newPassword }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to reset password');
        return data;
    },
    isAuthenticated: () => {
        return !!getAuthToken();
    },
    getCurrentUser: () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('jsmart_user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }
};

export const orderService = {
    getAll: () => fetchAPI('/orders'),
    getById: (id) => fetchAPI(`/orders/${id}`),
    update: (id, data) => fetchAPI(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getByStatus: (status) => fetchAPI(`/orders/status/${status}`),
};

export const userService = {
    getAll: () => fetchAPI('/users'),
    getById: (id) => fetchAPI(`/users/${id}`),
    create: (data) => fetchAPI('/users/register', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),
};

export const orderTrackingService = {
    getByOrderId: (orderId) => fetchAPI(`/order-tracking/order/${orderId}`),
    updateStatus: (data) => fetchAPI('/order-tracking', { method: 'POST', body: JSON.stringify(data) }),
};

export const refundService = {
    getAll: () => fetchAPI('/refunds'),
    getById: (id) => fetchAPI(`/refunds/${id}`),
    updateStatus: (id, status, adminComment) => fetchAPI(`/refunds/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminComment })
    }),
};

export const refundTrackingService = {
    getByRefundId: (refundId) => fetchAPI(`/refund-tracking/refund/${refundId}`),
};

export const dashboardService = {
    getSummary: (year) => fetchAPI(`/dashboard/summary${year ? `?year=${year}` : ''}`),
};

export const analyticsService = {
    getSummary: (range = '7d') => fetchAPI(`/analytics/summary?range=${encodeURIComponent(range)}`),
};

export const settingsService = {
    getAll: () => fetchAPI('/settings'),
    updateShop: (data) => fetchAPI('/settings/shop', { method: 'PUT', body: JSON.stringify(data) }),
    updateStoreSettings: (items) => fetchAPI('/settings/store-settings', { method: 'PUT', body: JSON.stringify(items) }),
    uploadLogo: (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        return fetchAPI('/settings/logo', {
            method: 'POST',
            body: formData,
        });
    },
};

export const notificationService = {
    getMy: (page = 1, limit = 15) =>
        fetchAPI(`/notifications/me?page=${page}&limit=${limit}`),
    markAsRead: (id) =>
        fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () =>
        fetchAPI('/notifications/read-all', { method: 'PATCH' }),
};

export const reviewService = {
    getAllByAdmin: () => fetchAPI('/user-reviews/all'),
    approve: (id, isApproved) => fetchAPI(`/user-reviews/${id}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ is_approved: isApproved })
    }),
};

export const contactService = {
    getAll: () => fetchAPI('/contact/messages'),
    getById: (id) => fetchAPI(`/contact/messages/${id}`),
    reply: (id, data) => fetchAPI(`/contact/messages/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    markRead: (id) => fetchAPI(`/contact/messages/${id}/read`, {
        method: 'PUT'
    }),
};

export const membershipService = {
    getPlans: () => fetchAPI('/membership/plans'),
    createPlan: (data) => fetchAPI('/membership/plans', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updatePlan: (id, data) => fetchAPI(`/membership/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deletePlan: (id) => fetchAPI(`/membership/plans/${id}`, { method: 'DELETE' }),
    subscribe: (data) => fetchAPI('/membership/subscribe', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getMySubscription: () => fetchAPI('/membership/me'),
    getAllSubscriptions: () => fetchAPI('/membership/subscriptions')
};
