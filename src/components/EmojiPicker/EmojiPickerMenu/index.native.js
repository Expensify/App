import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
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

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

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

        this.renderItem = this.renderItem.bind(this);
        this.isMobileLandscape = this.isMobileLandscape.bind(this);
        this.updatePreferredSkinTone = this.updatePreferredSkinTone.bind(this);
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
     * Check if its a landscape mode of mobile device
     *
     * @returns {Boolean}
     */
    isMobileLandscape() {
        return this.props.windowWidth >= this.props.windowHeight;
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
                <FlatList
                    data={this.emojis}
                    renderItem={this.renderItem}
                    keyExtractor={item => (`emoji_picker_${item.code}`)}
                    numColumns={this.numColumns}
                    style={[
                        styles.emojiPickerList,
                        this.isMobileLandscape() && styles.emojiPickerListLandscape,
                    ]}
                    stickyHeaderIndices={this.unfilteredHeaderIndices}
                />
                <EmojiSkinToneList
                    updatePreferredSkinTone={this.props.updatePreferredSkinTone}
                    preferredSkinTone={this.props.preferredSkinTone}
                />
            </View>
        );
    }
}

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = {
    preferredSkinTone: undefined,
};

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
