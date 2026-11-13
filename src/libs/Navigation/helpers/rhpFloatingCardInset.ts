import variables from '@styles/variables';

/** Both borders of a border-box floating RHP card, which its width adds on top of the content's. */
const RHP_FLOATING_CARD_BORDERS_WIDTH = 2 * variables.rhpFloatingCardBorderWidth;

/** What a floating RHP card adds between its content's left edge and the right window edge: both borders and its right margin. */
const RHP_FLOATING_CARD_INSET = variables.rhpFloatingCardMargin + RHP_FLOATING_CARD_BORDERS_WIDTH;

export default RHP_FLOATING_CARD_INSET;
export {RHP_FLOATING_CARD_BORDERS_WIDTH};
