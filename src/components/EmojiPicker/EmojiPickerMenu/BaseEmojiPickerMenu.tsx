import {FlashList} from '@shopify/flash-list';
import React, {useMemo} from 'react';
import type {ForwardedRef} from 'react';
import {StyleSheet, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import EmojiSkinToneList from '@components/EmojiPicker/EmojiSkinToneList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type EmojiPropTypes = {
    /** The code of the item */
    code: string,

    /** Whether the item is a header or not */
    header: boolean,

    /** Whether the item is a spacer or not */
    spacer: boolean,

    /** Types of an emoji - e.g. different skin types */
    types: string[],
}

type BaseEmojiPickerMenuProps = {
    /** Indicates if the emoji list is filtered or not */
    isFiltered: boolean,

    /** Array of header emojis */
    headerEmojis: EmojiPropTypes[],

    /** Function to scroll to a specific header in the emoji list */
    scrollToHeader: (headerIndex: number) => void,

    /** Style to be applied to the list wrapper */
    listWrapperStyle?: StyleProp<ViewStyle>,

    /** The data for the emoji list */
    data: EmojiPropTypes[],

    /** Function to render each item in the list */
    renderItem: () => void,

    /** Extra data to be passed to the list for re-rendering */
    // eslint-disable-next-line react/forbid-prop-types
    extraData?: Record<string, unknown>,

    /** Array of indices for the sticky headers */
    stickyHeaderIndices?: number[],

    /** Whether the list should always bounce vertically */
    alwaysBounceVertical?: boolean,
}

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

/**
 * Renders the list empty component
 * @returns {React.Component}
 */
function ListEmptyComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <Text style={[styles.textLabel, styles.colorMuted]}>{translate('common.noResultsFound')}</Text>;
}

function BaseEmojiPickerMenu({headerEmojis, scrollToHeader, isFiltered, listWrapperStyle, data, renderItem, stickyHeaderIndices, extraData, alwaysBounceVertical}: BaseEmojiPickerMenuProps, forwardedRef: ForwardedRef<FlashList<string>>) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();

    // Estimated list size should be a whole integer to avoid floating point precision errors
    // More info: https://github.com/Expensify/App/issues/34522
    const listWidth = isSmallScreenWidth ? Math.floor(windowWidth) : CONST.EMOJI_PICKER_SIZE.WIDTH;

    const flattenListWrapperStyle = useMemo(() => StyleSheet.flatten(listWrapperStyle), [listWrapperStyle]);

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
                    drawDistance={CONST.EMOJI_DRAW_AMOUNT}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={CONST.EMOJI_NUM_PER_ROW}
                    stickyHeaderIndices={stickyHeaderIndices}
                    ListEmptyComponent={ListEmptyComponent}
                    alwaysBounceVertical={alwaysBounceVertical}
                    estimatedItemSize={CONST.EMOJI_PICKER_ITEM_HEIGHT}
                    estimatedListSize={{height: flattenListWrapperStyle.height, width: listWidth}}
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
