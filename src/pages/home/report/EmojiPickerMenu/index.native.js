import React, {Component} from 'react';
import {View, FlatList, Text} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../../../CONST';
import styles from '../../../../styles/styles';
import emojis from '../../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // This is the number of columns in each row of the picker.
        // Because of how flatList implements these rows, each row is an index rather than each element
        // For this reason to make headers work, we need to have the header be the only rendered element in its row
        // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
        // around each header.
        this.numColumns = 8;

        // This is the indices of each category of emojis
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index
        // If this emojis are ever added to emojis.js this will need to be updated or things will break
        this.unfilteredHeaderIndices = [0, 33, 59, 87, 98, 120, 147];

        this.renderItem = this.renderItem.bind(this);
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
                <FlatList
                    data={emojis}
                    renderItem={this.renderItem}
                    keyExtractor={item => (`emoji_picker_${item.code}`)}
                    numColumns={this.numColumns}
                    style={styles.emojiPickerList}
                    stickyHeaderIndices={this.unfilteredHeaderIndices}
                />
            </View>
        );
    }
}

EmojiPickerMenu.propTypes = propTypes;

// eslint-disable-next-line no-unused-vars
export default React.forwardRef((props, _ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EmojiPickerMenu {...props} />
));
