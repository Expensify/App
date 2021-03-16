/**
 * Does an elment have ellipsis
 *
 * @param {HTMLElement} el Element to check
 * @returns {Boolean}
 */
function hasEllipsis(el) {
    return el.offsetWidth < el.scrollWidth;
}

export default hasEllipsis;
