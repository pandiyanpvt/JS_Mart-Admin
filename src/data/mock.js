export const salesStats = [
    { name: 'Jan', sales: 4000, revenue: 2400 },
    { name: 'Feb', sales: 3000, revenue: 1398 },
    { name: 'Mar', sales: 2000, revenue: 9800 },
    { name: 'Apr', sales: 2780, revenue: 3908 },
    { name: 'May', sales: 1890, revenue: 4800 },
    { name: 'Jun', sales: 2390, revenue: 3800 },
];

export const topProducts = [
    { id: 1, name: 'Fresh Potatoes', category: 'Vegetables', sales: 450, revenue: '$2,025', stock: 120, image: '/images/potatoes.png' },
    { id: 2, name: 'Red Apples', category: 'Fruits', sales: 320, revenue: '$2,080', stock: 85, image: '/images/apples.png' },
    { id: 3, name: 'Superior Baby Milk Powder', category: 'Baby Products', sales: 150, revenue: '$4,275', stock: 40, image: '/images/milk-powder.jpg' },
    { id: 4, name: 'Fresh Full Cream Milk', category: 'Dairy', sales: 500, revenue: '$1,750', stock: 12, image: '/images/fresh-milk.jpg' },
];

export const summaryStats = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', type: 'up' },
    { title: 'Orders', value: '+2,350', change: '+180.1%', type: 'up' },
    { title: 'Customers', value: '+12,234', change: '+19%', type: 'up' },
    { title: 'Active Now', value: '573', change: '+201', type: 'up' },
];

export const inventoryItems = [
    { 
        id: 1, 
        name: 'Fresh Potatoes', 
        sku: 'PROD-1001',
        category: 'Vegetables', 
        currentStock: 120, 
        minLevel: 50,
        maxLevel: 500,
        unit: 'kg',
        location: 'Warehouse A-1',
        supplier: 'Fresh Farm Co.',
        lastRestocked: '2026-01-15',
        value: '$1,200.00',
        image: '/images/potatoes.png'
    },
    { 
        id: 2, 
        name: 'Red Apples', 
        sku: 'PROD-1002',
        category: 'Fruits', 
        currentStock: 85, 
        minLevel: 30,
        maxLevel: 300,
        unit: 'kg',
        location: 'Warehouse A-2',
        supplier: 'Orchard Fresh',
        lastRestocked: '2026-01-18',
        value: '$1,700.00',
        image: '/images/apples.png'
    },
    { 
        id: 3, 
        name: 'Superior Baby Milk Powder', 
        sku: 'PROD-1003',
        category: 'Baby Products', 
        currentStock: 40, 
        minLevel: 20,
        maxLevel: 200,
        unit: 'boxes',
        location: 'Warehouse B-1',
        supplier: 'Baby Care Inc.',
        lastRestocked: '2026-01-10',
        value: '$3,200.00',
        image: '/images/milk-powder.jpg'
    },
    { 
        id: 4, 
        name: 'Fresh Full Cream Milk', 
        sku: 'PROD-1004',
        category: 'Dairy', 
        currentStock: 12, 
        minLevel: 20,
        maxLevel: 150,
        unit: 'liters',
        location: 'Warehouse C-1',
        supplier: 'Dairy Farm Ltd.',
        lastRestocked: '2026-01-19',
        value: '$120.00',
        image: '/images/fresh-milk.jpg'
    },
    { 
        id: 5, 
        name: 'Organic Tomatoes', 
        sku: 'PROD-1005',
        category: 'Vegetables', 
        currentStock: 65, 
        minLevel: 40,
        maxLevel: 250,
        unit: 'kg',
        location: 'Warehouse A-3',
        supplier: 'Green Valley Farms',
        lastRestocked: '2026-01-17',
        value: '$650.00',
        image: null
    },
    { 
        id: 6, 
        name: 'Bananas', 
        sku: 'PROD-1006',
        category: 'Fruits', 
        currentStock: 95, 
        minLevel: 50,
        maxLevel: 300,
        unit: 'kg',
        location: 'Warehouse A-2',
        supplier: 'Tropical Fruits Co.',
        lastRestocked: '2026-01-16',
        value: '$475.00',
        image: null
    },
    { 
        id: 7, 
        name: 'Whole Wheat Bread', 
        sku: 'PROD-1007',
        category: 'Bakery', 
        currentStock: 8, 
        minLevel: 15,
        maxLevel: 100,
        unit: 'loaves',
        location: 'Warehouse D-1',
        supplier: 'Bakery Fresh',
        lastRestocked: '2026-01-19',
        value: '$40.00',
        image: null
    },
    { 
        id: 8, 
        name: 'Free Range Eggs', 
        sku: 'PROD-1008',
        category: 'Dairy', 
        currentStock: 25, 
        minLevel: 30,
        maxLevel: 200,
        unit: 'dozens',
        location: 'Warehouse C-2',
        supplier: 'Farm Fresh Eggs',
        lastRestocked: '2026-01-18',
        value: '$125.00',
        image: null
    },
];

export const stockMovements = [
    { id: 1, productId: 4, productName: 'Fresh Full Cream Milk', type: 'sale', quantity: -5, date: '2026-01-19 14:30', user: 'John Doe', reason: 'Order #12341' },
    { id: 2, productId: 1, productName: 'Fresh Potatoes', type: 'restock', quantity: 50, date: '2026-01-19 10:15', user: 'Admin', reason: 'Supplier Delivery' },
    { id: 3, productId: 2, productName: 'Red Apples', type: 'adjustment', quantity: -10, date: '2026-01-18 16:45', user: 'Admin', reason: 'Damaged Items' },
    { id: 4, productId: 3, productName: 'Superior Baby Milk Powder', type: 'sale', quantity: -2, date: '2026-01-18 11:20', user: 'Jane Smith', reason: 'Order #12340' },
    { id: 5, productId: 5, productName: 'Organic Tomatoes', type: 'restock', quantity: 30, date: '2026-01-17 09:00', user: 'Admin', reason: 'Supplier Delivery' },
];