import {hasMissingSmartscanFields, isAmountMissing, isMerchantMissing} from '@libs/TransactionUtils';
import {isReportActionListItemType, isReportListItemType, isTransactionListItemType} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ITEM_HEIGHTS from './itemHeights';
import type {ReportActionListItemType, ReportListItemType, TaskListItemType, TransactionListItemType} from '@components/SelectionList/types';

type SearchListItem = TransactionListItemType | ReportListItemType | ReportActionListItemType | TaskListItemType;

type ItemHeightConfig = {
    isLargeScreenWidth: boolean;
    shouldUseNarrowLayout: boolean;
    queryJSONType?: string;
};

/**
 * Checks if a transaction item has violations that require extra height
 */
function transactionHasViolations(item: TransactionListItemType): boolean {
    const hasFieldErrors = hasMissingSmartscanFields(item);
    const amountMissing = isAmountMissing(item);
    const merchantMissing = isMerchantMissing(item);
    const hasViolationsCheck = item.hasViolation || !!item.errors;

    return hasFieldErrors || (amountMissing && merchantMissing) || hasViolationsCheck;
}

/**
 * Calculates height for report action items (chat messages)
 */
function getReportActionItemHeight(item: ReportActionListItemType, config: ItemHeightConfig): number {
    const {isLargeScreenWidth} = config;
    const actionName = item.actionName;
    
    if (actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
        // Check for violations in report preview
        const reportActionData = item as any;
        const hasReceipts = !!(reportActionData?.childLastReceiptTransactionIDs || reportActionData?.childRecentReceiptTransactionIDs);
        const hasViolations = hasReceipts && reportActionData?.childMoneyRequestCount > 0;
        
        const heights = isLargeScreenWidth 
            ? ITEM_HEIGHTS.CHAT.REPORT_PREVIEW.LARGE_SCREEN 
            : ITEM_HEIGHTS.CHAT.REPORT_PREVIEW.SMALL_SCREEN;
            
        return hasViolations ? heights.WITH_VIOLATIONS : heights.BASE;
    }
    
    if (actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT || actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
        return ITEM_HEIGHTS.CHAT.STANDARD;
    }
    
    return ITEM_HEIGHTS.CHAT.STANDARD;
}

/**
 * Calculates height for transaction items
 */
function getTransactionItemHeight(item: TransactionListItemType, config: ItemHeightConfig): number {
    const {isLargeScreenWidth, shouldUseNarrowLayout} = config;
    const itemAction = item.action;
    const isItemActionView = itemAction === CONST.SEARCH.ACTION_TYPES.VIEW;
    
    let heightConstants;
    
    if (shouldUseNarrowLayout) {
        // For narrow screens without drawer (mobile or collapsed desktop)
        heightConstants = isItemActionView 
            ? ITEM_HEIGHTS.NARROW_WITHOUT_DRAWER.STANDARD 
            : ITEM_HEIGHTS.NARROW_WITHOUT_DRAWER.WITH_BUTTON;
    } else if (!isLargeScreenWidth) {
        // For narrow screens with drawer
        heightConstants = isItemActionView 
            ? ITEM_HEIGHTS.NARROW_WITH_DRAWER.STANDARD 
            : ITEM_HEIGHTS.NARROW_WITH_DRAWER.WITH_BUTTON;
    } else {
        // For wide screens (desktop)
        heightConstants = ITEM_HEIGHTS.WIDE.STANDARD;
    }
    
    // Add extra height for violations (Review required marker)
    const violationHeightAdjustment = transactionHasViolations(item) ? variables.searchViolationWarningMarkHeight : 0;
    
    return heightConstants + violationHeightAdjustment;
}

/**
 * Calculates height for report list items (grouped transactions)
 */
function getReportListItemHeight(item: ReportListItemType, config: ItemHeightConfig): number {
    const {isLargeScreenWidth} = config;
    
    if (!item.transactions || item.transactions.length === 0) {
        return Math.max(ITEM_HEIGHTS.HEADER, 1);
    }
    
    const baseReportItemHeight = isLargeScreenWidth
        ? variables.searchOptionRowMargin + variables.searchOptionRowBaseHeight + variables.searchOptionRowLargeFooterHeight
        : variables.searchOptionRowMargin + variables.searchOptionRowBaseHeight + variables.searchOptionRowSmallFooterHeight;
        
    const transactionHeight = variables.searchOptionRowTransactionHeight;
    
    const hasViolationsInReport = item.transactions.some(transactionHasViolations);
    const violationHeightAdjustment = hasViolationsInReport ? variables.searchViolationWarningMarkHeight : 0;
    
    const calculatedHeight =
        baseReportItemHeight +
        item.transactions.length * transactionHeight +
        variables.optionRowListItemPadding +
        variables.searchOptionRowMargin +
        violationHeightAdjustment;
        
    return Math.max(calculatedHeight, ITEM_HEIGHTS.HEADER, 1);
}

/**
 * Main function to calculate item height
 */
export function calculateItemHeight(item: SearchListItem, config: ItemHeightConfig): number {
    try {
        // Chat messages (report actions)
        if (isReportActionListItemType(item) && config.queryJSONType === CONST.SEARCH.DATA_TYPES.CHAT) {
            return getReportActionItemHeight(item, config);
        }
        
        // Transactions
        if (isTransactionListItemType(item)) {
            return getTransactionItemHeight(item, config);
        }
        
        // Report groups
        if (isReportListItemType(item)) {
            return getReportListItemHeight(item, config);
        }
        
        // Default fallback
        return config.isLargeScreenWidth 
            ? variables.searchListItemHeightLargeScreen 
            : variables.searchListItemHeightSmallScreen;
            
    } catch (error) {
        console.error('SearchList: Error calculating item height', error, item);
        return ITEM_HEIGHTS.WIDE.STANDARD;
    }
}

/**
 * Factory function to create a height calculator with pre-configured settings
 */
export function createItemHeightCalculator(config: ItemHeightConfig) {
    return (item: SearchListItem) => calculateItemHeight(item, config);
} 