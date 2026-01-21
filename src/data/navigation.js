import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Truck,
    Settings,
    Image as ImageIcon,
    BadgePercent,
    ClipboardList
} from 'lucide-react';

export const navigationItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
    },
    // {
    //     title: 'Analytics',
    //     icon: BarChart3,
    //     href: '/analytics',
    // },
    {
        title: 'Product Management',
        icon: Package,
        items: [
            { title: 'Products List', href: '/products' },
            { title: 'Add Product', href: '/products/add' },
            { title: 'Categories', href: '/categories' },
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
        title: 'Inventory',
        icon: ClipboardList,
        items: [
            { title: 'Stock Levels', href: '/inventory' },
            { title: 'Low Stock Alerts', href: '/inventory/alerts' },
            { title: 'Suppliers', href: '/inventory/suppliers' },
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
        title: 'Delivery',
        icon: Truck,
        items: [
            { title: 'Delivery Areas', href: '/delivery/areas' },
            { title: 'Partners', href: '/delivery/partners' },
        ],
    },
    {
        title: 'Promotions',
        icon: BadgePercent,
        items: [
            { title: 'Coupons', href: '/promotions/coupons' },
            { title: 'Flash Sales', href: '/promotions/flash-sales' },
        ],
    },
    {
        title: 'Content (CMS)',
        icon: ImageIcon,
        items: [
            { title: 'Home Banners', href: '/cms/banners' },
            { title: 'Offers Section', href: '/cms/offers' },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
    },
];
