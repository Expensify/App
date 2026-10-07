/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Gap (px) between adjacent bars. `getBarLayout` narrows it when there are too many bars to fit it. */
const BAR_GAP = 16;

/** Widest a bar gets (px), so one or two bars don't stretch across the whole plot. */
const BAR_MAX_WIDTH = 320;

/** Gap (px) between the bars of one group, like a period and the one it's compared with */
const BAR_GROUP_INNER_GAP = 4;

const BAR_CORNER_RADIUS = 4;

/** Share of the gap on each side of a bar that still counts as hovering it, so neighbors never overlap. */
const BAR_HIT_GAP_RATIO = 0.25;

/** Per-side domain padding (Victory's `domainPadding`). */
const VERTICAL_BAR_DOMAIN_PADDING = {top: 32, bottom: 0, left: 0, right: 0};

export default BAR_INNER_PADDING;
export {BAR_GAP, BAR_GROUP_INNER_GAP, BAR_MAX_WIDTH, BAR_CORNER_RADIUS, BAR_HIT_GAP_RATIO, VERTICAL_BAR_DOMAIN_PADDING};
