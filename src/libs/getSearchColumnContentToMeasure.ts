import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {MeasurableFont} from './measureTextWidth/types';

import {getCleanedTagName} from './PolicyUtils';
import {getDescription, getMerchantName, getTag} from './TransactionUtils';

/** A run of text rendered in a Search table cell, described well enough to measure how wide it renders. */
type SearchColumnContent = {
    /** The text rendered in the cell. */
    text: string | undefined;

    /** Font the text renders in. Omitted for the app's normal body text, which is what most cells use. */
    font?: MeasurableFont;
};

/**
 * Width a `UserInfoCell` spends on its avatar before any text: the avatar itself plus its trailing padding.
 */
const USER_INFO_CELL_AVATAR_WIDTH = variables.avatarSizeXxxSmall + variables.spacing2;

/**
 * The Search columns that are sized from their content. These are the free-text columns that share the table's leftover
 * space today, so they are the ones that truncate while a short column beside them keeps space it doesn't need.
 *
 * Columns left out keep their existing fixed widths: they hold values of a known size (a date, an amount, a status
 * badge, an icon), so measuring them would cost work without changing the layout.
 */
const DYNAMICALLY_SIZED_SEARCH_COLUMNS = new Set<SearchColumnType>([
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.FROM,
    CONST.SEARCH.TABLE_COLUMNS.TO,
]);

/**
 * The header label each dynamically sized column carries, so a column can be kept wide enough to show its own heading.
 */
const SEARCH_COLUMN_HEADER_TRANSLATION_KEYS: Partial<Record<SearchColumnType, TranslationPaths>> = {
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'common.merchant',
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'common.description',
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'common.category',
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'common.tag',
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'common.from',
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'common.to',
};

/**
 * Width a column needs on top of its text, for the non-text content its cell renders.
 */
function getSearchColumnExtraWidth(column: SearchColumnType): number {
    switch (column) {
        case CONST.SEARCH.TABLE_COLUMNS.FROM:
        case CONST.SEARCH.TABLE_COLUMNS.TO:
            return USER_INFO_CELL_AVATAR_WIDTH;
        default:
            return 0;
    }
}

/**
 * Returns the text a column renders for one transaction, so the column can be sized from its widest value.
 *
 * This mirrors what the row's cell renders rather than the raw field, since the two differ: a scanning expense shows a
 * status string in place of its merchant, and a tag is shown with its parent levels stripped.
 */
function getSearchColumnContentToMeasure(column: SearchColumnType, item: TransactionListItemType, translate: (key: TranslationPaths) => string): SearchColumnContent[] {
    switch (column) {
        case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
            return [{text: getMerchantName(item, translate)}];
        case CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION:
            return [{text: getDescription(item)}];
        case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
            return [{text: item.category}];
        case CONST.SEARCH.TABLE_COLUMNS.TAG:
            return [{text: getCleanedTagName(getTag(item))}];
        case CONST.SEARCH.TABLE_COLUMNS.FROM:
            return [{text: item.formattedFrom ?? item.from?.displayName}];
        case CONST.SEARCH.TABLE_COLUMNS.TO:
            return [{text: item.formattedTo ?? item.to?.displayName}];
        default:
            return [];
    }
}

export default getSearchColumnContentToMeasure;
export {DYNAMICALLY_SIZED_SEARCH_COLUMNS, SEARCH_COLUMN_HEADER_TRANSLATION_KEYS, getSearchColumnExtraWidth};
