import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import Text from '../../Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import compose from '../../../libs/compose';
import getOperatingSystem from '../../../libs/getOperatingSystem';
import * as User from '../../../libs/actions/User';
import EmojiSkinToneList from '../EmojiSkinToneList';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import CategoryShortcutBar from '../CategoryShortcutBar';
import TextInput from '../../TextInput';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: PropTypes.func,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** User's frequently used emojis */
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.shape({
        code: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string),
    })),

    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    frequentlyUsedEmojis: [],
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // Ref for the emoji search input
        this.searchInput = undefined;

        // Ref for emoji FlatList
        this.emojiList = undefined;

        // If we're on Windows, don't display the flag emojis (the last category),
        // since Windows doesn't support them
        const flagHeaderIndex = _.findIndex(emojis, emoji => emoji.header && emoji.code === 'flags');
        this.emojis = getOperatingSystem() === CONST.OS.WINDOWS
            ? EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis.slice(0, flagHeaderIndex), this.props.frequentlyUsedEmojis)
            : EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis, this.props.frequentlyUsedEmojis);

        // Get the header emojis along with the code, index and icon.
        // index is the actual header index starting at the first emoji and counting each one
        this.headerEmojis = EmojiUtils.getHeaderEmojis(this.emojis);

        // This is the indices of each header's Row
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index to the flatlist
        this.headerRowIndices = _.map(this.headerEmojis, headerEmoji => Math.floor(headerEmoji.index / CONST.EMOJI_NUM_PER_ROW));

        this.filterEmojis = _.debounce(this.filterEmojis.bind(this), 300);
        this.highlightAdjacentEmoji = this.highlightAdjacentEmoji.bind(this);
        this.scrollToHighlightedIndex = this.scrollToHighlightedIndex.bind(this);
        this.setupEventHandlers = this.setupEventHandlers.bind(this);
        this.cleanupEventHandlers = this.cleanupEventHandlers.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.isMobileLandscape = this.isMobileLandscape.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.updatePreferredSkinTone = this.updatePreferredSkinTone.bind(this);
        this.setFirstNonHeaderIndex = this.setFirstNonHeaderIndex.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
        this.scrollToHeader = this.scrollToHeader.bind(this);

        this.currentScrollOffset = 0;
        this.firstNonHeaderIndex = 0;

        this.state = {
            filteredEmojis: this.emojis,
            headerIndices: this.headerRowIndices,
            highlightedIndex: -1,
            arePointerEventsDisabled: false,
            selection: {
                start: 0,
                end: 0,
            },
            isFocused: false,
            isUsingKeyboardMovement: false,
        };
    }

    componentDidMount() {
        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.searchInput);
        }
        this.setupEventHandlers();
        this.setFirstNonHeaderIndex(this.emojis);
    }

    componentWillUnmount() {
        this.cleanupEventHandlers();
    }

    /**
     * On text input selection change
     *
     * @param {Event} event
     */
    onSelectionChange(event) {
        this.setState({selection: event.nativeEvent.selection});
    }

    /**
     * Find and store index of the first emoji item
     * @param {Array} filteredEmojis
     */
    setFirstNonHeaderIndex(filteredEmojis) {
        this.firstNonHeaderIndex = _.findIndex(filteredEmojis, item => !item.spacer && !item.header);
    }

    /**
     * Setup and attach keypress/mouse handlers for highlight navigation.
     */
    setupEventHandlers() {
        if (!document) {
            return;
        }

        this.keyDownHandler = (keyBoardEvent) => {
            if (keyBoardEvent.key.startsWith('Arrow')) {
                if (!this.state.isFocused || keyBoardEvent.key === 'ArrowUp' || keyBoardEvent.key === 'ArrowDown') {
                    keyBoardEvent.preventDefault();
                }

                // Move the highlight when arrow keys are pressed
                this.highlightAdjacentEmoji(keyBoardEvent.key);
                return;
            }

            // Select the currently highlighted emoji if enter is pressed
            if (keyBoardEvent.key === 'Enter' && this.state.highlightedIndex !== -1) {
                const item = this.state.filteredEmojis[this.state.highlightedIndex];
                if (!item) {
                    return;
                }
                const emoji = lodashGet(item, ['types', this.props.preferredSkinTone], item.code);
                this.addToFrequentAndSelectEmoji(emoji, item);
                return;
            }

            // Return if the key is related to any tab cycling event so that the default logic
            // can be executed.
            if (keyBoardEvent.key === 'Tab' || keyBoardEvent.key === 'Shift' || keyBoardEvent.key === 'Enter') {
                this.setState({isUsingKeyboardMovement: true});
                return;
            }

            // We allow typing in the search box if any key is pressed apart from Arrow keys.
            if (this.searchInput && !this.searchInput.isFocused()) {
                this.setState({selectTextOnFocus: false});
                this.searchInput.focus();

                // Re-enable selection on the searchInput
                this.setState({selectTextOnFocus: true});
            }
        };

        // Keyboard events are not bubbling on TextInput in RN-Web, Bubbling was needed for this event to trigger
        // event handler attached to document root. To fix this, trigger event handler in Capture phase.
        document.addEventListener('keydown', this.keyDownHandler, true);

        // Re-enable pointer events and hovering over EmojiPickerItems when the mouse moves
        this.mouseMoveHandler = () => {
            if (!this.state.arePointerEventsDisabled) {
                return;
            }

            this.setState({arePointerEventsDisabled: false});
        };
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

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
    getItemLayout(data, index) {
        return {length: CONST.EMOJI_PICKER_ITEM_HEIGHT, offset: CONST.EMOJI_PICKER_ITEM_HEIGHT * index, index};
    }

    /**
     * Cleanup all mouse/keydown event listeners that we've set up
     */
    cleanupEventHandlers() {
        if (!document) {
            return;
        }

        document.removeEventListener('keydown', this.keyDownHandler, true);
        document.removeEventListener('mousemove', this.mouseMoveHandler);
    }

    /**
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    addToFrequentAndSelectEmoji(emoji, emojiObject) {
        EmojiUtils.addToFrequentlyUsedEmojis(this.props.frequentlyUsedEmojis, emojiObject);
        this.props.onEmojiSelected(emoji, emojiObject);
    }

    /**
     * Focuses the search Input and has the text selected
     */
    focusInputWithTextSelect() {
        if (!this.searchInput) {
            return;
        }

        this.setState({selectTextOnFocus: true});
        this.searchInput.focus();
    }

    /**
     * Highlights emojis adjacent to the currently highlighted emoji depending on the arrowKey
     * @param {String} arrowKey
     */
    highlightAdjacentEmoji(arrowKey) {
        if (this.state.filteredEmojis.length === 0) {
            return;
        }

        // Arrow Down and Arrow Right enable arrow navigation when search is focused
        if (this.searchInput && this.searchInput.isFocused()) {
            if (arrowKey !== 'ArrowDown' && arrowKey !== 'ArrowRight') {
                return;
            }

            if (arrowKey === 'ArrowRight'
                  && !(
                      this.searchInput.value.length === this.state.selection.start
                      && this.state.selection.start === this.state.selection.end
                  )
            ) {
                return;
            }

            // Blur the input and change the highlight type to keyboard
            this.searchInput.blur();
            this.setState({isUsingKeyboardMovement: true});

            // We only want to hightlight the Emoji if none was highlighted already
            // If we already have a highlighted Emoji, lets just skip the first navigation
            if (this.state.highlightedIndex !== -1) {
                return;
            }
        }

        // If nothing is highlighted and an arrow key is pressed
        // select the first emoji
        if (this.state.highlightedIndex === -1) {
            this.setState({highlightedIndex: this.firstNonHeaderIndex});
            this.scrollToHighlightedIndex();
            return;
        }

        let newIndex = this.state.highlightedIndex;
        const move = (steps, boundsCheck, onBoundReached = () => {}) => {
            if (boundsCheck()) {
                onBoundReached();
                return;
            }

            // Move in the prescribed direction until we reach an element that isn't a header
            const isHeader = e => e.header || e.spacer;
            do {
                newIndex += steps;
                if (newIndex < 0) {
                    break;
                }
            } while (isHeader(this.state.filteredEmojis[newIndex]));
        };

        switch (arrowKey) {
            case 'ArrowDown':
                move(
                    CONST.EMOJI_NUM_PER_ROW,
                    () => this.state.highlightedIndex + CONST.EMOJI_NUM_PER_ROW > this.state.filteredEmojis.length - 1,
                );
                break;
            case 'ArrowLeft':
                move(-1,
                    () => this.state.highlightedIndex - 1 < this.firstNonHeaderIndex,
                    () => {
                        // Reaching start of the list, arrow left set the focus to searchInput.
                        this.focusInputWithTextSelect();
                        newIndex = -1;
                    });
                break;
            case 'ArrowRight':
                move(1, () => this.state.highlightedIndex + 1 > this.state.filteredEmojis.length - 1);
                break;
            case 'ArrowUp':
                move(
                    -CONST.EMOJI_NUM_PER_ROW,
                    () => this.state.highlightedIndex - CONST.EMOJI_NUM_PER_ROW < this.firstNonHeaderIndex,
                    () => {
                        // Reaching start of the list, arrow up set the focus to searchInput.
                        this.focusInputWithTextSelect();
                        newIndex = -1;
                    },
                );
                break;
            default:
                break;
        }

        // Actually highlight the new emoji, apply keyboard movement styles, and scroll to it if the index was changed
        if (newIndex !== this.state.highlightedIndex) {
            this.setState({highlightedIndex: newIndex, isUsingKeyboardMovement: true});
            this.scrollToHighlightedIndex();
        }
    }

    scrollToHeader(headerIndex) {
        const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
        this.emojiList.flashScrollIndicators();
        this.emojiList.scrollToOffset({offset: calculatedOffset, animated: true});
    }

    /**
     * Calculates the required scroll offset (aka distance from top) and scrolls the FlatList to the highlighted emoji
     * if any portion of it falls outside of the window.
     * Doing this because scrollToIndex doesn't work as expected.
     */
    scrollToHighlightedIndex() {
        // Calculate the number of rows above the current row, then add 1 to include the current row
        const numRows = Math.floor(this.state.highlightedIndex / CONST.EMOJI_NUM_PER_ROW) + 1;

        // The scroll offsets at the top and bottom of the highlighted emoji
        const offsetAtEmojiBottom = numRows * CONST.EMOJI_PICKER_HEADER_HEIGHT;
        const offsetAtEmojiTop = offsetAtEmojiBottom - CONST.EMOJI_PICKER_ITEM_HEIGHT;

        // Scroll to fit the entire highlighted emoji into the window if we need to
        let targetOffset = this.currentScrollOffset;
        if (offsetAtEmojiBottom - this.currentScrollOffset >= CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT) {
            targetOffset = offsetAtEmojiBottom - CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT;
        } else if (offsetAtEmojiTop - CONST.EMOJI_PICKER_HEADER_HEIGHT <= this.currentScrollOffset) {
            // There is always a sticky header on the top, subtract the EMOJI_PICKER_HEADER_HEIGHT from offsetAtEmojiTop to get the correct scroll position.
            targetOffset = offsetAtEmojiTop - CONST.EMOJI_PICKER_HEADER_HEIGHT;
        }
        if (targetOffset !== this.currentScrollOffset) {
            // Disable pointer events so that onHover doesn't get triggered when the items move while we're scrolling
            if (!this.state.arePointerEventsDisabled) {
                this.setState({arePointerEventsDisabled: true});
            }
            this.emojiList.scrollToOffset({offset: targetOffset, animated: false});
        }
    }

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     *
     * @param {String} searchTerm
     */
    filterEmojis(searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (this.emojiList) {
            this.emojiList.scrollToOffset({offset: 0, animated: false});
        }
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            this.setState({
                filteredEmojis: this.emojis,
                headerIndices: this.headerRowIndices,
                highlightedIndex: -1,
            });
            this.setFirstNonHeaderIndex(this.emojis);
            return;
        }
        const newFilteredEmojiList = EmojiUtils.suggestEmojis(`:${normalizedSearchTerm}`, this.emojis.length);

        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        this.setState({filteredEmojis: newFilteredEmojiList, headerIndices: [], highlightedIndex: 0});
        this.setFirstNonHeaderIndex(newFilteredEmojiList);
    }

    /**
     * Check if its a landscape mode of mobile device
     *
     * @returns {Boolean}
     */
    isMobileLandscape() {
        return this.props.isSmallScreenWidth && this.props.windowWidth >= this.props.windowHeight;
    }

    /**
     * @param {Number} skinTone
     */
    updatePreferredSkinTone(skinTone) {
        if (this.props.preferredSkinTone === skinTone) {
            return;
        }

        User.updatePreferredSkinTone(skinTone);
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {*}
     */
    renderItem({item, index}) {
        const {code, header, types} = item;
        if (item.spacer) {
            return null;
        }

        if (header) {
            return (
                <View style={styles.emojiHeaderContainer}>
                    <Text style={styles.textLabelSupporting}>
                        {this.props.translate(`emojiPicker.headers.${code}`)}
                    </Text>
                </View>
            );
        }

        const emojiCode = types && types[this.props.preferredSkinTone]
            ? types[this.props.preferredSkinTone]
            : code;

        const isEmojiFocused = index === this.state.highlightedIndex && this.state.isUsingKeyboardMovement;

        return (
            <EmojiPickerMenuItem
                onPress={emoji => this.addToFrequentAndSelectEmoji(emoji, item)}
                onHoverIn={() => this.setState({highlightedIndex: index, isUsingKeyboardMovement: false})}
                onHoverOut={() => {
                    if (this.state.arePointerEventsDisabled) {
                        return;
                    }
                    this.setState({highlightedIndex: -1});
                }}
                emoji={emojiCode}
                onFocus={() => this.setState({highlightedIndex: index})}
                onBlur={() => this.setState(prevState => ({
                    // Only clear the highlighted index if the highlighted index is the same,
                    // meaning that the focus changed to an element that is not an emoji item.
                    highlightedIndex: prevState.highlightedIndex === index ? -1 : prevState.highlightedIndex,
                }))}
                isFocused={isEmojiFocused}
                isHighlighted={index === this.state.highlightedIndex}
                isUsingKeyboardMovement={this.state.isUsingKeyboardMovement}
            />
        );
    }

    render() {
        const isFiltered = this.emojis.length !== this.state.filteredEmojis.length;
        return (
            <View
                style={[styles.emojiPickerContainer, StyleUtils.getEmojiPickerStyle(this.props.isSmallScreenWidth)]}
                pointerEvents={this.state.arePointerEventsDisabled ? 'none' : 'auto'}
            >
                {!this.props.isSmallScreenWidth && (
                    <View style={[styles.ph4, styles.pb1, styles.pt2]}>
                        <TextInput
                            label={this.props.translate('common.search')}
                            onChangeText={this.filterEmojis}
                            defaultValue=""
                            ref={el => this.searchInput = el}
                            autoFocus
                            selectTextOnFocus={this.state.selectTextOnFocus}
                            onSelectionChange={this.onSelectionChange}
                            onFocus={() => this.setState({isFocused: true, highlightedIndex: -1, isUsingKeyboardMovement: false})}
                            onBlur={() => this.setState({isFocused: false})}
                        />
                    </View>
                )}
                {!isFiltered && (
                    <CategoryShortcutBar
                        headerEmojis={this.headerEmojis}
                        onPress={this.scrollToHeader}
                    />
                )}
                {this.state.filteredEmojis.length === 0
                    ? (
                        <Text
                            style={[
                                styles.disabledText,
                                styles.emojiPickerList,
                                styles.dFlex,
                                styles.alignItemsCenter,
                                styles.justifyContentCenter,
                                styles.flexGrow1,
                                this.isMobileLandscape() && styles.emojiPickerListLandscape,
                            ]}
                        >
                            {this.props.translate('common.noResultsFound')}
                        </Text>
                    )
                    : (
                        <FlatList
                            ref={el => this.emojiList = el}
                            data={this.state.filteredEmojis}
                            renderItem={this.renderItem}
                            keyExtractor={item => `emoji_picker_${item.code}`}
                            numColumns={CONST.EMOJI_NUM_PER_ROW}
                            style={[
                                styles.emojiPickerList,
                                this.isMobileLandscape() && styles.emojiPickerListLandscape,
                            ]}
                            extraData={
                              [this.state.filteredEmojis, this.state.highlightedIndex, this.props.preferredSkinTone]
                            }
                            stickyHeaderIndices={this.state.headerIndices}
                            onScroll={e => this.currentScrollOffset = e.nativeEvent.contentOffset.y}
                            getItemLayout={this.getItemLayout}
                        />
                    )}
                <EmojiSkinToneList
                    updatePreferredSkinTone={this.updatePreferredSkinTone}
                    preferredSkinTone={this.props.preferredSkinTone}
                />
            </View>
        );
    }
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
)(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EmojiPickerMenu {...props} forwardedRef={ref} />
)));
