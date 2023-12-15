import {FlashList} from '@shopify/flash-list';
import PropTypes from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import EmojiSkinToneList from '@components/EmojiPicker/EmojiSkinToneList';
import refPropTypes from '@components/refPropTypes';
import useLocalize from '@hooks/useLocalize';
import stylePropTypes from '@styles/stylePropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const emojiPropTypes = {
    /** The code of the item */
    code: PropTypes.string.isRequired,

    /** Whether the item is a header or not */
    header: PropTypes.bool,

    /** Whether the item is a spacer or not */
    spacer: PropTypes.bool,

    /** Types of an emoji - e.g. different skin types */
    types: PropTypes.arrayOf(PropTypes.string),
};

const propTypes = {
    /** Indicates if the emoji list is filtered or not */
    isFiltered: PropTypes.bool.isRequired,

    /** Array of header emojis */
    headerEmojis: PropTypes.arrayOf(PropTypes.shape(emojiPropTypes)).isRequired,

    /** Function to scroll to a specific header in the emoji list */
    scrollToHeader: PropTypes.func.isRequired,

    /** Style to be applied to the list wrapper */
    listWrapperStyle: stylePropTypes,

    /** Reference to the emoji list */
    forwardedRef: refPropTypes,

    /** The data for the emoji list */
    data: PropTypes.arrayOf(PropTypes.shape(emojiPropTypes)).isRequired,

    /** Function to render each item in the list */
    renderItem: PropTypes.func.isRequired,

    /** Extra data to be passed to the list for re-rendering */
    // eslint-disable-next-line react/forbid-prop-types
    extraData: PropTypes.any,

    /** Array of indices for the sticky headers */
    stickyHeaderIndices: PropTypes.arrayOf(PropTypes.number),

    /** Whether the list should always bounce vertically */
    alwaysBounceVertical: PropTypes.bool,
};

const defaultProps = {
    listWrapperStyle: [],
    forwardedRef: () => {},
    extraData: [],
    stickyHeaderIndices: [],
    alwaysBounceVertical: false,
};

/**
 * Improves FlashList's recycling when there are different types of items
 * @param {Object} item
 * @returns {String}
 */
const getItemType = (item) => {
    // item is undefined only when list is empty
    if (!item) {
        return;
    }

    if (item.name) {
        return CONST.EMOJI_PICKER_ITEM_TYPES.EMOJI;
    }
    if (item.header) {
        return CONST.EMOJI_PICKER_ITEM_TYPES.HEADER;
    }

    return CONST.EMOJI_PICKER_ITEM_TYPES.SPACER;
};

/**
 * Return a unique key for each emoji item
 *
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */
const keyExtractor = (item, index) => `emoji_picker_${item.code}_${index}`;

function BaseEmojiPickerMenu({headerEmojis, scrollToHeader, isFiltered, listWrapperStyle, forwardedRef, data, renderItem, stickyHeaderIndices, extraData, alwaysBounceVertical}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            {!isFiltered && (
                <CategoryShortcutBar
                    headerEmojis={headerEmojis}
                    onPress={scrollToHeader}
                />
            )}
            <View style={listWrapperStyle}>
                <FlashList
                    ref={forwardedRef}
                    keyboardShouldPersistTaps="handled"
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={CONST.EMOJI_NUM_PER_ROW}
                    stickyHeaderIndices={stickyHeaderIndices}
                    ListEmptyComponent={<Text style={[styles.textLabel, styles.colorMuted]}>{translate('common.noResultsFound')}</Text>}
                    alwaysBounceVertical={alwaysBounceVertical}
                    estimatedItemSize={CONST.EMOJI_PICKER_ITEM_HEIGHT}
                    contentContainerStyle={styles.ph4}
                    extraData={extraData}
                    getItemType={getItemType}
                />
            </View>
            <EmojiSkinToneList />
        </>
    );
}

BaseEmojiPickerMenu.propTypes = propTypes;
BaseEmojiPickerMenu.defaultProps = defaultProps;
BaseEmojiPickerMenu.displayName = 'BaseEmojiPickerMenu';

const BaseEmojiPickerMenuWithRef = React.forwardRef((props, ref) => (
    <BaseEmojiPickerMenu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

BaseEmojiPickerMenuWithRef.displayName = 'BaseEmojiPickerMenuWithRef';

export default BaseEmojiPickerMenuWithRef;
