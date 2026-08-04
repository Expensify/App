import type OverflowXAutoStyles from './types';

/**
 * Web-only style. Scrolls horizontally when the content is wider than the container, while leaving vertical scrolling
 * to whatever is nested inside.
 */
const overflowXAuto: OverflowXAutoStyles = {
    overflowX: 'auto',
    overflowY: 'hidden',
};

export default overflowXAuto;
