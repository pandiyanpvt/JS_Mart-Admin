// Product management utilities using localStorage

const STORAGE_KEY = 'jsmart_products';

// Get all products from localStorage
export function getProducts() {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading products from localStorage:', error);
    }
    return [];
}

// Save a new product
export function saveProduct(productData) {
    if (typeof window === 'undefined') return null;
    
    try {
        const products = getProducts();
        
        // Generate ID if not provided
        const newId = products.length > 0 
            ? Math.max(...products.map(p => p.id || 0)) + 1 
            : 1;
        
        // Format price
        const price = parseFloat(productData.price) || 0;
        const comparePrice = productData.comparePrice ? parseFloat(productData.comparePrice) : null;
        
        // Create product object
        const newProduct = {
            id: newId,
            name: productData.name,
            sku: productData.sku,
            category: productData.category,
            price: price,
            comparePrice: comparePrice,
            stock: parseInt(productData.stock) || 0,
            minStock: parseInt(productData.minStock) || 0,
            description: productData.description || '',
            shortDescription: productData.shortDescription || '',
            weight: productData.weight ? parseFloat(productData.weight) : null,
            unit: productData.unit || 'kg',
            status: productData.status || 'active',
            featured: productData.featured || false,
            image: productData.image || null,
            images: productData.images || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Additional fields for compatibility with existing data structure
            sales: 0,
            revenue: `$${(price * (parseInt(productData.stock) || 0)).toFixed(2)}`,
        };
        
        products.push(newProduct);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        
        return newProduct;
    } catch (error) {
        console.error('Error saving product to localStorage:', error);
        throw error;
    }
}

// Update an existing product
export function updateProduct(productId, productData) {
    if (typeof window === 'undefined') return null;
    
    try {
        const products = getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index === -1) {
            throw new Error('Product not found');
        }
        
        const price = parseFloat(productData.price) || 0;
        const comparePrice = productData.comparePrice ? parseFloat(productData.comparePrice) : null;
        
        products[index] = {
            ...products[index],
            ...productData,
            price: price,
            comparePrice: comparePrice,
            stock: parseInt(productData.stock) || products[index].stock,
            minStock: parseInt(productData.minStock) || products[index].minStock,
            updatedAt: new Date().toISOString(),
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return products[index];
    } catch (error) {
        console.error('Error updating product in localStorage:', error);
        throw error;
    }
}

// Delete a product
export function deleteProduct(productId) {
    if (typeof window === 'undefined') return false;
    
    try {
        const products = getProducts();
        const filtered = products.filter(p => p.id !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting product from localStorage:', error);
        return false;
    }
}

// Get a single product by ID
export function getProductById(productId) {
    const products = getProducts();
    return products.find(p => p.id === productId) || null;
}

// Get products by category
export function getProductsByCategory(category) {
    const products = getProducts();
    if (category === 'all' || !category) return products;
    return products.filter(p => p.category === category);
}

// Merge with mock data (for initial load)
export function getAllProducts() {
    const savedProducts = getProducts();
    // You can merge with mock data here if needed
    return savedProducts;
}

