import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, PolicyCategories, PolicyTagLists} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import type {MeasurableFont} from './measureTextWidth/types';

import {getCompanyCardDescription} from './CardUtils';
import {getCategoryGLCode, getDecodedLeafCategoryName, isCategoryMissing} from './CategoryUtils';
import getBase62ReportID from './getBase62ReportID';
import {getTagGLCode} from './PolicyUtils';
import {getReportName} from './ReportNameUtils';
import {getReportStatusTranslation} from './ReportUtils';
import {getDecodedTagName} from './TagUtils';
import {getDescription, getExchangeRate, getMerchantName, getTagForDisplay, getTaxName, isDeletedTransaction, isPerDiemRequest, isTimeRequest} from './TransactionUtils';

/**
 * The data a column needs to resolve its text that doesn't travel on the transaction itself. Read once at the list
 * level and passed down rather than subscribed to per row.
 */
type SearchColumnMeasurementContext = {
    /** The viewer's non-personal and workspace cards, used to name the card a transaction was made on. */
    nonPersonalAndWorkspaceCards?: CardList;

    /** Every policy's categories, so a transaction's category GL code can be looked up by its policy. */
    policyCategories?: OnyxCollection<PolicyCategories>;

    /** Every policy's tag lists, so a transaction's tag GL code can be looked up by its policy. */
    policyTags?: OnyxCollection<PolicyTagLists>;
};

/** The policy a transaction belongs to, which is where its category and tag GL codes are defined. */
function getTransactionPolicyID(item: TransactionListItemType): string | undefined {
    return [item.policyID, item.report?.policyID, item.policy?.id].find((policyID): policyID is string => !!policyID);
}

/** A run of text rendered in a Search table cell, described well enough to measure how wide it renders. */
type SearchColumnContent = {
    /** The text rendered in the cell. */
    text: string | undefined;

    /** Font the text renders in. Omitted for the app's normal body text, which is what most cells use. */
    font?: MeasurableFont;
};

/** Width a `UserInfoCell` spends before any text: the avatar plus its trailing padding. */
const USER_INFO_CELL_AVATAR_WIDTH = variables.avatarSizeXxxSmall + variables.spacing2;

/** Width the status badge spends around its label: `condensedBadge`'s horizontal padding plus `defaultBadge`'s border. */
const STATUS_BADGE_CHROME_WIDTH = 6 * 2 + 1 * 2;

/**
 * Width an editable cell spends around its value: `editableCell`'s padding plus the border it reserves for its focus
 * ring. It applies whether or not the value can actually be edited, and the cell hides its overflow, so a column
 * measured without it clips its own content.
 */
const EDITABLE_CELL_CHROME_WIDTH = 4 * 2 + 1 * 2;

/** The columns whose cells render inside an `EditableCell`, and so spend width on its padding and border. */
const EDITABLE_SEARCH_COLUMNS = new Set<SearchColumnType>([
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.SUBMITTED,
    CONST.SEARCH.TABLE_COLUMNS.APPROVED,
    CONST.SEARCH.TABLE_COLUMNS.POSTED,
    CONST.SEARCH.TABLE_COLUMNS.EXPORTED,
]);

/**
 * The Search columns sized from their content: the free-text ones that share the table's leftover space today, and so
 * the ones that truncate while a short column beside them keeps room it doesn't need.
 *
 * Columns left out hold values of a known size (a date, an amount, a status badge, an icon) and keep their fixed
 * widths, so measuring them would cost work without changing the layout.
 */
const DYNAMICALLY_SIZED_SEARCH_COLUMNS = new Set<SearchColumnType>([
    CONST.SEARCH.TABLE_COLUMNS.STATUS,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.FROM,
    CONST.SEARCH.TABLE_COLUMNS.TO,
    CONST.SEARCH.TABLE_COLUMNS.TITLE,
    CONST.SEARCH.TABLE_COLUMNS.REPORT_ID,
    CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID,
    CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID,
    CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID,
    CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID,
    CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS,
    CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME,
    CONST.SEARCH.TABLE_COLUMNS.TAX_RATE,
    CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE,
    CONST.SEARCH.TABLE_COLUMNS.CARD,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE,
    CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE,
]);

/**
 * Columns sized to fit their content exactly rather than sharing the row's spare space. Their content is a fixed-size
 * element, not free text, so widening it past what it holds only pads the row out.
 */
const HUGGED_SEARCH_COLUMNS = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.STATUS]);

