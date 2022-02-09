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
import themeColors from '../../../styles/themes/default';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import Text from '../../Text';
import TextInputFocusable from '../../TextInputFocusable';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import compose from '../../../libs/compose';
import getOperatingSystem from '../../../libs/getOperatingSystem';
import * as User from '../../../libs/actions/User';
import EmojiSkinToneList from '../EmojiSkinToneList';
import * as EmojiUtils from '../../../libs/EmojiUtils';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: PropTypes.func,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    /** User's frequently used emojis */
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.shape({
        code: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,

    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // Ref for the emoji search input
        this.searchInput = undefined;

        // Ref for emoji FlatList
        this.emojiList = undefined;

        // This is the number of columns in each row of the picker.
        // Because of how flatList implements these rows, each row is an index rather than each element
        // For this reason to make headers work, we need to have the header be the only rendered element in its row
        // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
        // around each header.
        this.numColumns = CONST.EMOJI_NUM_PER_ROW;

        const allEmojis = EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis, this.props.frequentlyUsedEmojis);

        // This is the indices of each category of emojis
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index
        this.unfilteredHeaderIndices = EmojiUtils.getDynamicHeaderIndices(allEmojis);

        // If we're on Windows, don't display the flag emojis (the last category),
        // since Windows doesn't support them (and only displays country codes instead)
        this.emojis = getOperatingSystem() === CONST.OS.WINDOWS
            ? allEmojis.slice(0, this.unfilteredHeaderIndices.pop() * this.numColumns)
            : allEmojis;

        this.filterEmojis = _.debounce(this.filterEmojis.bind(this), 300);
        this.highlightAdjacentEmoji = this.highlightAdjacentEmoji.bind(this);
        this.scrollToHighlightedIndex = this.scrollToHighlightedIndex.bind(this);
        this.setupEventHandlers = this.setupEventHandlers.bind(this);
        this.cleanupEventHandlers = this.cleanupEventHandlers.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.isMobileLandscape = this.isMobileLandscape.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.updatePreferredSkinTone = this.updatePreferredSkinTone.bind(this);

        this.currentScrollOffset = 0;

        this.state = {
            filteredEmojis: this.emojis,
            headerIndices: this.unfilteredHeaderIndices,
            highlightedIndex: -1,
            arePointerEventsDisabled: false,
            selection: {
                start: 0,
                end: 0,
            },
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
     * Setup and attach keypress/mouse handlers for highlight navigation.
     */
    setupEventHandlers() {
        if (!document) {
            return;
        }

        this.keyDownHandler = (keyBoardEvent) => {
            if (keyBoardEvent.key.startsWith('Arrow')) {
                // Move the highlight when arrow keys are pressed
                this.highlightAdjacentEmoji(keyBoardEvent.key);
                return;
            }

            // Select the currently highlighted emoji if enter is pressed
            if (keyBoardEvent.key === 'Enter' && this.state.highlightedIndex !== -1) {
                const item = this.state.filteredEmojis[this.state.highlightedIndex];
                const emoji = lodashGet(item, ['types', this.props.preferredSkinTone], item.code);
                this.addToFrequentAndSelectEmoji(emoji, item);
                return;
            }

            // We allow typing in the search box if any key is pressed apart from Arrow keys.
            if (this.searchInput && !this.searchInput.isFocused()) {
                this.setState({selectTextOnFocus: false});
                this.searchInput.value = '';
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
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    addToFrequentAndSelectEmoji(emoji, emojiObject) {
        EmojiUtils.addToFrequentlyUsedEmojis(this.props.frequentlyUsedEmojis, emojiObject);
        this.props.onEmojiSelected(emoji);
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
        const firstNonHeaderIndex = this.state.filteredEmojis.length === this.emojis.length ? this.numColumns : 0;

        // Arrow Down and Arrow Right enable arrow navigation when search is focused
        if (this.searchInput && this.searchInput.isFocused() && this.state.filteredEmojis.length) {
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
            this.searchInput.blur();

            // We only want to hightlight the Emoji if none was highlighted already
            // If we already have a highlighted Emoji, lets just skip the first navigation
            if (this.state.highlightedIndex !== -1) {
                return;
            }
        }

        // If nothing is highlighted and an arrow key is pressed
        // select the first emoji
        if (this.state.highlightedIndex === -1) {
            this.setState({highlightedIndex: firstNonHeaderIndex});
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
            } while (isHeader(this.state.filteredEmojis[newIndex]));
        };

        switch (arrowKey) {
            case 'ArrowDown':
                move(
                    this.numColumns,
                    () => this.state.highlightedIndex + this.numColumns > this.state.filteredEmojis.length - 1,
                );
                break;
            case 'ArrowLeft':
                move(-1,
                    () => this.state.highlightedIndex - 1 < firstNonHeaderIndex,
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
                    -this.numColumns,
                    () => this.state.highlightedIndex - this.numColumns < firstNonHeaderIndex,
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

        // Actually highlight the new emoji and scroll to it if the index was changed
        if (newIndex !== this.state.highlightedIndex) {
            this.setState({highlightedIndex: newIndex});
            this.scrollToHighlightedIndex();
        }
    }

    /**
     * Calculates the required scroll offset (aka distance from top) and scrolls the FlatList to the highlighted emoji
     * if any portion of it falls outside of the window.
     * Doing this because scrollToIndex doesn't work as expected.
     */
    scrollToHighlightedIndex() {
        // If there are headers in the emoji array, so we need to offset by their heights as well
        let numHeaders = 0;
        if (this.state.filteredEmojis.length === this.emojis.length) {
            numHeaders = _.filter(this.unfilteredHeaderIndices, i => this.state.highlightedIndex > i * this.numColumns).length;
        }

        // Calculate the scroll offset at the bottom of the currently highlighted emoji
        // (subtract numHeaders because the highlightedIndex includes them, and add 1 to include the current row)
        const numEmojiRows = (Math.floor(this.state.highlightedIndex / this.numColumns) - numHeaders) + 1;

        // The scroll offsets at the top and bottom of the highlighted emoji
        const offsetAtEmojiBottom = ((numHeaders) * CONST.EMOJI_PICKER_HEADER_HEIGHT)
            + (numEmojiRows * CONST.EMOJI_PICKER_ITEM_HEIGHT);
        const offsetAtEmojiTop = offsetAtEmojiBottom - CONST.EMOJI_PICKER_ITEM_HEIGHT;

        // Scroll to fit the entire highlighted emoji into the window if we need to
        let targetOffset = this.currentScrollOffset;
        if (offsetAtEmojiBottom - this.currentScrollOffset >= CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT) {
            targetOffset = offsetAtEmojiBottom - CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT;
        } else if (offsetAtEmojiTop - CONST.EMOJI_PICKER_ITEM_HEIGHT <= this.currentScrollOffset) {
            targetOffset = offsetAtEmojiTop - CONST.EMOJI_PICKER_ITEM_HEIGHT;
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
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            this.setState({
                filteredEmojis: this.emojis,
                headerIndices: this.unfilteredHeaderIndices,
                highlightedIndex: this.numColumns,
            });
            return;
        }

        // Skip "Frequently Used" emojis to avoid duplicate results.
        // Frequently used emojis are on the 0th index category. Hence, slice the array from the 1st index category onwards.
        const uniqueEmojis = _.isEmpty(this.props.frequentlyUsedEmojis) ? this.emojis : this.emojis.slice(this.unfilteredHeaderIndices[1] * this.numColumns);
        const newFilteredEmojiList = _.filter(uniqueEmojis, emoji => (
            !emoji.header
            && !emoji.spacer
            && _.find(emoji.keywords, keyword => keyword.includes(normalizedSearchTerm))
        ));

        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        this.setState({filteredEmojis: newFilteredEmojiList, headerIndices: [], highlightedIndex: 0});
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
     * Update user preferred skin tone
     *
     * @param {Number} skinTone
     */
    updatePreferredSkinTone(skinTone) {
        if (this.props.preferredSkinTone === skinTone) {
            return;
        }

        User.setPreferredSkinTone(skinTone);
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
                <Text style={styles.emojiHeaderStyle}>
                    {this.props.translate(`emojiPicker.headers.${code}`)}
                </Text>
            );
        }

        const emojiCode = types && types[this.props.preferredSkinTone]
            ? types[this.props.preferredSkinTone]
            : code;


        return (
            <EmojiPickerMenuItem
                onPress={emoji => this.addToFrequentAndSelectEmoji(emoji, item)}
                onHover={() => this.setState({highlightedIndex: index})}
                emoji={emojiCode}
                isHighlighted={index === this.state.highlightedIndex}
            />
        );
    }

    render() {
        return (
            <View
                style={[styles.emojiPickerContainer, StyleUtils.getEmojiPickerStyle(this.props.isSmallScreenWidth)]}
                pointerEvents={this.state.arePointerEventsDisabled ? 'none' : 'auto'}
            >
                {!this.props.isSmallScreenWidth && (
                    <View style={[styles.pt4, styles.ph4, styles.pb1]}>
                        <TextInputFocusable
                            textAlignVertical="top"
                            placeholder={this.props.translate('common.search')}
                            placeholderTextColor={themeColors.textSupporting}
                            onChangeText={this.filterEmojis}
                            style={styles.textInput}
                            defaultValue=""
                            ref={el => this.searchInput = el}
                            autoFocus
                            selectTextOnFocus={this.state.selectTextOnFocus}
                            onSelectionChange={this.onSelectionChange}
                        />
                    </View>
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
                            numColumns={this.numColumns}
                            style={[
                                styles.emojiPickerList,
                                this.isMobileLandscape() && styles.emojiPickerListLandscape,
                            ]}
                            extraData={
                              [this.state.filteredEmojis, this.state.highlightedIndex, this.props.preferredSkinTone]
                            }
                            stickyHeaderIndices={this.state.headerIndices}
                            onScroll={e => this.currentScrollOffset = e.nativeEvent.contentOffset.y}
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
