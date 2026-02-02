const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
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

export async function getProductsPaginated(page = 1, limit = 10) {
    try {
        const data = await fetchAPI(`/products/paginated?page=${page}&limit=${limit}`);
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
        weight: parseFloat(productData.weight) || null,
        price: parseFloat(productData.price)
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
        price: parseFloat(productData.price)
    };
    return await fetchAPI(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
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

export async function searchProducts(query) {
    try {
        const products = await fetchAPI(`/products/search/query?query=${encodeURIComponent(query)}`);
        return mapProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

export async function getProductsByBrand(brandId) {
    try {
        const products = await fetchAPI(`/products/brand/${brandId}`);
        return mapProducts(products);
    } catch (error) {
        console.error('Error fetching products by brand:', error);
        return [];
    }
}

export async function getProductsByCategory(categoryId) {
    try {
        const products = await fetchAPI(`/products/category/${categoryId}`);
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

function mapProduct(p) {
    return {
        id: p.id,
        name: p.productName,
        sku: `PROD-${p.id}`,
        category: p.product_category?.category || 'General',
        categoryId: p.productCategoryId,
        brand: p.brand?.brand || 'No Brand',
        brandId: p.brandId,
        price: p.price,
        stock: p.quantity,
        description: p.description,
        weight: p.weight,
        images: p.images || [],
        image: p.images?.[0]?.productImg || null,
        status: p.isActive ? 'active' : 'archived',
        unit: 'pcs',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        isFeatured: p.isFeatured
    };
}

function mapProducts(products) {
    if (!products || !Array.isArray(products)) return [];
    return products.map(p => mapProduct(p));
}
