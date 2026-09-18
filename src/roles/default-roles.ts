import { PERMISSIONS } from '../permissions/permissions.constants.js';

export const DEFAULT_ROLES = [
    {
        id: 'owner',
        name: 'Owner',
        isSystem: true,
        permissions: Object.values(PERMISSIONS),
    },

    {
        id: 'manager',
        name: 'Manager',
        isSystem: true,
        permissions: [
            PERMISSIONS.POS_VIEW,

            PERMISSIONS.ORDER_VIEW,
            PERMISSIONS.ORDER_CREATE,
            PERMISSIONS.ORDER_UPDATE,
            PERMISSIONS.ORDER_CANCEL,

            PERMISSIONS.MENU_VIEW,
            PERMISSIONS.MENU_CREATE,
            PERMISSIONS.MENU_UPDATE,

            PERMISSIONS.TABLE_VIEW,
            PERMISSIONS.TABLE_CREATE,
            PERMISSIONS.TABLE_UPDATE,

            PERMISSIONS.PAYMENT_VIEW,
            PERMISSIONS.PAYMENT_CREATE,

            PERMISSIONS.REPORT_VIEW,

            PERMISSIONS.PRINTER_VIEW,
            PERMISSIONS.PRINTER_MANAGE,

            PERMISSIONS.USER_VIEW,
            PERMISSIONS.USER_CREATE,
            PERMISSIONS.USER_UPDATE,

            PERMISSIONS.SETTINGS_VIEW,
        ],
    },

    {
        id: 'cashier',
        name: 'Cashier',
        isSystem: true,
        permissions: [
            PERMISSIONS.POS_VIEW,

            PERMISSIONS.ORDER_VIEW,
            PERMISSIONS.ORDER_CREATE,
            PERMISSIONS.ORDER_UPDATE,

            PERMISSIONS.MENU_VIEW,

            PERMISSIONS.TABLE_VIEW,

            PERMISSIONS.PAYMENT_VIEW,
            PERMISSIONS.PAYMENT_CREATE,

            PERMISSIONS.PRINTER_VIEW,
        ],
    },

    {
        id: 'waiter',
        name: 'Waiter',
        isSystem: true,
        permissions: [
            PERMISSIONS.POS_VIEW,

            PERMISSIONS.ORDER_VIEW,
            PERMISSIONS.ORDER_CREATE,
            PERMISSIONS.ORDER_UPDATE,

            PERMISSIONS.MENU_VIEW,

            PERMISSIONS.TABLE_VIEW,
        ],
    },

    {
        id: 'kitchen',
        name: 'Kitchen',
        isSystem: true,
        permissions: [
            PERMISSIONS.ORDER_VIEW,
            PERMISSIONS.ORDER_UPDATE,
        ],
    },

    {
        id: 'accountant',
        name: 'Accountant',
        isSystem: true,
        permissions: [
            PERMISSIONS.PAYMENT_VIEW,
            PERMISSIONS.REPORT_VIEW,
        ],
    },
];