import {FlashList} from '@shopify/flash-list';
import type {ListRenderItem} from '@shopify/flash-list';
import React, {useMemo} from 'react';
import type {LegacyRef} from 'react';
import {StyleSheet, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {Emoji, HeaderEmoji, PickerEmoji, PickerEmojis} from '@assets/emojis/types';
import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import EmojiSkinToneList from '@components/EmojiPicker/EmojiSkinToneList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {OnyxValue} from '@src/ONYXKEYS';
import type {EmojiPropTypes, RenderItemProps} from './types';

type BaseEmojiPickerMenuProps = {
    /** Indicates if the emoji list is filtered or not */
    isFiltered: boolean;

    /** Array of header emojis */
    headerEmojis: EmojiPropTypes[];

    /** Function to scroll to a specific header in the emoji list */
    scrollToHeader: (headerIndex: number) => void;

    /** Style to be applied to the list wrapper */
    listWrapperStyle?: StyleProp<ViewStyle>;

    /** The data for the emoji list */
    data: PickerEmoji[];

    /** Function to render each item in the list */
    renderItem: ({item, target}: RenderItemProps) => void;

    /** Extra data to be passed to the list for re-rendering */
    extraData?: Array<PickerEmojis | OnyxValue<'preferredEmojiSkinTone'> | ((skinTone: number) => void)>;

    /** Array of indices for the sticky headers */
    stickyHeaderIndices?: number[];

    /** Whether the list should always bounce vertically */
    alwaysBounceVertical?: boolean;
};

type GetItemTypeProps = Partial<HeaderEmoji> & Partial<Emoji>;

/**
 * Improves FlashList's recycling when there are different types of items
 * @param item
 */
const getItemType = (item: GetItemTypeProps): string | undefined => {
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
 */
const keyExtractor = (item: PickerEmoji, index: number): string => `emoji_picker_${item.code}_${index}`;

/**
 * Renders the list empty component
 */
function ListEmptyComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <Text style={[styles.textLabel, styles.colorMuted]}>{translate('common.noResultsFound')}</Text>;
}

function BaseEmojiPickerMenu(
    {headerEmojis, scrollToHeader, isFiltered, listWrapperStyle, data, renderItem, stickyHeaderIndices, extraData, alwaysBounceVertical}: BaseEmojiPickerMenuProps,
    forwardedRef: LegacyRef<FlashList<PickerEmoji>>,
) {
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
                    renderItem={renderItem as ListRenderItem<PickerEmoji>}
                    keyExtractor={keyExtractor}
                    numColumns={CONST.EMOJI_NUM_PER_ROW}
                    stickyHeaderIndices={stickyHeaderIndices}
                    ListEmptyComponent={ListEmptyComponent}
                    alwaysBounceVertical={alwaysBounceVertical}
                    estimatedItemSize={CONST.EMOJI_PICKER_ITEM_HEIGHT}
                    estimatedListSize={{height: flattenListWrapperStyle.height as number, width: listWidth}}
                    contentContainerStyle={styles.ph4}
                    extraData={extraData}
                    getItemType={getItemType}
                    overrideProps={{
                        // scrollPaddingTop set to consider sticky header while scrolling, https://github.com/Expensify/App/issues/36883
                        style: {
                            minHeight: 1,
                            minWidth: 1,
                            scrollPaddingTop: isFiltered ? 0 : CONST.EMOJI_PICKER_ITEM_HEIGHT,
                        },
                    }}
                />
            </View>
            <EmojiSkinToneList />
        </>
    );
}

BaseEmojiPickerMenu.displayName = 'BaseEmojiPickerMenu';

export default React.forwardRef(BaseEmojiPickerMenu);
