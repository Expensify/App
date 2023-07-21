import focusWithDelay from './focusWithDelay';

/**
 * We pass true to disable the delay on the web because it doesn't display the keyboard
 * so we don't have to use the hack (explained in the focusWithDelay.js file).
 */
export default focusWithDelay(true);
