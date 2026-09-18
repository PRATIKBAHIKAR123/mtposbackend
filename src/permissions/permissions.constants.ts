export const PERMISSIONS = {
    POS_VIEW: 'pos.view',

    ORDER_VIEW: 'order.view',
    ORDER_CREATE: 'order.create',
    ORDER_UPDATE: 'order.update',
    ORDER_CANCEL: 'order.cancel',

    MENU_VIEW: 'menu.view',
    MENU_CREATE: 'menu.create',
    MENU_UPDATE: 'menu.update',
    MENU_DELETE: 'menu.delete',

    TABLE_VIEW: 'table.view',
    TABLE_CREATE: 'table.create',
    TABLE_UPDATE: 'table.update',
    TABLE_DELETE: 'table.delete',

    PAYMENT_VIEW: 'payment.view',
    PAYMENT_CREATE: 'payment.create',
    PAYMENT_REFUND: 'payment.refund',

    REPORT_VIEW: 'report.view',

    PRINTER_VIEW: 'printer.view',
    PRINTER_MANAGE: 'printer.manage',

    USER_VIEW: 'user.view',
    USER_CREATE: 'user.create',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',

    SETTINGS_VIEW: 'settings.view',
    SETTINGS_MANAGE: 'settings.manage',
} as const;