import React, {Component} from 'react';
import {View, FlatList, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';
import TextInputFocusable from '../../../components/TextInputFocusable';

const propTypes = {
    // Function to add the selected emoji to the main compose text input
    onEmojiSelected: PropTypes.func.isRequired,
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // Ref for the emoji search input
        this.searchInput = undefined;

        this.filterEmojis = _.debounce(this.filterEmojis.bind(this), 500, false);
        this.renderItem = this.renderItem.bind(this);

        this.state = {
            filteredEmojis: emojis,

            // This is the indices of each category of emojis
            // The positions are static, and are calculated as index/numColumns (8 in our case)
            // This is because each row of 8 emojis counts as one index
            headerIndices: [0, 34, 60, 88, 99, 121, 148],
        };
    }

    componentDidUpdate() {
        this.searchInput.focus();
    }

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     *
     * @param {String} searchTerm
     */
    filterEmojis(searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        if (normalizedSearchTerm === '') {
            this.setState({filteredEmojis: emojis, headerIndices: [0, 34, 60, 88, 99, 121, 148]});
            return;
        }
        const newFilteredEmojiList = [];
        _.each(emojis, (emoji) => {
            if (emoji.header || emoji.code === 'BLANK') {
                return;
            }

            if (_.find(emoji.keywords, keyword => keyword.includes(normalizedSearchTerm))) {
                newFilteredEmojiList.push(emoji);
            }
        });

        this.setState({filteredEmojis: newFilteredEmojiList, headerIndices: []});
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "BLANK" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param {Object} item
     * @returns {*}
     */
    renderItem({item}) {
        if (item.code === 'BLANK') {
            return;
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
                <FlatList
                    data={this.state.filteredEmojis}
                    renderItem={this.renderItem}
                    keyExtractor={item => (`emoji_picker_${item.code}`)}
                    numColumns={8}
                    style={styles.emojiPickerList}
                    extraData={this.state.filteredEmojis}
                    stickyHeaderIndices={this.state.headerIndices}
                />
            </View>
        );
    }
}

EmojiPickerMenu.propTypes = propTypes;

export default EmojiPickerMenu;
