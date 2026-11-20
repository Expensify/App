/** The CSS variables and data attributes the Spend table's scroller, pinned cells and covers share. */

/** How far the Spend table has scrolled sideways, in px. */
const PINNED_SCROLL_X_VARIABLE = '--table-scroll-x';

/** The furthest the Spend table can scroll sideways, in px, which is where the scroll timeline's translate keyframes end. */
const PINNED_SCROLL_X_MAX_VARIABLE = '--table-scroll-x-max';

/** The scroll timeline the table's scroller publishes, which drives its pinned cells and covers. */
const PINNED_SCROLL_TIMELINE = '--pinned-table-x';

/** The keyframes in `web/index.html` that hold the pinned cells in place and show the covers. */
const PINNED_KEYFRAMES = {
    START_TRANSLATE: 'pinned-start-translate',
    START_COVER: 'pinned-start-cover',
} as const;

/** How far the left-pinned region reaches from a row's start edge, its padding and the gap after the last pin included, in px. */
const PINNED_START_WIDTH_VARIABLE = '--table-pinned-start-width';

/** `1` while columns are scrolled under the left-pinned region, `0` while the table rests at its start. */
const PINNED_START_COVER_OPACITY_VARIABLE = '--table-pinned-start-cover-opacity';

/** Marks the column header row, whose pinned headings the region is measured from. */
const PINNED_HEADER_ROW_DATA_SET = {pinnedHeaderRow: true};
const PINNED_HEADER_ROW_SELECTOR = '[data-pinned-header-row="true"]';

/** Marks every pinned heading, so resizing one re-measures the region. */
const PINNED_HEADING_SELECTOR = '[data-pinned-heading="true"]';

/** Marks the heading at the region's inner edge: the last left pin. */
const PINNED_EDGE = {
    START: 'start',
} as const;
const PINNED_START_EDGE_SELECTOR = `[data-pinned-edge="${PINNED_EDGE.START}"]`;

export {
    PINNED_SCROLL_X_VARIABLE,
    PINNED_SCROLL_X_MAX_VARIABLE,
    PINNED_SCROLL_TIMELINE,
    PINNED_KEYFRAMES,
    PINNED_START_WIDTH_VARIABLE,
    PINNED_START_COVER_OPACITY_VARIABLE,
    PINNED_HEADER_ROW_DATA_SET,
    PINNED_HEADER_ROW_SELECTOR,
    PINNED_EDGE,
    PINNED_HEADING_SELECTOR,
    PINNED_START_EDGE_SELECTOR,
};
