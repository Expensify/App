import focusWithDelay from './focusWithDelay';

/**
 * We pass true to disable the delay on the web because it doesn't require
 * using the workaround (explained in the focusWithDelay.js file).
 */
export default focusWithDelay(true);
