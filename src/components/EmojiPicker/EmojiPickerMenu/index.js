import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {scrollTo} from 'react-native-reanimated';
import _ from 'underscore';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
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
        spacersIndexes,
    } = useEmojiPickerMenu();

    // Ref for the emoji search input
    const searchInputRef = useRef(null);

    // We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
    // prevent auto focus when open picker for mobile device
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

    const [arePointerEventsDisabled, setArePointerEventsDisabled] = useState(false);
    const [isUsingKeyboardMovement, setIsUsingKeyboardMovement] = useState(false);
    const [highlightFirstEmoji, setHighlightFirstEmoji] = useState(false);

    const onFocusedIndexChange = useCallback(
        (newIndex) => {
            if (filteredEmojis.length === 0) {
                return;
            }

            if (!isUsingKeyboardMovement) {
                setIsUsingKeyboardMovement(true);
            }

            if (!arePointerEventsDisabled) {
                setArePointerEventsDisabled(true);
            }
            // If the input is not focused and the highlighted index is -1, focus the input
            if (newIndex < 0 && !searchInputRef.current.isFocused()) {
                searchInputRef.current.focus();
            }
        },
        [arePointerEventsDisabled, filteredEmojis.length, isUsingKeyboardMovement],
    );

    const [highlightedIndex, setHighlightedIndex] = useArrowKeyFocusManager({
        maxIndex: filteredEmojis.length - 1,
        disabledIndexes: isListFiltered ? [] : [...headerIndices, ...spacersIndexes],
        itemsPerRow: CONST.EMOJI_NUM_PER_ROW,
        initialFocusedIndex: -1,
        disableCyclicTraversal: true,
        onFocusedIndexChange,
    });

    const mouseMoveHandler = useCallback(() => {
        if (!arePointerEventsDisabled) {
            return;
        }

        setArePointerEventsDisabled(false);
    }, [arePointerEventsDisabled]);

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
     * Setup and attach keypress/mouse handlers for highlight navigation.
     */
    const setupEventHandlers = useCallback(() => {
        if (!document) {
            return;
        }

        // Re-enable pointer events and hovering over EmojiPickerItems when the mouse moves
        document.addEventListener('mousemove', mouseMoveHandler);
    }, [mouseMoveHandler]);

    /**
     * Cleanup all mouse/keydown event listeners that we've set up
     */
    const cleanupEventHandlers = useCallback(() => {
        if (!document) {
            return;
        }

        document.removeEventListener('mousemove', mouseMoveHandler);
    }, [mouseMoveHandler]);

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
                        // setHighlightFirstEmoji(false);
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
        [
            preferredSkinTone,
            highlightedIndex,
            isUsingKeyboardMovement,
            highlightFirstEmoji,
            singleExecution,
            styles,
            isSmallScreenWidth,
            windowWidth,
            translate,
            onEmojiSelected,
            setHighlightedIndex,
        ],
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
                    onFocus={() => {
                        setHighlightedIndex(-1);
                        setIsUsingKeyboardMovement(false);
                    }}
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
