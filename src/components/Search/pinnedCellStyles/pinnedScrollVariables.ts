/** The CSS variables and data attributes the Spend table's scroller, pinned cells and covers share. */

/** Where the rows' outer edge rests, in px. A sticky box stays still only when its inset equals where it rests. */
const PINNED_LEFT_EDGE_VARIABLE = '--table-pinned-left-edge';

/** Where a row's content starts, in px: where its checkbox and error line rest. */
const PINNED_LEFT_LEAD_VARIABLE = '--table-pinned-left-lead';

/** Where the cells of the left pin at `pinIndex` rest in the scroller's content, in px. */
function getPinnedLeftVariable(pinIndex: number) {
    return `--table-pinned-left-${pinIndex}`;
}

/** The pinned region's width, padding and trailing gap included, in px. */
const PINNED_START_WIDTH_VARIABLE = '--table-pinned-start-width';

/** The pinned region's width, written only while the table overflows. A row's error line is cut to it. */
const PINNED_LINE_WIDTH_VARIABLE = '--table-pinned-line-width';

/** Height of the horizontal scrollbar, in px, which the mask leaves uncovered. */
const PINNED_SCROLLBAR_HEIGHT_VARIABLE = '--table-scrollbar-height';

/** `1` while columns are beneath the pinned region, which shows its divider, `0` otherwise. */
const PINNED_START_EDGE_OPACITY_VARIABLE = '--table-pinned-start-edge-opacity';

/** `visible` once the table has scrolled sideways, which masks the page margin, `hidden` at its start. */
const PINNED_GUTTER_MASK_VISIBILITY_VARIABLE = '--table-pinned-gutter-mask-visibility';

/** Height of the sticky column header, in px, which focus scrolling has to clear. */
const STICKY_HEADER_HEIGHT_VARIABLE = '--table-sticky-header-height';

const PINNED_TABLE_SCROLLER_DATA_SET = {pinnedTableScroller: true};
const PINNED_TABLE_SCROLLER_SELECTOR = '[data-pinned-table-scroller="true"]';

const PINNED_HEADER_ROW_DATA_SET = {pinnedHeaderRow: true};
const PINNED_HEADER_ROW_SELECTOR = '[data-pinned-header-row="true"]';

/** Marks every pinned heading, so resizing one re-measures the region. */
const PINNED_HEADING_DATA_SET = {pinnedHeading: 'true'};
const PINNED_HEADING_SELECTOR = '[data-pinned-heading="true"]';

export {
    PINNED_LEFT_EDGE_VARIABLE,
    PINNED_LEFT_LEAD_VARIABLE,
    getPinnedLeftVariable,
    PINNED_START_WIDTH_VARIABLE,
    PINNED_LINE_WIDTH_VARIABLE,
    PINNED_SCROLLBAR_HEIGHT_VARIABLE,
    PINNED_START_EDGE_OPACITY_VARIABLE,
    PINNED_GUTTER_MASK_VISIBILITY_VARIABLE,
    STICKY_HEADER_HEIGHT_VARIABLE,
    PINNED_TABLE_SCROLLER_DATA_SET,
    PINNED_TABLE_SCROLLER_SELECTOR,
    PINNED_HEADER_ROW_DATA_SET,
    PINNED_HEADER_ROW_SELECTOR,
    PINNED_HEADING_DATA_SET,
    PINNED_HEADING_SELECTOR,
};
