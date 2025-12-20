import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItem} from '@shopify/flash-list';
import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import EmojiSkinToneList from '@components/EmojiPicker/EmojiSkinToneList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {EmojiPickerList, EmojiPickerListItem, HeaderIndices} from '@libs/EmojiUtils';
import CONST from '@src/CONST';

type BaseEmojiPickerMenuProps = {
    /** Indicates if the emoji list is filtered or not */
    isFiltered: boolean;

    /** Array of header emojis */
    headerEmojis: HeaderIndices[];

    /** Function to scroll to a specific header in the emoji list */
    scrollToHeader: (headerIndex: number) => void;

    /** Style to be applied to the list wrapper */
    listWrapperStyle?: StyleProp<ViewStyle>;

    /** The data for the emoji list */
    data: EmojiPickerList;

    /** Function to render each item in the list */
    renderItem: ListRenderItem<EmojiPickerListItem>;

    /** Extra data to be passed to the list for re-rendering */
    extraData?: Array<EmojiPickerList | OnyxEntry<string | number> | ((skinTone: number) => void)>;

    /** Array of indices for the sticky headers */
    stickyHeaderIndices?: number[];

    /** Whether the list should always bounce vertically */
    alwaysBounceVertical?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<FlashListRef<EmojiPickerListItem>>;
};

/**
 * Improves FlashList's recycling when there are different types of items
 */
const getItemType = (item: EmojiPickerListItem): string | undefined => {
    // item is undefined only when list is empty
    if (!item) {
        return;
    }

    if ('name' in item && item.name) {
        return CONST.EMOJI_PICKER_ITEM_TYPES.EMOJI;
    }
    if ('header' in item && item.header) {
        return CONST.EMOJI_PICKER_ITEM_TYPES.HEADER;
    }

    return CONST.EMOJI_PICKER_ITEM_TYPES.SPACER;
};

/**
 * Return a unique key for each emoji item
 *
 */
const keyExtractor = (item: EmojiPickerListItem, index: number): string => `emoji_picker_${item.code}_${index}`;

/**
 * Renders the list empty component
 */
function ListEmptyComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <Text style={[styles.textLabel, styles.colorMuted]}>{translate('common.noResultsFound')}</Text>;
}

function BaseEmojiPickerMenu({
    headerEmojis,
    scrollToHeader,
    isFiltered,
    listWrapperStyle = [],
    data,
    renderItem,
    stickyHeaderIndices = [],
    extraData = [],
    alwaysBounceVertical = false,
    ref,
}: BaseEmojiPickerMenuProps) {
    const styles = useThemeStyles();
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
                    ref={ref}
                    keyboardShouldPersistTaps="handled"
                    data={data}
                    drawDistance={CONST.EMOJI_DRAW_AMOUNT}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={CONST.EMOJI_NUM_PER_ROW}
                    stickyHeaderIndices={stickyHeaderIndices}
                    ListEmptyComponent={ListEmptyComponent}
                    alwaysBounceVertical={alwaysBounceVertical}
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
                    scrollEnabled={data.length > 0}
                />
            </View>
            <EmojiSkinToneList />
        </>
    );
}

export default BaseEmojiPickerMenu;
