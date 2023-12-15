import {FlashList} from '@shopify/flash-list';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import EmojiSkinToneList from '@components/EmojiPicker/EmojiSkinToneList';
import refPropTypes from '@components/refPropTypes';
import stylePropTypes from '@styles/stylePropTypes';
import CONST from '@src/CONST';
import getItemType from './getItemType';

const emojiPropType = {
    code: PropTypes.string.isRequired,
    header: PropTypes.bool,
    spacer: PropTypes.bool,
    types: PropTypes.arrayOf(PropTypes.string),
};

const propTypes = {
    /** Indicates if the emoji list is filtered or not */
    isFiltered: PropTypes.bool.isRequired,

    /** Array of header emojis */
    headerEmojis: PropTypes.arrayOf(PropTypes.shape(emojiPropType)).isRequired,

    /** Function to scroll to a specific header in the emoji list */
    scrollToHeader: PropTypes.func.isRequired,

    /** Style to be applied to the list wrapper */
    listWrapperStyle: stylePropTypes,

    /** Reference to the emoji list */
    forwardedRef: refPropTypes,

    /** The data for the emoji list */
    data: PropTypes.arrayOf(PropTypes.shape(emojiPropType)).isRequired,

    /** Function to render each item in the list */
    renderItem: PropTypes.func.isRequired,

    /** Function to extract a unique key for each item in the list */
    keyExtractor: PropTypes.func.isRequired,

    /** Extra data to be passed to the list for re-rendering */
    extraData: PropTypes.array,

    /** Array of indices for the sticky headers */
    stickyHeaderIndices: PropTypes.arrayOf(PropTypes.number),

    /** Component to render when the list is empty */
    ListEmptyComponent: PropTypes.func,

    /** Style to be applied to the content container */
    contentContainerStyle: stylePropTypes,

    /** Current preferred skin tone for emojis */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Function to update the preferred skin tone */
    onUpdatePreferredSkinTone: PropTypes.func.isRequired,
};

const defaultProps = {
    isFiltered: false,
    headerEmojis: [],
    scrollToHeader: () => {},
    listWrapperStyle: [],
    forwardedRef: () => {},
    data: [],
    renderItem: () => {},
    keyExtractor: () => {},
    extraData: [],
    stickyHeaderIndices: [],
    ListEmptyComponent: () => {},
    contentContainerStyle: [],
    preferredSkinTone: null,
    onUpdatePreferredSkinTone: () => {},
};

function BaseEmojiPickerMenu({
    headerEmojis,
    scrollToHeader,
    isFiltered,
    listWrapperStyle,
    forwardedRef,
    data,
    renderItem,
    keyExtractor,
    stickyHeaderIndices,
    ListEmptyComponent,
    contentContainerStyle,
    onUpdatePreferredSkinTone,
    preferredSkinTone,
    extraData,
    alwaysBounceVertical,
}) {
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
                    ListEmptyComponent={ListEmptyComponent}
                    alwaysBounceVertical={alwaysBounceVertical}
                    estimatedItemSize={CONST.EMOJI_PICKER_ITEM_HEIGHT}
                    contentContainerStyle={contentContainerStyle}
                    extraData={extraData}
                    getItemType={getItemType}
                />
            </View>
            <EmojiSkinToneList
                updatePreferredSkinTone={onUpdatePreferredSkinTone}
                preferredSkinTone={preferredSkinTone}
            />
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
