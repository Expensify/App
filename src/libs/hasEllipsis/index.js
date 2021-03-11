// eslint-disable-next-line valid-jsdoc
/**
 * Does an elment has ellipsis
 *
 * @param {*} el
 * @returns
 */
function hasEllipsis(el) {
    return el.offsetWidth < el.scrollWidth;
}

export default hasEllipsis;
