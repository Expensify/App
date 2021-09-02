import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../../../CONST';
import styles, {getEmojiPickerStyle} from '../../../../styles/styles';
import themeColors from '../../../../styles/themes/default';
import emojis from '../../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import Text from '../../../../components/Text';
import TextInputFocusable from '../../../../components/TextInputFocusable';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import getOperatingSystem from '../../../../libs/getOperatingSystem';
import EmojiSkinToneList from '../EmojiSkinToneList';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** The ref to the search input (may be null on small screen widths) */
    forwardedRef: PropTypes.func,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    updatePreferredSkinTone: PropTypes.func,

    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    preferredSkinTone: undefined,
    updatePreferredSkinTone: undefined,
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
        this.numColumns = 8;

        // This is the indices of each category of emojis
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index
        // If more emojis are ever added to emojis.js this will need to be updated or things will break
        this.unfilteredHeaderIndices = [0, 33, 59, 87, 98, 120, 147];

        // If we're on Windows, don't display the flag emojis (the last category),
        // since Windows doesn't support them (and only displays country codes instead)
        this.emojis = getOperatingSystem() === CONST.OS.WINDOWS
            ? emojis.slice(0, this.unfilteredHeaderIndices.pop() * this.numColumns)
            : emojis;

        this.filterEmojis = _.debounce(this.filterEmojis.bind(this), 300);
        this.highlightAdjacentEmoji = this.highlightAdjacentEmoji.bind(this);
        this.scrollToHighlightedIndex = this.scrollToHighlightedIndex.bind(this);
        this.setupEventHandlers = this.setupEventHandlers.bind(this);
        this.cleanupEventHandlers = this.cleanupEventHandlers.bind(this);
        this.renderItem = this.renderItem.bind(this);

        this.currentScrollOffset = 0;

        this.state = {
            filteredEmojis: this.emojis,
            headerIndices: this.unfilteredHeaderIndices,
            highlightedIndex: -1,
            arePointerEventsDisabled: false,
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
     * Setup and attach keypress/mouse handlers for highlight navigation.
     */
    setupEventHandlers() {
        if (document) {
            this.keyDownHandler = (keyBoardEvent) => {
                if (keyBoardEvent.key.startsWith('Arrow')) {
                    // Move the highlight when arrow keys are pressed
                    this.highlightAdjacentEmoji(keyBoardEvent.key);
                    return;
                }

                // Select the currently highlighted emoji if enter is pressed
                if (keyBoardEvent.key === 'Enter' && this.state.highlightedIndex !== -1) {
                    this.props.onEmojiSelected(this.state.filteredEmojis[this.state.highlightedIndex].code);
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
                if (this.state.arePointerEventsDisabled) {
                    this.setState({arePointerEventsDisabled: false});
                }
            };
            document.addEventListener('mousemove', this.mouseMoveHandler);
        }
    }

    /**
     * Cleanup all mouse/keydown event listeners that we've set up
     */
    cleanupEventHandlers() {
        if (document) {
            document.removeEventListener('keydown', this.keyDownHandler, true);
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
    }

    /**
     * Highlights emojis adjacent to the currently highlighted emoji depending on the arrowKey
     * @param {String} arrowKey
     */
    highlightAdjacentEmoji(arrowKey) {
        const firstNonHeaderIndex = this.state.filteredEmojis.length === this.emojis.length ? this.numColumns : 0;

        // Arrow Down enable arrow navigation when search is focused
        if (this.searchInput && this.searchInput.isFocused() && this.state.filteredEmojis.length) {
            if (arrowKey !== 'ArrowDown') {
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
            const isHeader = e => e.header || e.code === CONST.EMOJI_SPACER;
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
                move(-1, () => this.state.highlightedIndex - 1 < firstNonHeaderIndex);
                break;
            case 'ArrowRight':
                move(1, () => this.state.highlightedIndex + 1 > this.state.filteredEmojis.length - 1);
                break;
            case 'ArrowUp':
                move(
                    -this.numColumns,
                    () => this.state.highlightedIndex - this.numColumns < firstNonHeaderIndex,
                    () => {
                        if (!this.searchInput) {
                            return;
                        }

                        // Reaching start of the list, arrow up set the focus to searchInput.
                        this.searchInput.focus();
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
            numHeaders = this.unfilteredHeaderIndices
                .filter(i => this.state.highlightedIndex > i * this.numColumns).length;
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

        const newFilteredEmojiList = _.filter(this.emojis, emoji => (
            !emoji.header
            && emoji.code !== CONST.EMOJI_SPACER
            && _.find(emoji.keywords, keyword => keyword.includes(normalizedSearchTerm))
        ));

        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        this.setState({filteredEmojis: newFilteredEmojiList, headerIndices: [], highlightedIndex: 0});
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
        if (code === CONST.EMOJI_SPACER) {
            return null;
        }

        if (header) {
            return (
                <Text style={styles.emojiHeaderStyle}>
                    {code}
                </Text>
            );
        }

        const emojiCode = types && types[this.props.preferredSkinTone]
            ? types[this.props.preferredSkinTone]
            : code;


        return (
            <EmojiPickerMenuItem
                onPress={this.props.onEmojiSelected}
                onHover={() => this.setState({highlightedIndex: index})}
                emoji={emojiCode}
                isHighlighted={index === this.state.highlightedIndex}
            />
        );
    }

    render() {
        return (
            <View
                style={[styles.emojiPickerContainer, getEmojiPickerStyle(this.props.isSmallScreenWidth)]}
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
                            style={styles.emojiPickerList}
                            extraData={
                              [this.state.filteredEmojis, this.state.highlightedIndex, this.props.preferredSkinTone]
                            }
                            stickyHeaderIndices={this.state.headerIndices}
                            onScroll={e => this.currentScrollOffset = e.nativeEvent.contentOffset.y}
                        />
                    )}
                <EmojiSkinToneList
                    setPreferredSkinTone={this.props.updatePreferredSkinTone}
                    emojiSize={this.emojiSize}
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
)(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EmojiPickerMenu {...props} forwardedRef={ref} />
)));
