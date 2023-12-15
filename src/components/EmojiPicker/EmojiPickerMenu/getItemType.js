/**
 * Improves FlashList's recycling when there are different types of items
 * @param {Object} item
 * @returns {String}
 */
function getItemType(item) {
    if (item.header) {
        return 'header';
    }
    if (item.spacer) {
        return 'spacer';
    }
    return 'emoji';
}

export default getItemType;
