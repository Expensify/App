import React, {Component} from 'react';
import {View, FlatList, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../../../CONST';
import styles from '../../../../styles/styles';
import themeColors from '../../../../styles/themes/default';
import emojis from '../../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import TextInputFocusable from '../../../../components/TextInputFocusable';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

const propTypes = {
    // Function to add the selected emoji to the main compose text input
    onEmojiSelected: PropTypes.func.isRequired,

    // The ref to the search input (may be null on small screen widths)
    forwardedRef: PropTypes.func,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // Ref for the emoji search input
        this.searchInput = undefined;

        // Ref for emoji menu
        this.emojiMenu = undefined;

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

        this.filterEmojis = _.debounce(this.filterEmojis.bind(this), 300);
        this.highlightEmoji = this.highlightEmoji.bind(this);
        this.isHeader = this.isHeader.bind(this);
        this.getFirstNonHeaderIndex = this.getFirstNonHeaderIndex.bind(this);
        this.scrollToHighlightedIndex = this.scrollToHighlightedIndex.bind(this);
        this.renderItem = this.renderItem.bind(this);

        this.state = {
            filteredEmojis: emojis,
            headerIndices: this.unfilteredHeaderIndices,
            highlightedIndex: this.numColumns,
            currentScrollOffset: 0,
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

        if (document) {
            document.addEventListener('keydown', this.highlightEmoji);
        }
    }

    /**
     * Gets the index of the first non header item in the emoji array.
     * @returns {number}
     */
    getFirstNonHeaderIndex() {
        return this.state.filteredEmojis.length === emojis.length ? this.numColumns : 0;
    }

    /**
     * Checks whether e is a header/spacer.
     * @param {Object} e an emoji candidate
     * @param {boolean} e.header
     * @param {String} e.code
     * @returns {boolean}
     */
    isHeader(e) {
        return e.header || e.code === CONST.EMOJI_SPACER;
    }

    /**
     * Selects the appropriate emoji depending on the arrowKey
     * @param {Object} keyboardEvent
     * @param {String} keyboardEvent.key
     */
    highlightEmoji(keyboardEvent) {
        let newIndex = this.state.highlightedIndex;
        const firstNonHeaderIndex = this.getFirstNonHeaderIndex();
        switch (keyboardEvent.key) {
            case 'ArrowDown':
                if (this.state.highlightedIndex + this.numColumns > this.state.filteredEmojis.length - 1) {
                    return;
                }

                // skip over a row of headers/spacers if the next row is one
                newIndex += this.numColumns;
                if (this.isHeader(this.state.filteredEmojis[newIndex])) {
                    newIndex += this.numColumns;
                }
                break;
            case 'ArrowLeft':
                if (this.state.highlightedIndex - 1 < firstNonHeaderIndex) {
                    return;
                }

                // skip over all of the headers/spacers
                do {
                    newIndex--;
                } while (this.isHeader(this.state.filteredEmojis[newIndex]));
                break;
            case 'ArrowRight':
                if (this.state.highlightedIndex + 1 > this.state.filteredEmojis.length - 1) {
                    return;
                }

                // Skip over all of the headers/spacers
                do {
                    newIndex++;
                } while (this.isHeader(this.state.filteredEmojis[newIndex]));

                break;
            case 'ArrowUp':

                // make sure the previous row isn't the first header row
                if (this.state.highlightedIndex - this.numColumns < firstNonHeaderIndex) {
                    return;
                }

                // skip over a row of headers/spacers if the next row is one
                newIndex -= this.numColumns;
                if (this.isHeader(this.state.filteredEmojis[newIndex])) {
                    newIndex -= this.numColumns;
                }
                break;
            default:
                break;
        }

        if (newIndex !== this.state.highlightedIndex) {
            this.setState({highlightedIndex: newIndex});
            this.scrollToHighlightedIndex();
        }
    }

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     *
     * @param {String} searchTerm
     */
    filterEmojis(searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        if (normalizedSearchTerm === '') {
            // There are no headers when searching, so we need to re-make them sticky when there is no search term
            this.setState({
                filteredEmojis: emojis,
                headerIndices: this.unfilteredHeaderIndices,
                highlightedIndex: this.numColumns,
            });
            return;
        }

        const newFilteredEmojiList = _.filter(emojis, emoji => (
            !emoji.header
            && emoji.code !== CONST.EMOJI_SPACER
            && _.find(emoji.keywords, keyword => keyword.includes(normalizedSearchTerm))
        ));

        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        this.setState({filteredEmojis: newFilteredEmojiList, headerIndices: [], highlightedIndex: 0});
    }

    /**
     * Scrolls the emoji picker menu's FlatList to the highlighted index
     */
    scrollToHighlightedIndex() {
        let numHeadersScrolled = 0;

        // We have headers in the emoji menu, need to offset by their heights as well
        if (this.state.filteredEmojis.length === emojis.length) {
            numHeadersScrolled = this.unfilteredHeaderIndices
                .filter(i => this.state.highlightedIndex > i * this.numColumns).length;
        }

        // Calculate the scroll offset at the bottom of the currently highlighted emoji (add 1 to include the current row)
        const numEmojiRowsScrolled = Math.floor(this.state.highlightedIndex / this.numColumns)
            - numHeadersScrolled + 1;

        const offsetAtEmojiBottom = ((numHeadersScrolled) * 38) + (numEmojiRowsScrolled * 40);
        const offsetAtEmojiTop = offsetAtEmojiBottom - 40;
        let scrollToOffset = this.state.currentScrollOffset;

        // Scroll to fit the entire highlighted emoji into the window
        if (offsetAtEmojiBottom - this.state.currentScrollOffset >= 300) {
            scrollToOffset = offsetAtEmojiBottom - 300;
        } else if (offsetAtEmojiTop - 40 <= this.state.currentScrollOffset) {
            scrollToOffset = offsetAtEmojiTop - 40;
        }
        if (scrollToOffset !== this.state.currentScrollOffset) {
            this.emojiMenu.scrollToOffset({offset: scrollToOffset});
            this.setState({currentScrollOffset: scrollToOffset});
        }
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {*}
     */
    renderItem({item, index}) {
        if (item.code === CONST.EMOJI_SPACER) {
            return null;
        }

        if (item.header) {
            return (
                <Text style={styles.emojiHeaderStyle}>
                    {item.code}
                </Text>
            );
        }

        return (
            <EmojiPickerMenuItem
                onPress={this.props.onEmojiSelected}
                emoji={item.code}
                isHighlighted={index === this.state.highlightedIndex}
            />
        );
    }

    render() {
        return (
            <View style={styles.emojiPickerContainer}>
                {!this.props.isSmallScreenWidth && (
                    <View style={[styles.pt4, styles.ph4, styles.pb1]}>
                        <TextInputFocusable
                            textAlignVertical="top"
                            placeholder="Search"
                            placeholderTextColor={themeColors.textSupporting}
                            onChangeText={this.filterEmojis}
                            style={styles.textInput}
                            defaultValue=""
                            ref={el => this.searchInput = el}
                        />
                    </View>
                )}
                <FlatList
                    ref={el => this.emojiMenu = el}
                    data={this.state.filteredEmojis}
                    renderItem={this.renderItem}
                    keyExtractor={item => `emoji_picker_${item.code}`}
                    numColumns={this.numColumns}
                    style={styles.emojiPickerList}
                    extraData={[this.state.filteredEmojis, this.state.highlightedIndex]}
                    stickyHeaderIndices={this.state.headerIndices}
                />
            </View>
        );
    }
}

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

export default withWindowDimensions(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EmojiPickerMenu {...props} forwardedRef={ref} />
)));
