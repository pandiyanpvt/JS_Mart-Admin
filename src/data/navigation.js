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
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN']
    },
    {
        title: 'Delivery Panel',
        icon: ShoppingCart,
        href: '/delivery/agent',
        allowedRoles: ['DELIVERY_AGENT']
    },
    {
        title: 'Product Management',
        icon: Package,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
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
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Stock Overview', href: '/stocks' },
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
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Orders List', href: '/orders' },
            { title: 'Returns', href: '/orders/returns' },
        ],
    },
    {
        title: 'User Management',
        icon: Users,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Customers', href: '/users/customers' },
            { title: 'User Subscriptions', href: '/users/subscriptions' },
            { title: 'User Reviews', href: '/reviews' },
            { title: 'Contact Messages', href: '/messages' },
            { title: 'Admin Users', href: '/users/admins' },
            { title: 'Roles & Permissions', href: '/users/roles' },
        ],
    },
    {
        title: 'Marketing',
        icon: BadgePercent,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Web Banners', href: '/promotions/banners' },
            { title: 'Membership Plans', href: '/marketing/membership-plans' },
            { title: 'Active Offers', href: '/marketing/offers' },
            { title: 'Coupons', href: '/promotions/coupons' },
        ],
    },
    {
        title: 'Analysis',
        icon: BarChart3,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
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
        allowedRoles: ['ADMIN', 'DEVELOPER', 'SUPER_ADMIN']
    },
];
