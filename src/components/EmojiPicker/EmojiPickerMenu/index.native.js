import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore/underscore-node.mjs';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import Text from '../../Text';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import EmojiSkinToneList from '../EmojiSkinToneList';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import * as User from '../../../libs/actions/User';
import CategoryShortcutBar from '../CategoryShortcutBar';
import {FlashList} from "@shopify/flash-list";

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** User's frequently used emojis */
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.shape({
        code: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,

    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredSkinTone: undefined,
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // Ref for emoji FlatList
        this.emojiList = undefined;

        // This is the number of columns in each row of the picker.
        // Because of how flatList implements these rows, each row is an index rather than each element
        // For this reason to make headers work, we need to have the header be the only rendered element in its row
        // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
        // around each header.
        this.numColumns = CONST.EMOJI_NUM_PER_ROW;

        this.emojis = EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis, this.props.frequentlyUsedEmojis);

        // This is the indices of each category of emojis
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index
        this.unfilteredHeaderIndices = EmojiUtils.getDynamicHeaderIndices(this.emojis);
        this.headerIndices = EmojiUtils.getHeaderIndices(this.emojis);

        this.renderItem = this.renderItem.bind(this);
        this.isMobileLandscape = this.isMobileLandscape.bind(this);
        this.updatePreferredSkinTone = this.updatePreferredSkinTone.bind(this);
        this.scrollToHeader = this.scrollToHeader.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
    }

    getItemLayout(data, index) {
        return {length: CONST.EMOJI_PICKER_ITEM_HEIGHT, offset: CONST.EMOJI_PICKER_ITEM_HEIGHT * index, index};
    }

    /**
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    addToFrequentAndSelectEmoji(emoji, emojiObject) {
        EmojiUtils.addToFrequentlyUsedEmojis(this.props.frequentlyUsedEmojis, emojiObject);
        this.props.onEmojiSelected(emoji);
    }

    /**
     * Check if its a landscape mode of mobile device
     *
     * @returns {Boolean}
     */
    isMobileLandscape() {
        return this.props.windowWidth >= this.props.windowHeight;
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

    scrollToHeader(headerIndex) {
        // If there are headers in the emoji array, so we need to offset by their heights as well
        const numHeaders = _.filter(this.headerIndices, i => headerIndex > i * this.numColumns).length;

        // Calculate the scroll offset at the top of the desired category
        // add 1 to number of headers so that we scroll to the top of the header row instead of the bottom
        // subtract new number of headers to get rid of those rows
        const numEmojiRows = Math.floor(headerIndex / this.numColumns) - (numHeaders + 1);

        const test = Math.floor(headerIndex / 8);
        const testoffset = ((numEmojiRows) * CONST.EMOJI_PICKER_ITEM_HEIGHT) + (CONST.EMOJI_PICKER_HEADER_HEIGHT * (numHeaders + 1));
        this.emojiList.scrollToIndex({index: headerIndex, animated: true});
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
        const {code, types} = item;
        if (item.spacer) {
            return null;
        }

        if (item.header) {
            return (
                <Text style={styles.emojiHeaderStyle}>
                    {this.props.translate(`emojiPicker.headers.${item.code}`)}
                </Text>
            );
        }

        const emojiCode = types && types[this.props.preferredSkinTone]
            ? types[this.props.preferredSkinTone]
            : code;

        return (
            <EmojiPickerMenuItem
                onPress={emoji => this.addToFrequentAndSelectEmoji(emoji, item)}
                emoji={emojiCode}
            />
        );
    }

    render() {
        return (
            <View style={styles.emojiPickerContainer}>
                <View style={[styles.flexRow]}>
                    <CategoryShortcutBar
                        headerIndices={this.headerIndices}
                        onPress={this.scrollToHeader}
                    />
                </View>
                <View style={[
                    styles.emojiPickerList,
                    this.isMobileLandscape() && styles.emojiPickerListLandscape,
                ]}>
                    <FlashList
                        ref={el => this.emojiList = el}
                        data={this.emojis}
                        renderItem={this.renderItem}
                        numColumns={this.numColumns}
                        stickyHeaderIndices={this.headerIndices}
                        estimatedItemSize={CONST.EMOJI_PICKER_ITEM_HEIGHT}
                        showsVerticalScrollIndicator
                    />
                </View>
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
