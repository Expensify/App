/**
 * Allows us to identify whether the browser supports passive event listener.
 */
export default function hasPassiveEventListenerSupport(): boolean {
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            // eslint-disable-next-line getter-return
            get() {
                supportsPassive = true;
            },
        });
        window.addEventListener('testPassive', () => {}, opts);
        window.removeEventListener('testPassive', () => {}, opts);
        // eslint-disable-next-line no-empty
    } catch (e) {}
    return supportsPassive;
}
