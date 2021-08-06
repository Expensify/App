import React, {Component} from 'react';
import {View, FlatList, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import CONST from '../../../../CONST';
import styles from '../../../../styles/styles';
import emojis, {skinTones} from '../../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import Text from '../../../../components/Text';
import dynamicEmojiSize from './dynamicEmojiSize';
import getSkinToneEmojiCode from './getSkinToneEmojiCode';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.number,

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    updatePreferredSkinTone: PropTypes.func,

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
        this.numColumns = 8;

        // This is the indices of each category of emojis
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index
        // If this emojis are ever added to emojis.js this will need to be updated or things will break
        this.unfilteredHeaderIndices = [0, 33, 59, 87, 98, 120, 147];

        this.renderItem = this.renderItem.bind(this);

        this.emojiSize = {
            fontSize: dynamicEmojiSize(this.props.windowWidth),
        };

        this.state = {
            showSkinToneList: false,
        };
    }

    /**
     * Update the preferredSkinTone and call the parent function if available
     * @param {Number} skinTone
     */
    setPreferredSkinTone(skinTone) {
        this.setState({showSkinToneList: false});
        if (this.props.updatePreferredSkinTone) {
            this.props.updatePreferredSkinTone(skinTone);
        }
    }

    /**
     * Returns view for skin tone picker
     * @returns {*}
     */
    renderSkinTonePicker() {
        return (
            <View style={[styles.flexRow, styles.p1]}>
                {
                  !this.state.showSkinToneList
                        && (
                        <Pressable
                            onPress={
                              () => this.setState(prevState => ({showSkinToneList: !prevState.showSkinToneList}))
                            }
                            style={[
                                styles.pv1,
                                styles.flex1,
                                styles.flexRow,
                                styles.alignSelfCenter,
                                styles.justifyContentStart,
                            ]}
                        >
                            <Text style={[styles.emojiText, this.emojiSize]}>
                                {`${getSkinToneEmojiCode(this.props.preferredSkinTone)}\uFE0F`}
                            </Text>
                            <Text style={[styles.emojiHeaderStyle]}>
                                {this.props.translate('emojiPicker.skinTonePickerLabel')}
                            </Text>
                        </Pressable>
                        )
                }
                {
                        this.state.showSkinToneList
                        && (
                        <View>
                            <View style={[styles.flexRow]}>
                                {
                              skinTones.map(skinToneEmoji => (
                                  <EmojiPickerMenuItem
                                      onPress={() => this.setPreferredSkinTone(skinToneEmoji.skinTone)}
                                      onHover={() => this.setState({
                                          highlightedSkinToneIndex: skinToneEmoji.skinTone,
                                      })}
                                      key={skinToneEmoji.code}
                                      emojiItemStyle={[styles.emojiSkinToneItem, styles.emojiSkinToneItem]}
                                      emoji={`${skinToneEmoji.code}\uFE0F`}
                                      isHighlighted={skinToneEmoji.skinTone === this.state.highlightedSkinToneIndex}
                                      emojiSize={this.emojiSize}
                                  />
                              ))
                            }
                            </View>
                            <Text style={
                              [styles.emojiHeaderStyle, styles.emojiExtraSmall, styles.textAlignCenter, styles.pv0]
                              }
                            >
                                {this.props.translate('emojiPicker.setPreferredSkinTone')}
                            </Text>
                        </View>
                        )
                    }

            </View>

        );
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
        if (item.code === CONST.EMOJI_SPACER) {
            return null;
        }

        if (item.header) {
            return (
                <Text style={styles.emojiHeaderStyle}>
                    {`${item.code}\uFE0F`}
                </Text>
            );
        }

        let emojiCode = code;
        if (types && typeof this.props.preferredSkinTone === 'number' && types[this.props.preferredSkinTone]) {
            emojiCode = types[this.props.preferredSkinTone];
        }


        return (
            <EmojiPickerMenuItem
                onPress={this.props.onEmojiSelected}
                emoji={`${emojiCode}\uFE0F`}
                emojiSize={this.emojiSize}
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
                {this.renderSkinTonePicker()}
            </View>
        );
    }
}

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = {
    preferredSkinTone: undefined,
    updatePreferredSkinTone: undefined,
};

export default compose(
    withWindowDimensions,
    withLocalize,
)(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EmojiPickerMenu {...props} forwardedRef={ref} />
)));
