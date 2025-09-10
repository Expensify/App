import type {TupleToUnion} from 'type-fest';


const INBOX_ICONS = [

] as const;

const REPORTS_ICONS = [

] as const;

const WORKSPACE_ICONS = [
    'ReceiptWrangler',
    'Telescope',
    'TeleScope',
    'Building',
    'Accounting',
    'FolderOpen',
    'Tag',
    'Workflows',
    'Coins',
    'InvoiceBlue',
    'CompanyCard',
    'MagnifyingGlassMoney',
    'CompanyCardsEmptyState',
    'PerDiem',
    'MoneyReceipts',
    'MoneyWings',
    'ExpensifyCardIllustration',
    'ReportReceipt',
    'Rules',
    'HandCard',
    'CreditCardsNew',
    'EmptyState',
] as const;

const ACCOUNT_ICONS = [

] as const;

// Functional chunks (cross-cutting concerns)
const NAVIGATION_ICONS = [

] as const;

const UI_ACTIONS_ICONS = [

] as const;

const FINANCIAL_ICONS = [

] as const;

const DECORATIVE_ICONS = [

] as const;

type InboxIconName = TupleToUnion<typeof INBOX_ICONS>;
type ReportsIconName = TupleToUnion<typeof REPORTS_ICONS>;
type WorkspaceIconName = TupleToUnion<typeof WORKSPACE_ICONS>;
type AccountIconName = TupleToUnion<typeof ACCOUNT_ICONS>;
type NavigationIconName = TupleToUnion<typeof NAVIGATION_ICONS>;
type UIActionIconName = TupleToUnion<typeof UI_ACTIONS_ICONS>;
type FinancialIconName = TupleToUnion<typeof FINANCIAL_ICONS>;
type DecorativeIconName = TupleToUnion<typeof DECORATIVE_ICONS>;

type SmartChunkIconName =
    | WorkspaceIconName;

function getIconChunk(iconName: string): string {
    if (INBOX_ICONS.includes(iconName as InboxIconName)) {
        return 'inbox';
    }
    if (REPORTS_ICONS.includes(iconName as ReportsIconName)) {
        return 'reports';
    }
    if (WORKSPACE_ICONS.includes(iconName as WorkspaceIconName)) {
        return 'workspace';
    }
    if (ACCOUNT_ICONS.includes(iconName as AccountIconName)) {
        return 'account';
    }
    if (NAVIGATION_ICONS.includes(iconName as NavigationIconName)) {
        return 'navigation';
    }
    if (UI_ACTIONS_ICONS.includes(iconName as UIActionIconName)) {
        return 'ui-actions';
    }
    if (FINANCIAL_ICONS.includes(iconName as FinancialIconName)) {
        return 'financial';
    }
    if (DECORATIVE_ICONS.includes(iconName as DecorativeIconName)) {
        return 'decorative';
    }
    return 'default';
}

function getChunkIcons(chunkName: string): readonly string[] {
    switch (chunkName) {
        case 'inbox':
            return INBOX_ICONS;
        case 'reports':
            return REPORTS_ICONS;
        case 'workspace':
            return WORKSPACE_ICONS;
        case 'account':
            return ACCOUNT_ICONS;
        case 'navigation':
            return NAVIGATION_ICONS;
        case 'ui-actions':
            return UI_ACTIONS_ICONS;
        case 'financial':
            return FINANCIAL_ICONS;
        case 'decorative':
            return DECORATIVE_ICONS;
        default:
            return [];
    }
}

export {
    INBOX_ICONS,
    REPORTS_ICONS,
    WORKSPACE_ICONS,
    ACCOUNT_ICONS,
    NAVIGATION_ICONS,
    UI_ACTIONS_ICONS,
    FINANCIAL_ICONS,
    DECORATIVE_ICONS,
    getIconChunk,
    getChunkIcons,
};

// Export types
export type {
    InboxIconName,
    ReportsIconName,
    WorkspaceIconName,
    AccountIconName,
    NavigationIconName,
    UIActionIconName,
    FinancialIconName,
    DecorativeIconName,
    SmartChunkIconName,
};
