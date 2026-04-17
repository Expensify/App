import type {ListRenderItem} from '@shopify/flash-list';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {AccessibilityInfo, View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
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
    const insets = useSafeAreaInsets();
    const {paddingLeft: safeAreaPaddingLeft, paddingRight: safeAreaPaddingRight} = StyleUtils.getPlatformSafeAreaPadding(insets);
    const [searchText, setSearchText] = useState('');

    const headerRefs = useRef<Record<number, React.RefObject<View | null>>>({});
    const pendingHeaderFocusIndexRef = useRef<number | null>(null);
    const [selectedHeaderIndex, setSelectedHeaderIndex] = useState<number | null>(null);

    const getHeaderRef = useCallback((index: number) => {
        if (!headerRefs.current[index]) {
            headerRefs.current[index] = React.createRef<View>();
        }
        return headerRefs.current[index];
    }, []);

    const focusHeaderAtIndex = useCallback((headerIndex: number) => {
        const headerRef = headerRefs.current[headerIndex];
        if (!headerRef?.current) {
            return false;
        }
        pendingHeaderFocusIndexRef.current = null;
        AccessibilityInfo.sendAccessibilityEvent(headerRef.current, 'focus');
        return true;
    }, []);

    const scheduleHeaderFocus = useCallback(
        function schedule(headerIndex: number, attempt = 0) {
            if (pendingHeaderFocusIndexRef.current !== headerIndex) {
                return;
            }
            if (focusHeaderAtIndex(headerIndex)) {
                return;
            }
            if (attempt >= 2) {
                return;
            }
            setTimeout(() => schedule(headerIndex, attempt + 1), CONST.ANIMATED_TRANSITION);
        },
        [focusHeaderAtIndex],
    );

    const handleHeaderLayout = useCallback(
        (index: number) => {
            if (pendingHeaderFocusIndexRef.current !== index) {
                return;
            }
            focusHeaderAtIndex(index);
        },
        [focusHeaderAtIndex],
    );

    const updateEmojiList = (emojiData: EmojiPickerList | Emoji[], headerData: number[] = []) => {
        setFilteredEmojis(emojiData);
        setHeaderIndices(headerData);

        requestAnimationFrame(() => {
            emojiListRef.current?.scrollToOffset({offset: 0, animated: false});
        });
    };

    const filterCallbackRef = useRef<(searchTerm: string) => void>(undefined);
    filterCallbackRef.current = (searchTerm: string) => {
        const [normalizedSearchTerm, newFilteredEmojiList] = suggestEmojis(searchTerm);

        if (normalizedSearchTerm === '') {
            updateEmojiList(allEmojis, headerRowIndices);
        } else {
            updateEmojiList(newFilteredEmojiList ?? [], []);
        }
    };

    // Stable debounced function that delegates to the latest callback via ref,
    // preventing re-renders from recreating the debounce timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const filterEmojis = useMemo(() => lodashDebounce((text: string) => filterCallbackRef.current?.(text), 300), []);

    const scrollToHeader = useCallback(
        (headerIndex: number) => {
            const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
            setSelectedHeaderIndex(headerIndex);
            pendingHeaderFocusIndexRef.current = headerIndex;
            emojiListRef.current?.scrollToOffset({offset: calculatedOffset, animated: true});
            scheduleHeaderFocus(headerIndex);
        },
        [emojiListRef, scheduleHeaderFocus],
    );

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     */
    const renderItem: ListRenderItem<EmojiPickerListItem> = useCallback(
        ({item, target, index}) => {
            const code = item.code;
            const types = 'types' in item ? item.types : undefined;

            if ('spacer' in item && item.spacer) {
                return null;
            }

            if ('header' in item && item.header) {
                return (
                    <View
                        ref={getHeaderRef(index)}
                        accessible
                        accessibilityRole="header"
                        accessibilityLabel={translate(`emojiPicker.headers.${code}` as TranslationPaths)}
                        style={[styles.emojiHeaderContainer, target === 'StickyHeader' ? styles.mh4 : {width: windowWidth}]}
                        onLayout={() => handleHeaderLayout(index)}
                    >
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
        [styles, windowWidth, preferredSkinTone, singleExecution, onEmojiSelected, translate, activeEmoji, getHeaderRef, handleHeaderLayout],
    );

    return (
        <View style={[styles.emojiPickerContainer, StyleUtils.getEmojiPickerStyle(shouldUseNarrowLayout)]}>
            <View style={[styles.p4, styles.pb3]}>
                <TextInput
                    label={translate('common.search')}
                    accessibilityLabel={translate('common.search')}
                    role={CONST.ROLE.PRESENTATION}
                    onChangeText={(text: string) => {
                        setSearchText(text);
                        filterEmojis(text);
                    }}
                    submitBehavior={filteredEmojis.length > 0 ? 'blurAndSubmit' : 'submit'}
                    sentryLabel={CONST.SENTRY_LABEL.EMOJI_PICKER.SEARCH_INPUT}
                />
            </View>
            <BaseEmojiPickerMenu
                isFiltered={isListFiltered}
                headerEmojis={headerEmojis}
                selectedHeaderIndex={selectedHeaderIndex}
                scrollToHeader={scrollToHeader}
                listWrapperStyle={[
                    listStyle,
                    {
                        width: Math.floor(windowWidth - safeAreaPaddingLeft - safeAreaPaddingRight),
                    },
                ]}
                ref={emojiListRef}
                data={filteredEmojis}
                renderItem={renderItem}
                extraData={[filteredEmojis, preferredSkinTone]}
                stickyHeaderIndices={headerIndices}
                alwaysBounceVertical={filteredEmojis.length !== 0}
                onMomentumScrollEnd={() => {
                    if (pendingHeaderFocusIndexRef.current == null) {
                        return;
                    }
                    scheduleHeaderFocus(pendingHeaderFocusIndexRef.current);
                }}
                searchValue={searchText}
            />
        </View>
    );
}

export default EmojiPickerMenu;
