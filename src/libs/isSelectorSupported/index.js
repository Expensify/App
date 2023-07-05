/**
 * Check platform supports the selector or not
 * @param  {String} selector
 * @return {Boolean}
 */
export default function isSelectorSupported(selector) {
    try {
        document.querySelector(selector);
        return true;
    } catch (error) {
        return false;
    }
}
