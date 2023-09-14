/**
 * Allows us to identify whether the browser supports passive event listener.
 * Because older browsers will interpret any object in the 3rd argument of an event listener as capture=true.
 *
 * @returns {Boolean}
 */

const hasPassiveEventListenerSupport = () => false;

export default hasPassiveEventListenerSupport;
