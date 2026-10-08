import type GetSwipeableRowAccessibilityProps from './types';

/** Swipe actions are native only; on web the hover and context menus cover them. */
const getSwipeableRowAccessibilityProps: GetSwipeableRowAccessibilityProps = () => ({});

export default getSwipeableRowAccessibilityProps;
