import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {scrollTo} from 'react-native-reanimated';
import _ from 'underscore';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import BaseEmojiPickerMenu from './BaseEmojiPickerMenu';
import emojiPickerMenuPropTypes from './emojiPickerMenuPropTypes';
import useEmojiPickerMenu from './useEmojiPickerMenu';

const propTypes = {
    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: PropTypes.func,
    ...emojiPickerMenuPropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
};

const throttleTime = Browser.isMobile() ? 200 : 50;

function EmojiPickerMenu({forwardedRef, onEmojiSelected}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
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

    // Ref for the emoji search input
    const searchInputRef = useRef(null);

    // We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
    // prevent auto focus when open picker for mobile device
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [arePointerEventsDisabled, setArePointerEventsDisabled] = useState(false);
    const [selection, setSelection] = useState({start: 0, end: 0});
    const [isFocused, setIsFocused] = useState(false);
    const [isUsingKeyboardMovement, setIsUsingKeyboardMovement] = useState(false);
    const [highlightFirstEmoji, setHighlightFirstEmoji] = useState(false);
    const firstNonHeaderIndex = useMemo(() => _.findIndex(filteredEmojis, (item) => !item.spacer && !item.header), [filteredEmojis]);

    /**
     * On text input selection change
     *
     * @param {Event} event
     */
    const onSelectionChange = useCallback((event) => {
        setSelection(event.nativeEvent.selection);
    }, []);

    const mouseMoveHandler = useCallback(() => {
        if (!arePointerEventsDisabled) {
            return;
        }
        setArePointerEventsDisabled(false);
    }, [arePointerEventsDisabled]);

    /**
     * Focuses the search Input and has the text selected
     */
    function focusInputWithTextSelect() {
        if (!searchInputRef.current) {
            return;
        }
        searchInputRef.current.focus();
    }

    const filterEmojis = _.throttle((searchTerm) => {
        const [normalizedSearchTerm, newFilteredEmojiList] = suggestEmojis(searchTerm);

        if (emojiListRef.current) {
            scrollTo(emojiListRef, 0, 0, false);
        }
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            setFilteredEmojis(allEmojis);
            setHeaderIndices(headerRowIndices);
            setHighlightedIndex(-1);
            setHighlightFirstEmoji(false);
            return;
        }
        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        setFilteredEmojis(newFilteredEmojiList);
        setHeaderIndices([]);
        setHighlightedIndex(0);
        setHighlightFirstEmoji(true);
    }, throttleTime);

    /**
     * Highlights emojis adjacent to the currently highlighted emoji depending on the arrowKey
     * @param {String} arrowKey
     */
    const highlightAdjacentEmoji = useCallback(
        (arrowKey) => {
            if (filteredEmojis.length === 0) {
                return;
            }

            // Arrow Down and Arrow Right enable arrow navigation when search is focused
            if (searchInputRef.current && searchInputRef.current.isFocused()) {
                if (arrowKey !== 'ArrowDown' && arrowKey !== 'ArrowRight') {
                    return;
                }

                if (arrowKey === 'ArrowRight' && !(searchInputRef.current.value.length === selection.start && selection.start === selection.end)) {
                    return;
                }

                // Blur the input, change the highlight type to keyboard, and disable pointer events
                searchInputRef.current.blur();
                setArePointerEventsDisabled(true);
                setIsUsingKeyboardMovement(true);
                setHighlightFirstEmoji(false);

                // We only want to hightlight the Emoji if none was highlighted already
                // If we already have a highlighted Emoji, lets just skip the first navigation
                if (highlightedIndex !== -1) {
                    return;
                }
            }

            // If nothing is highlighted and an arrow key is pressed
            // select the first emoji, apply keyboard movement styles, and disable pointer events
            if (highlightedIndex === -1) {
                setHighlightedIndex(firstNonHeaderIndex);
                setArePointerEventsDisabled(true);
                setIsUsingKeyboardMovement(true);
                return;
            }

            let newIndex = highlightedIndex;
            const move = (steps, boundsCheck, onBoundReached = () => {}) => {
                if (boundsCheck()) {
                    onBoundReached();
                    return;
                }

                // Move in the prescribed direction until we reach an element that isn't a header
                const isHeader = (e) => e.header || e.spacer;
                do {
                    newIndex += steps;
                    if (newIndex < 0) {
                        break;
                    }
                } while (isHeader(filteredEmojis[newIndex]));
            };

            switch (arrowKey) {
                case 'ArrowDown':
                    move(CONST.EMOJI_NUM_PER_ROW, () => highlightedIndex + CONST.EMOJI_NUM_PER_ROW > filteredEmojis.length - 1);
                    break;
                case 'ArrowLeft':
                    move(
                        -1,
                        () => highlightedIndex - 1 < firstNonHeaderIndex,
                        () => {
                            // Reaching start of the list, arrow left set the focus to searchInput.
                            focusInputWithTextSelect();
                            newIndex = -1;
                        },
                    );
                    break;
                case 'ArrowRight':
                    move(1, () => highlightedIndex + 1 > filteredEmojis.length - 1);
                    break;
                case 'ArrowUp':
                    move(
                        -CONST.EMOJI_NUM_PER_ROW,
                        () => highlightedIndex - CONST.EMOJI_NUM_PER_ROW < firstNonHeaderIndex,
                        () => {
                            // Reaching start of the list, arrow up set the focus to searchInput.
                            focusInputWithTextSelect();
                            newIndex = -1;
                        },
                    );
                    break;
                default:
                    break;
            }

            // Actually highlight the new emoji, apply keyboard movement styles, and disable pointer events
            if (newIndex !== highlightedIndex) {
                setHighlightedIndex(newIndex);
                setArePointerEventsDisabled(true);
                setIsUsingKeyboardMovement(true);
            }
        },
        [filteredEmojis, firstNonHeaderIndex, highlightedIndex, selection.end, selection.start],
    );

    const keyDownHandler = useCallback(
        (keyBoardEvent) => {
            if (keyBoardEvent.key.startsWith('Arrow')) {
                if (!isFocused || keyBoardEvent.key === 'ArrowUp' || keyBoardEvent.key === 'ArrowDown') {
                    keyBoardEvent.preventDefault();
                }

                // Move the highlight when arrow keys are pressed
                highlightAdjacentEmoji(keyBoardEvent.key);
                return;
            }

            // Select the currently highlighted emoji if enter is pressed
            if (!isEnterWhileComposition(keyBoardEvent) && keyBoardEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && highlightedIndex !== -1) {
                const item = filteredEmojis[highlightedIndex];
                if (!item) {
                    return;
                }
                const emoji = lodashGet(item, ['types', preferredSkinTone], item.code);
                onEmojiSelected(emoji, item);
                // On web, avoid this Enter default input action; otherwise, it will add a new line in the subsequently focused composer.
                keyBoardEvent.preventDefault();
                // On mWeb, avoid propagating this Enter keystroke to Pressable child component; otherwise, it will trigger the onEmojiSelected callback again.
                keyBoardEvent.stopPropagation();
                return;
            }

            // Enable keyboard movement if tab or enter is pressed or if shift is pressed while the input
            // is not focused, so that the navigation and tab cycling can be done using the keyboard without
            // interfering with the input behaviour.
            if (keyBoardEvent.key === 'Tab' || keyBoardEvent.key === 'Enter' || (keyBoardEvent.key === 'Shift' && searchInputRef.current && !searchInputRef.current.isFocused())) {
                setIsUsingKeyboardMovement(true);
                return;
            }

            // We allow typing in the search box if any key is pressed apart from Arrow keys.
            if (searchInputRef.current && !searchInputRef.current.isFocused() && ReportUtils.shouldAutoFocusOnKeyPress(keyBoardEvent)) {
                searchInputRef.current.focus();
            }
        },
        [filteredEmojis, highlightAdjacentEmoji, highlightedIndex, isFocused, onEmojiSelected, preferredSkinTone],
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
        if (shouldFocusInputOnScreenFocus && forwardedRef && _.isFunction(forwardedRef)) {
            forwardedRef(searchInputRef.current);
        }

        setupEventHandlers();

        return () => {
            cleanupEventHandlers();
        };
    }, [forwardedRef, shouldFocusInputOnScreenFocus, cleanupEventHandlers, setupEventHandlers]);

    const scrollToHeader = useCallback(
        (headerIndex) => {
            if (!emojiListRef.current) {
                return;
            }

            const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
            scrollTo(emojiListRef, 0, calculatedOffset, true);
        },
        [emojiListRef],
    );

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {*}
     */
    const renderItem = useCallback(
        ({item, index, target}) => {
            const {code, types} = item;
            if (item.spacer) {
                return null;
            }

            if (item.header) {
                return (
                    <View style={[styles.emojiHeaderContainer, target === 'StickyHeader' ? styles.stickyHeaderEmoji(isSmallScreenWidth, windowWidth) : undefined]}>
                        <Text style={styles.textLabelSupporting}>{translate(`emojiPicker.headers.${code}`)}</Text>
                    </View>
                );
            }

            const emojiCode = types && types[preferredSkinTone] ? types[preferredSkinTone] : code;

            const isEmojiFocused = index === highlightedIndex && isUsingKeyboardMovement;
            const shouldEmojiBeHighlighted = index === highlightedIndex && highlightFirstEmoji;

            return (
                <EmojiPickerMenuItem
                    onPress={singleExecution((emoji) => onEmojiSelected(emoji, item))}
                    onHoverIn={() => {
                        setHighlightFirstEmoji(false);
                        if (!isUsingKeyboardMovement) {
                            return;
                        }
                        setIsUsingKeyboardMovement(false);
                    }}
                    emoji={emojiCode}
                    onFocus={() => setHighlightedIndex(index)}
                    onBlur={() =>
                        // Only clear the highlighted index if the highlighted index is the same,
                        // meaning that the focus changed to an element that is not an emoji item.
                        setHighlightedIndex((prevState) => (prevState === index ? -1 : prevState))
                    }
                    isFocused={isEmojiFocused}
                    isHighlighted={shouldEmojiBeHighlighted}
                />
            );
        },
        [preferredSkinTone, highlightedIndex, isUsingKeyboardMovement, highlightFirstEmoji, singleExecution, translate, onEmojiSelected, isSmallScreenWidth, windowWidth, styles],
    );

    return (
        <View
            style={[
                styles.emojiPickerContainer,
                StyleUtils.getEmojiPickerStyle(isSmallScreenWidth),
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
                    onSelectionChange={onSelectionChange}
                    onFocus={() => {
                        setHighlightedIndex(-1);
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
                listWrapperStyle={[
                    listStyle,
                    // Set scrollPaddingTop to consider sticky headers while scrolling
                    {scrollPaddingTop: isListFiltered ? 0 : CONST.EMOJI_PICKER_ITEM_HEIGHT},
                    styles.flexShrink1,
                ]}
                ref={emojiListRef}
                data={filteredEmojis}
                renderItem={renderItem}
                extraData={[highlightedIndex, preferredSkinTone]}
                stickyHeaderIndices={headerIndices}
            />
        </View>
    );
}

EmojiPickerMenu.displayName = 'EmojiPickerMenu';
EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

const EmojiPickerMenuWithRef = React.forwardRef((props, ref) => (
    <EmojiPickerMenu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

EmojiPickerMenuWithRef.displayName = 'EmojiPickerMenuWithRef';

export default EmojiPickerMenuWithRef;
