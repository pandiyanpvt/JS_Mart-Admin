const API_BASE_URL = "https://js-mart-backend-production.up.railway.app/api";

function getAuthToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('jsmart_token');
    }
    return null;
}

async function fetchAPI(endpoint, options = {}) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jsmart_token');
                localStorage.removeItem('jsmart_user');
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

export async function getProducts() {
    try {
        const products = await fetchAPI('/products');
        return mapProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProductsPaginated(page = 1, limit = 10, statusFilter = 'Active') {
    try {
        const status = mapStatusFilterToQuery(statusFilter);
        const data = await fetchAPI(`/products/paginated?page=${page}&limit=${limit}&isActive=${status}`);
        return {
            products: mapProducts(data.products),
            totalItems: data.totalItems,
            totalPages: data.totalPages,
            currentPage: data.currentPage
        };
    } catch (error) {
        console.error('Error fetching paginated products:', error);
        return { products: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }
}

const mapStatusFilterToQuery = (statusFilter = 'Active') => {
    if (statusFilter === 'All') return 'all';
    if (statusFilter === 'Inactive') return '0';
    return '1';
};

export async function getProductById(id) {
    try {
        const p = await fetchAPI(`/products/${id}`);
        return mapProduct(p);
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

export async function saveProduct(productData) {
    const payload = {
        productName: productData.name,
        productCategoryId: parseInt(productData.categoryId) || 1,
        brandId: parseInt(productData.brandId) || 1,
        description: productData.description || productData.shortDescription,
        quantity: 0, // Stocks managed via batches
        price: parseFloat(productData.price),
        isFeatured: productData.isFeatured,
        isReturnable: productData.isReturnable
    };

    return await fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateProduct(productId, productData) {
    const payload = {
        productName: productData.name,
        productCategoryId: parseInt(productData.categoryId),
        brandId: parseInt(productData.brandId),
        description: productData.description || productData.shortDescription,
        price: parseFloat(productData.price),
        isFeatured: productData.isFeatured,
        isReturnable: productData.isReturnable
    };
    return await fetchAPI(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
}

export async function updateProductStatus(productId, nextActive) {
    return await fetchAPI(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
            isActive: !!nextActive
        })
    });
}

export async function deleteProduct(productId) {
    await fetchAPI(`/products/${productId}`, { method: 'DELETE' });
    return true;
}

export async function getCategories() {
    return await fetchAPI('/product-categories');
}

export async function getBrands() {
    return await fetchAPI('/brands');
}

export async function searchProducts(query, statusFilter = 'Active') {
    try {
        const status = mapStatusFilterToQuery(statusFilter);
        const products = await fetchAPI(`/products/search/query?query=${encodeURIComponent(query)}&isActive=${status}`);
        return mapProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

export async function getProductsByBrand(brandId, statusFilter = 'Active') {
    try {
        const status = mapStatusFilterToQuery(statusFilter);
        const products = await fetchAPI(`/products/brand/${brandId}?isActive=${status}`);
        return mapProducts(products);
    } catch (error) {
        console.error('Error fetching products by brand:', error);
        return [];
    }
}

export async function getProductsByCategory(categoryId, statusFilter = 'Active') {
    try {
        const status = mapStatusFilterToQuery(statusFilter);
        const products = await fetchAPI(`/products/category/${categoryId}?isActive=${status}`);
        return mapProducts(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }
}

export async function getProductsByPriceRange(min, max) {
    try {
        const products = await fetchAPI(`/products/price/range?min=${min}&max=${max}`);
        return mapProducts(products);
    } catch (error) {
        console.error('Error fetching products by price range:', error);
        return [];
    }
}

/** Resolves category label from various API/Sequelize JSON shapes (used by mapProduct and raw API rows). */
export function pickCategoryName(p) {
    const raw =
        p.product_category?.category ??
        p.productCategory?.category ??
        p.ProductCategory?.category;
    const s = raw != null ? String(raw).trim() : '';
    return s || 'General';
}

export function pickBrandName(p) {
    const raw = p.brand?.brand ?? p.Brand?.brand;
    const s = raw != null ? String(raw).trim() : '';
    return s || 'No Brand';
}

function mapProduct(p) {
    const isActive =
        typeof p.isActive === 'boolean'
            ? p.isActive
            : p.isActive === 1 || p.isActive === '1'
                ? true
                : typeof p.status === 'string'
                    ? p.status.toLowerCase() === 'active'
                    : true; // backend list endpoints already fetch active rows by default

    return {
        id: p.id,
        name: p.productName,
        sku: `PROD-${p.id}`,
        category: pickCategoryName(p),
        categoryId: p.productCategoryId,
        brand: pickBrandName(p),
        brandId: p.brandId,
        price: p.price,
        stock: p.quantity,
        description: p.description,
        images: p.images || [],
        image: p.images?.[0]?.productImg || null,
        status: isActive ? 'active' : 'archived',
        isActive,
        unit: 'pcs',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        isFeatured: p.isFeatured,
        isReturnable: p.isReturnable
    };
}

function mapProducts(products) {
    if (!products || !Array.isArray(products)) return [];
    return products.map(p => mapProduct(p));
}
