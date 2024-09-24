import type {ListRenderItem} from '@shopify/flash-list';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as EmojiUtils from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import BaseEmojiPickerMenu from './BaseEmojiPickerMenu';
import type EmojiPickerMenuProps from './types';
import useEmojiPickerMenu from './useEmojiPickerMenu';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EmojiPickerMenu({onEmojiSelected, activeEmoji}: EmojiPickerMenuProps, ref: ForwardedRef<BaseTextInputRef>) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {singleExecution} = useSingleExecution();
    const {
        allEmojis,
        headerEmojis,
        headerRowIndices,
        filteredEmojis,
        headerIndices,
        setFilteredEmojis,
        setHeaderIndices,
        isListFiltered,
        suggestEmojis,
        preferredSkinTone,
        listStyle,
        emojiListRef,
    } = useEmojiPickerMenu();
    const StyleUtils = useStyleUtils();

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     */
    const filterEmojis = lodashDebounce((searchTerm: string) => {
        const [normalizedSearchTerm, newFilteredEmojiList] = suggestEmojis(searchTerm);

        if (emojiListRef.current) {
            emojiListRef.current.scrollToOffset({offset: 0, animated: false});
        }

        if (normalizedSearchTerm === '') {
            setFilteredEmojis(allEmojis);
            setHeaderIndices(headerRowIndices);

            return;
        }

        setFilteredEmojis(newFilteredEmojiList ?? []);
        setHeaderIndices([]);
    }, 300);

    const scrollToHeader = (headerIndex: number) => {
        const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
        emojiListRef.current?.scrollToOffset({offset: calculatedOffset, animated: true});
    };

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     */
    const renderItem: ListRenderItem<EmojiUtils.EmojiPickerListItem> = useCallback(
        ({item, target}) => {
            const code = item.code;
            const types = 'types' in item ? item.types : undefined;

            if ('spacer' in item && item.spacer) {
                return null;
            }

            if ('header' in item && item.header) {
                return (
                    <View style={[styles.emojiHeaderContainer, target === 'StickyHeader' ? styles.mh4 : {width: windowWidth}]}>
                        <Text style={styles.textLabelSupporting}>{translate(`emojiPicker.headers.${code}` as TranslationPaths)}</Text>
                    </View>
                );
            }

            const emojiCode = typeof preferredSkinTone === 'number' && types?.at(preferredSkinTone) ? types.at(preferredSkinTone) : code;
            const shouldEmojiBeHighlighted = !!activeEmoji && EmojiUtils.getRemovedSkinToneEmoji(emojiCode) === EmojiUtils.getRemovedSkinToneEmoji(activeEmoji);

            return (
                <EmojiPickerMenuItem
                    onPress={singleExecution((emoji) => {
                        if (!('name' in item)) {
                            return;
                        }
                        onEmojiSelected(emoji, item);
                    })}
                    emoji={emojiCode ?? ''}
                    isHighlighted={shouldEmojiBeHighlighted}
                />
            );
        },
        [styles, windowWidth, preferredSkinTone, singleExecution, onEmojiSelected, translate, activeEmoji],
    );

    return (
        <View style={[styles.emojiPickerContainer, StyleUtils.getEmojiPickerStyle(shouldUseNarrowLayout)]}>
            <View style={[styles.ph4, styles.pb1, styles.pt2]}>
                <TextInput
                    label={translate('common.search')}
                    accessibilityLabel={translate('common.search')}
                    role={CONST.ROLE.PRESENTATION}
                    onChangeText={filterEmojis}
                    blurOnSubmit={filteredEmojis.length > 0}
                />
            </View>
            <BaseEmojiPickerMenu
                isFiltered={isListFiltered}
                headerEmojis={headerEmojis}
                scrollToHeader={scrollToHeader}
                listWrapperStyle={[
                    listStyle,
                    {
                        width: Math.floor(windowWidth),
                    },
                ]}
                ref={emojiListRef}
                data={filteredEmojis}
                renderItem={renderItem}
                extraData={[filteredEmojis, preferredSkinTone]}
                stickyHeaderIndices={headerIndices}
                alwaysBounceVertical={filteredEmojis.length !== 0}
            />
        </View>
    );
}

EmojiPickerMenu.displayName = 'EmojiPickerMenu';
export default React.forwardRef(EmojiPickerMenu);
