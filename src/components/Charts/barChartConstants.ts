/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Minimum vertical space (px) per category row in a horizontal bar chart, so labels show in full. */
const MIN_BAR_ROW_HEIGHT = 36;

/** Per-side domain padding (Victory's `domainPadding`). `bottom: 1` keeps the bottom label visible. */
const VERTICAL_BAR_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

/** Per-side domain padding (Victory's `domainPadding`). `right` keeps the longest bar's tip and tooltip off the edge. */
const HORIZONTAL_BAR_DOMAIN_PADDING = {top: 8, bottom: 8, left: 0, right: 8};

export default BAR_INNER_PADDING;
export {MIN_BAR_ROW_HEIGHT, VERTICAL_BAR_DOMAIN_PADDING, HORIZONTAL_BAR_DOMAIN_PADDING};