/** Each dynamically sized column's header label, so a column can be kept wide enough to show its own heading. */
const SEARCH_COLUMN_HEADER_TRANSLATION_KEYS: Partial<Record<SearchColumnType, TranslationPaths>> = {
    [CONST.SEARCH.TABLE_COLUMNS.STATUS]: 'common.status',
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'common.merchant',
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'common.description',
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'common.category',
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'common.tag',
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'common.from',
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'common.to',
    [CONST.SEARCH.TABLE_COLUMNS.TITLE]: 'common.title',
    [CONST.SEARCH.TABLE_COLUMNS.REPORT_ID]: 'common.longReportID',
    [CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID]: 'common.reportID',
    [CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID]: 'common.withdrawalID',
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID]: 'workspace.common.customField1',
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID]: 'workspace.common.customField2',
    [CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS]: 'common.internationalReimbursementIDs',
    [CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME]: 'workspace.common.workspace',
    [CONST.SEARCH.TABLE_COLUMNS.TAX_RATE]: 'iou.taxRate',
    [CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE]: 'common.exchangeRate',
    [CONST.SEARCH.TABLE_COLUMNS.CARD]: 'common.card',
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]: 'common.categoryGLCode',
    [CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE]: 'common.tagGLCode',
};

/** Width a column needs on top of its text, for the non-text content its cell renders. */
function getSearchColumnExtraWidth(column: SearchColumnType): number {
    const editableCellWidth = EDITABLE_SEARCH_COLUMNS.has(column) ? EDITABLE_CELL_CHROME_WIDTH : 0;

    switch (column) {
        case CONST.SEARCH.TABLE_COLUMNS.FROM:
        case CONST.SEARCH.TABLE_COLUMNS.TO:
            return editableCellWidth + USER_INFO_CELL_AVATAR_WIDTH;
        case CONST.SEARCH.TABLE_COLUMNS.STATUS:
            return editableCellWidth + STATUS_BADGE_CHROME_WIDTH;
        default:
            return editableCellWidth;
    }
}

/**
 * Returns the text a column renders for one transaction, so the column can be sized from its widest value.
 *
 * Mirrors the cell rather than the raw field, since the two differ: a scanning expense shows a status string in place
 * of its merchant, and a tag is shown with its parent levels stripped.
 */
function getSearchColumnContentToMeasure(
    column: SearchColumnType,
    item: TransactionListItemType,
    translate: LocalizedTranslate,
    context: SearchColumnMeasurementContext = {},
): SearchColumnContent[] {
    switch (column) {
        case CONST.SEARCH.TABLE_COLUMNS.STATUS:
            // The status renders in a badge rather than the row's own text style, so it is measured in the badge's font.
            return [
                {
                    text: getReportStatusTranslation({stateNum: item.report?.stateNum, statusNum: item.report?.statusNum, isDeleted: isDeletedTransaction(item), translate}),
                    font: {fontSize: variables.fontSizeExtraSmall},
                },
            ];
        case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
            return [{text: getMerchantName(item, translate)}];
        case CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION:
            return [{text: getDescription(item)}];
        case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
            return [{text: isCategoryMissing(item.category) ? '' : getDecodedLeafCategoryName(item.category ?? '')}];
        case CONST.SEARCH.TABLE_COLUMNS.TAG:
            return [{text: getDecodedTagName(getTagForDisplay(item))}];
        case CONST.SEARCH.TABLE_COLUMNS.FROM:
            return [{text: item.formattedFrom ?? item.from?.displayName}];
        case CONST.SEARCH.TABLE_COLUMNS.TO:
            return [{text: item.formattedTo ?? item.to?.displayName}];
        case CONST.SEARCH.TABLE_COLUMNS.TITLE:
            return [{text: getReportName(item.report) ?? item.report?.reportName}];
        case CONST.SEARCH.TABLE_COLUMNS.REPORT_ID:
            return [{text: item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : item.reportID}];
        case CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID:
            return [{text: item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : getBase62ReportID(Number(item.reportID))}];
        case CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID:
            return [{text: item.withdrawalID}];
        case CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID:
            return [{text: item.report?.submitterUserID}];
        case CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID:
            return [{text: item.report?.submitterPayrollID}];
        case CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS:
            return [{text: item.report?.orderDealNumbers}];
        case CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME:
            return [{text: item.policy?.name}];
        case CONST.SEARCH.TABLE_COLUMNS.TAX_RATE:
            return [{text: isTimeRequest(item) || isPerDiemRequest(item) ? '' : (getTaxName(item.policy, item) ?? item.taxValue ?? '')}];
        case CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE:
            return [{text: getExchangeRate(item, item.report?.currency ?? item.policy?.outputCurrency, true)}];
        case CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE:
            return [{text: getCategoryGLCode(context.policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getTransactionPolicyID(item)}`], item.category)}];
        case CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE:
            return [{text: getTagGLCode(context.policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getTransactionPolicyID(item)}`], item.tag)}];
        case CONST.SEARCH.TABLE_COLUMNS.CARD:
            return [{text: getCompanyCardDescription(translate, item.cardName, item.cardID, context.nonPersonalAndWorkspaceCards, item.feedCountry)}];
        default:
            return [];
    }
}

export default getSearchColumnContentToMeasure;
export {DYNAMICALLY_SIZED_SEARCH_COLUMNS, HUGGED_SEARCH_COLUMNS, SEARCH_COLUMN_HEADER_TRANSLATION_KEYS, getSearchColumnExtraWidth};
export type {SearchColumnMeasurementContext};
