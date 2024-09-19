import type {ListRenderItem} from '@shopify/flash-list';
import throttle from 'lodash/throttle';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import {scrollTo} from 'react-native-reanimated';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import * as EmojiUtils from '@libs/EmojiUtils';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import BaseEmojiPickerMenu from './BaseEmojiPickerMenu';
import type EmojiPickerMenuProps from './types';
import useEmojiPickerMenu from './useEmojiPickerMenu';

const throttleTime = Browser.isMobile() ? 200 : 50;

function EmojiPickerMenu({onEmojiSelected, activeEmoji}: EmojiPickerMenuProps, ref: ForwardedRef<BaseTextInputRef>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
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
        spacersIndexes,
    } = useEmojiPickerMenu();

    // Ref for the emoji search input
    const searchInputRef = useRef<BaseTextInputRef>(null);

    // We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
    // prevent auto focus when open picker for mobile device
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

    const [arePointerEventsDisabled, setArePointerEventsDisabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isUsingKeyboardMovement, setIsUsingKeyboardMovement] = useState(false);
    const [highlightEmoji, setHighlightEmoji] = useState(false);
    const [highlightFirstEmoji, setHighlightFirstEmoji] = useState(false);

    const mouseMoveHandler = useCallback(() => {
        if (!arePointerEventsDisabled) {
            return;
        }
        setArePointerEventsDisabled(false);
    }, [arePointerEventsDisabled]);

    const onFocusedIndexChange = useCallback(
        (newIndex: number) => {
            if (filteredEmojis.length === 0) {
                return;
            }

            if (highlightFirstEmoji) {
                setHighlightFirstEmoji(false);
            }

            if (!isUsingKeyboardMovement) {
                setIsUsingKeyboardMovement(true);
            }

            // If the input is not focused and the new index is out of range, focus the input
            if (newIndex < 0 && !isTextInputFocused(searchInputRef) && shouldFocusInputOnScreenFocus) {
                searchInputRef.current?.focus();
            }
        },
        [filteredEmojis.length, highlightFirstEmoji, isUsingKeyboardMovement, shouldFocusInputOnScreenFocus],
    );

    const disabledIndexes = useMemo(() => (isListFiltered ? [] : [...headerIndices, ...spacersIndexes]), [headerIndices, isListFiltered, spacersIndexes]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        maxIndex: filteredEmojis.length - 1,
        // Spacers indexes need to be disabled so that the arrow keys don't focus them. All headers are hidden when list is filtered
        disabledIndexes,
        itemsPerRow: CONST.EMOJI_NUM_PER_ROW,
        initialFocusedIndex: -1,
        disableCyclicTraversal: true,
        onFocusedIndexChange,
        allowHorizontalArrowKeys: !isFocused,
        // We pass true without checking visibility of the component because if the popover is not visible this picker won't be mounted
        isActive: true,
        allowNegativeIndexes: true,
    });

    const filterEmojis = throttle((searchTerm: string) => {
        const [normalizedSearchTerm, newFilteredEmojiList] = suggestEmojis(searchTerm);

        emojiListRef.current?.scrollToOffset({offset: 0, animated: false});
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            setFilteredEmojis(allEmojis);
            setHeaderIndices(headerRowIndices);
            setFocusedIndex(-1);
            setHighlightEmoji(false);
            return;
        }
        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        setFilteredEmojis(newFilteredEmojiList ?? []);
        setHeaderIndices([]);
        setHighlightFirstEmoji(true);
        setIsUsingKeyboardMovement(false);
    }, throttleTime);

    const keyDownHandler = useCallback(
        (keyBoardEvent: KeyboardEvent) => {
            if (keyBoardEvent.key.startsWith('Arrow')) {
                if (!isFocused || keyBoardEvent.key === 'ArrowUp' || keyBoardEvent.key === 'ArrowDown') {
                    keyBoardEvent.preventDefault();
                }

                return;
            }

            if (!isEnterWhileComposition(keyBoardEvent) && keyBoardEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                // On web, avoid this Enter default input action; otherwise, it will add a new line in the subsequently focused composer.
                keyBoardEvent.preventDefault();
                // On mWeb, avoid propagating this Enter keystroke to Pressable child component; otherwise, it will trigger the onEmojiSelected callback again.
                keyBoardEvent.stopPropagation();
                return;
            }

            // Enable keyboard movement if tab or enter is pressed or if shift is pressed while the input
            // is not focused, so that the navigation and tab cycling can be done using the keyboard without
            // interfering with the input behaviour.
            if (keyBoardEvent.key === 'Tab' || keyBoardEvent.key === 'Enter' || (keyBoardEvent.key === 'Shift' && searchInputRef.current && !isTextInputFocused(searchInputRef))) {
                setIsUsingKeyboardMovement(true);
            }

            // We allow typing in the search box if any key is pressed apart from Arrow keys.
            if (searchInputRef.current && !isTextInputFocused(searchInputRef) && ReportUtils.shouldAutoFocusOnKeyPress(keyBoardEvent)) {
                searchInputRef.current.focus();
            }
        },
        [isFocused],
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        (keyBoardEvent) => {
            if (!(keyBoardEvent instanceof KeyboardEvent) || isEnterWhileComposition(keyBoardEvent) || keyBoardEvent.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                return;
            }

            // Select the currently highlighted emoji if enter is pressed
            let indexToSelect = focusedIndex;
            if (highlightFirstEmoji) {
                indexToSelect = 0;
            }

            const item = filteredEmojis[indexToSelect];
            if (!item) {
                return;
            }
            if ('types' in item || 'name' in item) {
                const emoji = typeof preferredSkinTone === 'number' && item?.types?.[preferredSkinTone] ? item?.types?.[preferredSkinTone] : item.code;
                onEmojiSelected(emoji, item);
            }
        },
        {shouldPreventDefault: true, shouldStopPropagation: true},
    );

    /**
     * Setup and attach keypress/mouse handlers for highlight navigation.
     */
    const setupEventHandlers = useCallback(() => {
        if (!document) {
            return;
        }

        // Keyboard events are not bubbling on TextInput in RN-Web, Bubbling was needed for this event to trigger
        // event handler attached to document root. To fix this, trigger event handler in Capture phase.
        document.addEventListener('keydown', keyDownHandler, true);

        // Re-enable pointer events and hovering over EmojiPickerItems when the mouse moves
        document.addEventListener('mousemove', mouseMoveHandler);
    }, [keyDownHandler, mouseMoveHandler]);

    /**
     * Cleanup all mouse/keydown event listeners that we've set up
     */
    const cleanupEventHandlers = useCallback(() => {
        if (!document) {
            return;
        }

        document.removeEventListener('keydown', keyDownHandler, true);
        document.removeEventListener('mousemove', mouseMoveHandler);
    }, [keyDownHandler, mouseMoveHandler]);

    useEffect(() => {
        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (shouldFocusInputOnScreenFocus && ref && typeof ref === 'function') {
            ref(searchInputRef.current);
        }

        setupEventHandlers();

        return () => {
            cleanupEventHandlers();
        };
    }, [ref, shouldFocusInputOnScreenFocus, cleanupEventHandlers, setupEventHandlers]);

    const scrollToHeader = useCallback(
        (headerIndex: number) => {
            if (!emojiListRef.current) {
                return;
            }

            const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
            emojiListRef.current?.scrollToOffset({offset: calculatedOffset, animated: true});
        },
        [emojiListRef],
    );

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     *
     */
    const renderItem: ListRenderItem<EmojiUtils.EmojiPickerListItem> = useCallback(
        ({item, index, target}) => {
            const code = item.code;
            const types = 'types' in item ? item.types : undefined;

            if ('spacer' in item && item.spacer) {
                return null;
            }

            if ('header' in item && item.header) {
                return (
                    <View style={[styles.emojiHeaderContainer, target === 'StickyHeader' ? styles.stickyHeaderEmoji(shouldUseNarrowLayout, windowWidth) : undefined]}>
                        <Text style={styles.textLabelSupporting}>{translate(`emojiPicker.headers.${code}` as TranslationPaths)}</Text>
                    </View>
                );
            }

            const emojiCode = typeof preferredSkinTone === 'number' && types?.[preferredSkinTone] ? types[preferredSkinTone] : code;

            const isEmojiFocused = index === focusedIndex && isUsingKeyboardMovement;
            const shouldEmojiBeHighlighted =
                (index === focusedIndex && highlightEmoji) || (!!activeEmoji && EmojiUtils.getRemovedSkinToneEmoji(emojiCode) === EmojiUtils.getRemovedSkinToneEmoji(activeEmoji));
            const shouldFirstEmojiBeHighlighted = index === 0 && highlightFirstEmoji;

            return (
                <EmojiPickerMenuItem
                    onPress={singleExecution((emoji) => {
                        if (!('name' in item)) {
                            return;
                        }
                        onEmojiSelected(emoji, item);
                    })}
                    onHoverIn={() => {
                        setHighlightEmoji(false);
                        setHighlightFirstEmoji(false);
                        if (!isUsingKeyboardMovement) {
                            return;
                        }
                        setIsUsingKeyboardMovement(false);
                    }}
                    emoji={emojiCode}
                    onFocus={() => setFocusedIndex(index)}
                    isFocused={isEmojiFocused}
                    isHighlighted={shouldFirstEmojiBeHighlighted || shouldEmojiBeHighlighted}
                />
            );
        },
        [
            preferredSkinTone,
            focusedIndex,
            isUsingKeyboardMovement,
            highlightEmoji,
            highlightFirstEmoji,
            singleExecution,
            styles,
            shouldUseNarrowLayout,
            windowWidth,
            translate,
            onEmojiSelected,
            setFocusedIndex,
            activeEmoji,
        ],
    );

    return (
        <View
            style={[
                styles.emojiPickerContainer,
                StyleUtils.getEmojiPickerStyle(shouldUseNarrowLayout),
                // Disable pointer events so that onHover doesn't get triggered when the items move while we're scrolling
                arePointerEventsDisabled ? styles.pointerEventsNone : styles.pointerEventsAuto,
            ]}
        >
            <View style={[styles.ph4, styles.pb3, styles.pt2]}>
                <TextInput
                    label={translate('common.search')}
                    accessibilityLabel={translate('common.search')}
                    role={CONST.ROLE.PRESENTATION}
                    onChangeText={filterEmojis}
                    defaultValue=""
                    ref={searchInputRef}
                    autoFocus={shouldFocusInputOnScreenFocus}
                    onFocus={() => {
                        setFocusedIndex(-1);
                        setIsFocused(true);
                        setIsUsingKeyboardMovement(false);
                    }}
                    onBlur={() => setIsFocused(false)}
                    autoCorrect={false}
                    blurOnSubmit={filteredEmojis.length > 0}
                />
            </View>
            <BaseEmojiPickerMenu
                isFiltered={isListFiltered}
                headerEmojis={headerEmojis}
                scrollToHeader={scrollToHeader}
                listWrapperStyle={[listStyle, styles.flexShrink1]}
                ref={emojiListRef}
                data={filteredEmojis}
                renderItem={renderItem}
                extraData={[focusedIndex, preferredSkinTone]}
                stickyHeaderIndices={headerIndices}
            />
        </View>
    );
}

EmojiPickerMenu.displayName = 'EmojiPickerMenu';
export default React.forwardRef(EmojiPickerMenu);
