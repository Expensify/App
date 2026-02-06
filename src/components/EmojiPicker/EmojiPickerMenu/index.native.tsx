import type {ListRenderItem} from '@shopify/flash-list';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback} from 'react';
import {InteractionManager, View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {EmojiPickerList, EmojiPickerListItem} from '@libs/EmojiUtils';
import {getRemovedSkinToneEmoji} from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import BaseEmojiPickerMenu from './BaseEmojiPickerMenu';
import type EmojiPickerMenuProps from './types';
import useEmojiPickerMenu from './useEmojiPickerMenu';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EmojiPickerMenu({onEmojiSelected, activeEmoji, ref}: EmojiPickerMenuProps) {
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

    const updateEmojiList = (emojiData: EmojiPickerList | Emoji[], headerData: number[] = []) => {
        setFilteredEmojis(emojiData);
        setHeaderIndices(headerData);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                emojiListRef.current?.scrollToOffset({offset: 0, animated: false});
            });
        });
    };

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     */
    const filterEmojis = lodashDebounce((searchTerm: string) => {
        const [normalizedSearchTerm, newFilteredEmojiList] = suggestEmojis(searchTerm);

        if (normalizedSearchTerm === '') {
            updateEmojiList(allEmojis, headerRowIndices);
        } else {
            updateEmojiList(newFilteredEmojiList ?? [], []);
        }
    }, 300);

    const scrollToHeader = useCallback(
        (headerIndex: number) => {
            const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
            emojiListRef.current?.scrollToOffset({offset: calculatedOffset, animated: true});
        },
        [emojiListRef],
    );

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     */
    const renderItem: ListRenderItem<EmojiPickerListItem> = useCallback(
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

            const emojiCode = typeof preferredSkinTone === 'number' && preferredSkinTone !== -1 && types?.at(preferredSkinTone) ? types.at(preferredSkinTone) : code;
            const shouldEmojiBeHighlighted = !!activeEmoji && getRemovedSkinToneEmoji(emojiCode) === getRemovedSkinToneEmoji(activeEmoji);

            return (
                <EmojiPickerMenuItem
                    onPress={singleExecution((emoji) => {
                        if (!('name' in item)) {
                            return;
                        }
                        onEmojiSelected(emoji, item, preferredSkinTone);
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
            <View style={[styles.p4, styles.pb3]}>
                <TextInput
                    label={translate('common.search')}
                    accessibilityLabel={translate('common.search')}
                    role={CONST.ROLE.PRESENTATION}
                    onChangeText={filterEmojis}
                    submitBehavior={filteredEmojis.length > 0 ? 'blurAndSubmit' : 'submit'}
                    sentryLabel={CONST.SENTRY_LABEL.EMOJI_PICKER.SEARCH_INPUT}
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

export default EmojiPickerMenu;
