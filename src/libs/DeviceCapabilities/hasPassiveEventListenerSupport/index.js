"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hasPassiveEventListenerSupport;
/**
 * Allows us to identify whether the browser supports passive event listener.
 */
function hasPassiveEventListenerSupport() {
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            // eslint-disable-next-line getter-return
            get: function () {
                supportsPassive = true;
            },
        });
        window.addEventListener('testPassive', function () { }, opts);
        window.removeEventListener('testPassive', function () { }, opts);
        // eslint-disable-next-line no-empty
    }
    catch (e) { }
    return supportsPassive;
}
