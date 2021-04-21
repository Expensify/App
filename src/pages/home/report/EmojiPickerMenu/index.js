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
        this.renderItem = this.renderItem.bind(this);

        this.state = {
            filteredEmojis: emojis,
            headerIndices: this.unfilteredHeaderIndices,
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
            this.setState({filteredEmojis: emojis, headerIndices: this.unfilteredHeaderIndices});
            return;
        }

        const newFilteredEmojiList = _.filter(emojis, emoji => (
            !emoji.header
            && emoji.code !== CONST.EMOJI_SPACER
            && _.find(emoji.keywords, keyword => keyword.includes(normalizedSearchTerm))
        ));

        // Remove sticky header indices. There are no headers while searching and we don't want to make emojis sticky
        this.setState({filteredEmojis: newFilteredEmojiList, headerIndices: []});
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param {Object} item
     * @returns {*}
     */
    renderItem({item}) {
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
                    data={this.state.filteredEmojis}
                    renderItem={this.renderItem}
                    keyExtractor={item => `emoji_picker_${item.code}`}
                    numColumns={this.numColumns}
                    style={styles.emojiPickerList}
                    extraData={this.state.filteredEmojis}
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
