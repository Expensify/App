// eslint-disable-next-line valid-jsdoc
/**
 * Does an elment has ellipsis
 *
 * @param {*} el
 * @returns
 */
function hasEllipsis(el) {
    return el.offsetHeight < el.scrollHeight || el.offsetWidth < el.scrollWidth;
}

export default hasEllipsis;
