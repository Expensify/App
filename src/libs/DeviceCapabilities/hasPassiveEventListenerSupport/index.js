/**
 * Allows us to identify whether the browser supports passive event listener.
 * Because older browsers will interpret any object in the 3rd argument of an event listener as capture=true.
 *
 * @returns {Boolean}
 */

export default function hasPassiveEventListenerSupport() {
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            // eslint-disable-next-line getter-return
            get() {
                supportsPassive = true;
            },
        });
        window.addEventListener('testPassive', null, opts);
        window.removeEventListener('testPassive', null, opts);
        // eslint-disable-next-line no-empty
    } catch (e) {}
    return supportsPassive;
}
