import type HasPassiveEventListenerSupport from './types';

/**
 * Allows us to identify whether the browser supports passive event listener.
 */
const hasPassiveEventListenerSupport: HasPassiveEventListenerSupport = () => false;

export default hasPassiveEventListenerSupport;
