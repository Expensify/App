/**
 * Does an element have content wider than it's scroll width?
 *
 * @param {HTMLElement} el Element to check
 * @returns {Boolean}
 */
function hasContentWiderThanScrollWidth(el) {
    return el.offsetWidth && el.scrollWidth && el.offsetWidth < el.scrollWidth;
}

export default hasContentWiderThanScrollWidth;
