export const DEFAULT_PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Basic POS features for small businesses',

        price: {
            monthly: 499,
            yearly: 4990,
            currency: 'INR',
        },

        trial: {
            enabled: true,
            days: 7,
        },

        limits: {
            users: 3,
            menuItems: 100,
            categories: 20,
            tables: 10,
            printers: 1,
            branches: 1,
        },

        features: {
            pos: true,
            menu_management: true,
            table_management: true,
            multiple_users: true,
            kot_printing: false,
            bill_printing: true,
            advanced_reports: false,
            customer_management: false,
            discounts: false,
            inventory: false,
            multi_branch: false,
        },
    },

    {
        id: 'professional',
        name: 'Professional',
        description: 'Complete POS for growing businesses',

        price: {
            monthly: 999,
            yearly: 9990,
            currency: 'INR',
        },

        trial: {
            enabled: true,
            days: 14,
        },

        limits: {
            users: 10,
            menuItems: -1,
            categories: -1,
            tables: -1,
            printers: 5,
            branches: 1,
        },

        features: {
            pos: true,
            menu_management: true,
            table_management: true,
            multiple_users: true,
            kot_printing: true,
            bill_printing: true,
            advanced_reports: true,
            customer_management: true,
            discounts: true,
            inventory: false,
            multi_branch: false,
        },
    },

    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Advanced POS for larger businesses',

        price: {
            monthly: 1999,
            yearly: 19990,
            currency: 'INR',
        },

        trial: {
            enabled: true,
            days: 14,
        },

        limits: {
            users: -1,
            menuItems: -1,
            categories: -1,
            tables: -1,
            printers: -1,
            branches: -1,
        },

        features: {
            pos: true,
            menu_management: true,
            table_management: true,
            multiple_users: true,
            kot_printing: true,
            bill_printing: true,
            advanced_reports: true,
            customer_management: true,
            discounts: true,
            inventory: true,
            multi_branch: true,
        },
    },
];