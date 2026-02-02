import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Image as ImageIcon,
    BadgePercent,
    ClipboardList,
    ShieldCheck,
    Layers
} from 'lucide-react';

export const navigationItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        title: 'Product Management',
        icon: Package,
        items: [
            { title: 'Products List', href: '/products' },
            { title: 'Add Product', href: '/products/add' },
            { title: 'Low Stock', href: '/products/low-stock' },
            { title: 'Categories', href: '/categories' },
            { title: 'Brands', href: '/brands' },
        ],
    },
    {
        title: 'Stock Management',
        icon: ClipboardList,
        items: [
            { title: 'Stock Logs', href: '/stocks/logs' },
            { title: 'Add Stock', href: '/stocks/add' },
            { title: 'Remove Stock', href: '/stocks/remove' },
            { title: 'Removal Approvals', href: '/stocks/approvals' },
            { title: 'Suppliers', href: '/inventory/suppliers' },
        ],


    },
    {
        title: 'Order Management',
        icon: ShoppingCart,
        items: [
            { title: 'Orders List', href: '/orders' },
            { title: 'Returns', href: '/orders/returns' },
        ],
    },
    {
        title: 'User Management',
        icon: Users,
        items: [
            { title: 'Customers', href: '/users/customers' },
            { title: 'Admin Users', href: '/users/admins' },
            { title: 'Roles & Permissions', href: '/users/roles' },
        ],
    },
    {
        title: 'Marketing',
        icon: BadgePercent,
        items: [
            { title: 'Web Banners', href: '/promotions/banners' },
            { title: 'Active Offers', href: '/marketing/offers' },
            { title: 'Coupons', href: '/promotions/coupons' },
        ],
    },
    {
        title: 'Analysis',
        icon: BarChart3,
        items: [
            { title: 'Business Intelligence', href: '/analytics/business' },
            { title: 'Product Analysis', href: '/analytics/products' },
            { title: 'Customer Analysis', href: '/analytics/customers' },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
    },
];
