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
        title: 'My Deliveries',
        icon: ShoppingCart,
        href: '/delivery/agent',
        allowedRoles: ['DELIVERY_AGENT']
    },
    {
        title: 'Products',
        icon: Package,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'All Products', href: '/products' },
            { title: 'Add Product', href: '/products/add' },
            { title: 'Low Stock', href: '/products/low-stock' },
            { title: 'Categories', href: '/categories' },
            { title: 'Brands', href: '/brands' },
        ],
    },
    {
        title: 'Stock',
        icon: ClipboardList,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Stock Overview', href: '/stocks' },
            { title: 'Stock History', href: '/stocks/logs' },
            { title: 'Add Stock', href: '/stocks/add' },
            { title: 'Remove Stock', href: '/stocks/remove' },
            { title: 'Removal Approvals', href: '/stocks/approvals' },
            { title: 'Suppliers', href: '/inventory/suppliers' },
        ],
    },
    {
        title: 'Orders',
        icon: ShoppingCart,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'All Orders', href: '/orders' },
            { title: 'Returns', href: '/orders/returns' },
        ],
    },
    {
        title: 'Users',
        icon: Users,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Customers', href: '/users/customers' },
            { title: 'Subscriptions', href: '/users/subscriptions' },
            { title: 'Reviews', href: '/reviews' },
            { title: 'Messages', href: '/messages' },
            { title: 'Admin Users', href: '/users/admins' },
            { title: 'Roles', href: '/users/roles' },
        ],
    },
    {
        title: 'Marketing',
        icon: BadgePercent,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Banners', href: '/promotions/banners' },
            { title: 'Membership Plans', href: '/marketing/membership-plans' },
            { title: 'Offers', href: '/marketing/offers' },
            { title: 'Coupons', href: '/promotions/coupons' },
        ],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        allowedRoles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'SUPER_ADMIN'],
        items: [
            { title: 'Sales Report', href: '/analytics/business' },
            { title: 'Product Report', href: '/analytics/products' },
            { title: 'Customer Report', href: '/analytics/customers' },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
        allowedRoles: ['ADMIN', 'DEVELOPER', 'SUPER_ADMIN']
    },
];
