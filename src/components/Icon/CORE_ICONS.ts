import type {TupleToUnion} from 'type-fest';

const CORE_ICONS = [
    // Navigation & Brand
    'ExpensifyAppIcon',
    'BackArrow',
    'Close',
    'Inbox',
    'MoneySearch',
    'Buildings',
    'Profile',
    'Home',

    // Core UI Actions
    'Plus',
    'User',
    'FallbackAvatar',
    'Checkmark',
    'MagnifyingGlass',
    'Help',

    // Essential App Features
    'Receipt',
    'Camera',
    'Calendar',
    'Download',
    'Settings',

    // UI State Indicators
    'DotIndicator',
    'CheckmarkCircle',
    'Exclamation',

    // Core Business Icons
    'CreditCardsNew',
    'EmptyState',
    'HandCard',

    // Essential Navigation Elements
    'ThreeDots',
    'Menu',
    'ArrowRight',
    'ArrowLeft',


    'Accounting',
    'FolderOpen',
    'Tag',
    
    // Workspace Page Icons
    'Workflows',
    'Coins',
    'Building',
    'InvoiceBlue',
    'ReceiptWrangler',
    'Telescope',
    'TeleScope',
    'CompanyCard', // verify
    'MagnifyingGlassMoney', // verify
    'CompanyCardsEmptyState', // verify
    'PerDiem',
    'MoneyReceipts',
    'MoneyWings', // verify
    'ReportReceipt',
    'Rules',

] as const;

type CoreIconName = TupleToUnion<typeof CORE_ICONS>;

/**
 * Check if an icon is core (should be loaded eagerly)
 */
function isCoreIcon(iconName: string): boolean {
    return CORE_ICONS.includes(iconName as CoreIconName);
}

/**
 * Get all core icons as a set for quick lookup
 */
function getCoreIconsSet(): Set<string> {
    return new Set(CORE_ICONS);
}

export {CORE_ICONS, type CoreIconName, isCoreIcon, getCoreIconsSet};
