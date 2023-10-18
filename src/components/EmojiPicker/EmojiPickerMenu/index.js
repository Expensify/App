import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import emojiAssets from '../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import Text from '../../Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import compose from '../../../libs/compose';
import getOperatingSystem from '../../../libs/getOperatingSystem';
import * as User from '../../../libs/actions/User';
import EmojiSkinToneList from '../EmojiSkinToneList';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import * as Browser from '../../../libs/Browser';
import CategoryShortcutBar from '../CategoryShortcutBar';
import TextInput from '../../TextInput';
import isEnterWhileComposition from '../../../libs/KeyboardShortcut/isEnterWhileComposition';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: PropTypes.func,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** Stores user's frequently used emojis */
    // eslint-disable-next-line react/forbid-prop-types
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.object),

    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    frequentlyUsedEmojis: [],
};

const throttleTime = Browser.isMobile() ? 200 : 50;

function EmojiPickerMenu(props) {
    const {forwardedRef, frequentlyUsedEmojis, preferredSkinTone, onEmojiSelected, preferredLocale, isSmallScreenWidth, windowHeight, translate} = props;

    // Ref for the emoji search input
    const searchInputRef = useRef(null);

    // Ref for emoji FlatList
    const emojiListRef = useRef(null);

    // We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
    // prevent auto focus when open picker for mobile device
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

    const firstNonHeaderIndex = useRef(0);

    /**
     * Calculate the filtered + header emojis and header row indices
     * @returns {Object}
     */
    function getEmojisAndHeaderRowIndices() {
        // If we're on Windows, don't display the flag emojis (the last category),
        // since Windows doesn't support them
        const flagHeaderIndex = _.findIndex(emojiAssets, (emoji) => emoji.header && emoji.code === 'flags');
        const filteredEmojis =
            getOperatingSystem() === CONST.OS.WINDOWS
                ? EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojiAssets.slice(0, flagHeaderIndex))
                : EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojiAssets);

        // Get the header emojis along with the code, index and icon.
        // index is the actual header index starting at the first emoji and counting each one
        const headerEmojis = EmojiUtils.getHeaderEmojis(filteredEmojis);

        // This is the indices of each header's Row
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index to the flatlist
        const headerRowIndices = _.map(headerEmojis, (headerEmoji) => Math.floor(headerEmoji.index / CONST.EMOJI_NUM_PER_ROW));

        return {filteredEmojis, headerEmojis, headerRowIndices};
    }

    const emojis = useRef([]);
    if (emojis.current.length === 0) {
        emojis.current = getEmojisAndHeaderRowIndices().filteredEmojis;
    }
    const headerRowIndices = useRef([]);
    if (headerRowIndices.current.length === 0) {
        headerRowIndices.current = getEmojisAndHeaderRowIndices().headerRowIndices;
    }
    const [headerEmojis, setHeaderEmojis] = useState(() => getEmojisAndHeaderRowIndices().headerEmojis);

    const [filteredEmojis, setFilteredEmojis] = useState(emojis.current);
    const [headerIndices, setHeaderIndices] = useState(headerRowIndices.current);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [arePointerEventsDisabled, setArePointerEventsDisabled] = useState(false);
    const [selection, setSelection] = useState({start: 0, end: 0});
    const [isFocused, setIsFocused] = useState(false);
    const [isUsingKeyboardMovement, setIsUsingKeyboardMovement] = useState(false);
    const [selectTextOnFocus, setSelectTextOnFocus] = useState(false);

    useEffect(() => {
        const emojisAndHeaderRowIndices = getEmojisAndHeaderRowIndices();
        emojis.current = emojisAndHeaderRowIndices.filteredEmojis;
        headerRowIndices.current = emojisAndHeaderRowIndices.headerRowIndices;
        setHeaderEmojis(emojisAndHeaderRowIndices.headerEmojis);
        setFilteredEmojis(emojis.current);
        setHeaderIndices(headerRowIndices.current);
    }, [frequentlyUsedEmojis]);

    /**
     * On text input selection change
     *
     * @param {Event} event
     */
    const onSelectionChange = useCallback((event) => {
        setSelection(event.nativeEvent.selection);
    }, []);

    /**
     * Find and store index of the first emoji item
     * @param {Array} filteredEmojisArr
     */
    function updateFirstNonHeaderIndex(filteredEmojisArr) {
        firstNonHeaderIndex.current = _.findIndex(filteredEmojisArr, (item) => !item.spacer && !item.header);
    }

    const mouseMoveHandler = useCallback(() => {
        if (!arePointerEventsDisabled) {
            return;
        }
        setArePointerEventsDisabled(false);
    }, [arePointerEventsDisabled]);

    /**
     * This function will be used with FlatList getItemLayout property for optimization purpose that allows skipping
     * the measurement of dynamic content if we know the size (height or width) of items ahead of time.
     * Generate and return an object with properties length(height of each individual row),
     * offset(distance of the current row from the top of the FlatList), index(current row index)
     *
     * @param {*} data FlatList item
     * @param {Number} index row index
     * @returns {Object}
     */
    const getItemLayout = useCallback((data, index) => ({length: CONST.EMOJI_PICKER_ITEM_HEIGHT, offset: CONST.EMOJI_PICKER_ITEM_HEIGHT * index, index}), []);

    /**
     * Focuses the search Input and has the text selected
     */
    function focusInputWithTextSelect() {
        if (!searchInputRef.current) {
            return;
        }

        setSelectTextOnFocus(true);
        searchInputRef.current.focus();
    }

    const filterEmojis = _.throttle((searchTerm) => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim().replaceAll(':', '');
        if (emojiListRef.current) {
            emojiListRef.current.scrollToOffset({offset: 0, animated: false});
        }
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            setFilteredEmojis(emojis.current);
            setHeaderIndices(headerRowIndices.current);
            setHighlightedIndex(-1);
            updateFirstNonHeaderIndex(emojis.current);
            return;
        }
        const newFilteredEmojiList = EmojiUtils.suggestEmojis(`:${normalizedSearchTerm}`, preferredLocale, emojis.current.length);

        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        setFilteredEmojis(newFilteredEmojiList);
        setHeaderIndices([]);
        setHighlightedIndex(0);
        updateFirstNonHeaderIndex(newFilteredEmojiList);
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

                // We only want to hightlight the Emoji if none was highlighted already
                // If we already have a highlighted Emoji, lets just skip the first navigation
                if (highlightedIndex !== -1) {
                    return;
                }
            }

            // If nothing is highlighted and an arrow key is pressed
            // select the first emoji, apply keyboard movement styles, and disable pointer events
            if (highlightedIndex === -1) {
                setHighlightedIndex(firstNonHeaderIndex.current);
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
                        () => highlightedIndex - 1 < firstNonHeaderIndex.current,
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
                        () => highlightedIndex - CONST.EMOJI_NUM_PER_ROW < firstNonHeaderIndex.current,
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
        [filteredEmojis, highlightedIndex, selection.end, selection.start],
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
            if (searchInputRef.current && !searchInputRef.current.isFocused()) {
                setSelectTextOnFocus(false);
                searchInputRef.current.focus();

                // Re-enable selection on the searchInput
                setSelectTextOnFocus(true);
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
        updateFirstNonHeaderIndex(emojis.current);

        return () => {
            cleanupEventHandlers();
        };
    }, [forwardedRef, shouldFocusInputOnScreenFocus, cleanupEventHandlers, setupEventHandlers]);

    const scrollToHeader = useCallback((headerIndex) => {
        if (!emojiListRef.current) {
            return;
        }

        const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
        emojiListRef.current.flashScrollIndicators();
        emojiListRef.current.scrollToOffset({offset: calculatedOffset, animated: true});
    }, []);

    /**
     * @param {Number} skinTone
     */
    const updatePreferredSkinTone = useCallback(
        (skinTone) => {
            if (Number(preferredSkinTone) === Number(skinTone)) {
                return;
            }

            User.updatePreferredSkinTone(skinTone);
        },
        [preferredSkinTone],
    );

    /**
     * Return a unique key for each emoji item
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {String}
     */
    const keyExtractor = useCallback((item, index) => `emoji_picker_${item.code}_${index}`, []);

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
        ({item, index}) => {
            const {code, header, types} = item;
            if (item.spacer) {
                return null;
            }

            if (header) {
                return (
                    <View style={styles.emojiHeaderContainer}>
                        <Text style={styles.textLabelSupporting}>{translate(`emojiPicker.headers.${code}`)}</Text>
                    </View>
                );
            }

            const emojiCode = types && types[preferredSkinTone] ? types[preferredSkinTone] : code;

            const isEmojiFocused = index === highlightedIndex && isUsingKeyboardMovement;

            return (
                <EmojiPickerMenuItem
                    onPress={(emoji) => onEmojiSelected(emoji, item)}
                    onHoverIn={() => {
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
                />
            );
        },
        [isUsingKeyboardMovement, highlightedIndex, onEmojiSelected, preferredSkinTone, translate],
    );

    const isFiltered = emojis.current.length !== filteredEmojis.length;
    const listStyle = StyleUtils.getEmojiPickerListHeight(isFiltered, windowHeight);
    const height = !listStyle.maxHeight || listStyle.height < listStyle.maxHeight ? listStyle.height : listStyle.maxHeight;
    const overflowLimit = Math.floor(height / CONST.EMOJI_PICKER_ITEM_HEIGHT) * 8;
    return (
        <View
            style={[styles.emojiPickerContainer, StyleUtils.getEmojiPickerStyle(isSmallScreenWidth)]}
            // Disable pointer events so that onHover doesn't get triggered when the items move while we're scrolling
            pointerEvents={arePointerEventsDisabled ? 'none' : 'auto'}
        >
            <View style={[styles.ph4, styles.pb3, styles.pt2]}>
                <TextInput
                    label={translate('common.search')}
                    accessibilityLabel={translate('common.search')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    onChangeText={filterEmojis}
                    defaultValue=""
                    ref={searchInputRef}
                    autoFocus={shouldFocusInputOnScreenFocus}
                    selectTextOnFocus={selectTextOnFocus}
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
            {!isFiltered && (
                <CategoryShortcutBar
                    headerEmojis={headerEmojis}
                    onPress={scrollToHeader}
                />
            )}
            <FlatList
                ref={emojiListRef}
                data={filteredEmojis}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                numColumns={CONST.EMOJI_NUM_PER_ROW}
                style={[
                    listStyle,
                    // This prevents elastic scrolling when scroll reaches the start or end
                    {overscrollBehaviorY: 'contain'},
                    // Set overflow to hidden to prevent elastic scrolling when there are not enough contents to scroll in FlatList
                    {overflowY: filteredEmojis.length > overflowLimit ? 'auto' : 'hidden'},
                    // Set scrollPaddingTop to consider sticky headers while scrolling
                    {scrollPaddingTop: isFiltered ? 0 : CONST.EMOJI_PICKER_ITEM_HEIGHT},
                ]}
                extraData={[filteredEmojis, highlightedIndex, preferredSkinTone]}
                stickyHeaderIndices={headerIndices}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.flexGrow1}
                ListEmptyComponent={<Text style={[styles.textLabel, styles.colorMuted]}>{translate('common.noResultsFound')}</Text>}
            />
            <EmojiSkinToneList
                updatePreferredSkinTone={updatePreferredSkinTone}
                preferredSkinTone={preferredSkinTone}
            />
        </View>
    );
}

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        frequentlyUsedEmojis: {
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
        },
    }),
)(
    React.forwardRef((props, ref) => (
        <EmojiPickerMenu
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
