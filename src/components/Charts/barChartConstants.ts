/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Gap (px) between adjacent bars. `getBarLayout` narrows it when there are too many bars to fit it. */
const BAR_GAP = 16;

const BAR_CORNER_RADIUS = 4;

/** Per-side domain padding (Victory's `domainPadding`). `bottom: 1` keeps the bottom label visible. */
const VERTICAL_BAR_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

export default BAR_INNER_PADDING;
export {BAR_GAP, BAR_CORNER_RADIUS, VERTICAL_BAR_DOMAIN_PADDING};
