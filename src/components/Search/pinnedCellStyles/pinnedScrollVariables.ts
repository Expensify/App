/** How far the Spend table has scrolled sideways, in px. */
const PINNED_SCROLL_X_VARIABLE = '--table-scroll-x';

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
    PINNED_START_WIDTH_VARIABLE,
    PINNED_START_COVER_OPACITY_VARIABLE,
    PINNED_HEADER_ROW_DATA_SET,
    PINNED_HEADER_ROW_SELECTOR,
    PINNED_EDGE,
    PINNED_HEADING_SELECTOR,
    PINNED_START_EDGE_SELECTOR,
};
