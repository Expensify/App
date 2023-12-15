/**
 * Improves FlashList's recycling when there are different types of items
 * @param {Object} item
 * @returns {String}
 */
function getItemType(item) {
    // item is undefined only when list is empty
    if (!item) {
        return;
    }
    if (item.header) {
        return 'header';
    }
    if (item.spacer) {
        return 'spacer';
    }
    return 'emoji';
}

export default getItemType;
