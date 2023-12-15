import CONST from '@src/CONST';

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
        return CONST.EMOJI_PICKER_ITEM_TYPES.HEADER;
    }
    if (item.spacer) {
        return CONST.EMOJI_PICKER_ITEM_TYPES.SPACER;
    }
    return CONST.EMOJI_PICKER_ITEM_TYPES.EMOJI;
}

export default getItemType;
