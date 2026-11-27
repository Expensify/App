/** The CSS variables and data attributes the Spend table's scroller and its sticky column header share. */

/** Height of the sticky column header, in px, which focus scrolling has to clear. */
const STICKY_HEADER_HEIGHT_VARIABLE = '--table-sticky-header-height';

const PINNED_TABLE_SCROLLER_DATA_SET = {pinnedTableScroller: true};
const PINNED_TABLE_SCROLLER_SELECTOR = '[data-pinned-table-scroller="true"]';

const PINNED_HEADER_ROW_DATA_SET = {pinnedHeaderRow: true};
const PINNED_HEADER_ROW_SELECTOR = '[data-pinned-header-row="true"]';

export {STICKY_HEADER_HEIGHT_VARIABLE, PINNED_TABLE_SCROLLER_DATA_SET, PINNED_TABLE_SCROLLER_SELECTOR, PINNED_HEADER_ROW_DATA_SET, PINNED_HEADER_ROW_SELECTOR};
