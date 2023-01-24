import React, {Component} from 'react';
import {View, FlatList, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import Text from '../Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import themeColors from '../../styles/themes/default';

const propTypes = {

    highlightedEmoji: PropTypes.number,

    // eslint-disable-next-line react/forbid-prop-types
    emojis: PropTypes.arrayOf(PropTypes.object).isRequired,

    onClose: PropTypes.func.isRequired,

    onSelect: PropTypes.func.isRequired,

    prefix: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    highlightedEmoji: 0,
};
const ROW_HEIGHT = 36;

class EmojiSuggestions extends Component {
    /**
     * Render a suggestion menu item component.
     *
     * @param {Object} item
     * @param {Number} index
     * @param {Number} highlighted
     * @param {String} prefix
     * @returns {*}
     */
    renderItem(item, index, highlighted, prefix) {
        const texts = [];
        const prefixLocation = item.name.search(prefix);
        if (prefixLocation === 0 && prefix.length === item.name.length) {
            texts.push({text: prefix, colored: true});
        } else if (prefixLocation === 0 && prefix.length !== item.name.length) {
            texts.push(
                {text: item.name.slice(0, prefix.length), colored: true},
                {text: item.name.slice(prefix.length), colored: false},
            );
        } else if (item.name.endsWith(prefix) && prefix.length !== item.name.length) {
            texts.push(
                {text: item.name.slice(0, prefixLocation), colored: false},
                {text: item.name.slice(prefixLocation), colored: true},
            );
        } else if (prefixLocation > 0 && prefix.length !== item.name.length) {
            texts.push(
                {text: item.name.slice(0, prefixLocation), colored: false},
                {text: item.name.slice(prefixLocation, prefixLocation + prefix.length), colored: true},
                {text: item.name.slice(prefixLocation + prefix.length), colored: false},
            );
        } else {
            texts.push({text: item.name, colored: false});
        }

        return (
            <Pressable
                style={({hovered}) => [
                    {
                        height: ROW_HEIGHT,
                        justifyContent: 'center',
                    },
                    styles.ph3,
                    (index === highlighted && !hovered) || hovered
                        ? {
                            backgroundColor: themeColors.highlightBG,
                        }
                        : {},
                ]}
                onPressIn={() => {
                    this.props.onSelect(index);
                    this.props.onClose();
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
                >
                    <Text style={[styles.emojiSuggestionsText]}>{item.code}</Text>
                    <Text style={[styles.emojiSuggestionsText]}>
                        :
                        {_.map(texts, ({text, colored}, i) => (
                            <Text
                                key={i}
                                style={{backgroundColor: colored ? '#ffbc4c' : null}}
                            >
                                {text}
                            </Text>
                        ))}
                        :
                    </Text>
                </View>
            </Pressable>
        );
    }

    render() {
        const composerFullSizePadding = this.props.isComposerFullSize ? 16 : 0;

        const padding = this.props.isEmojiPickerBelow
            ? 30 + this.props.emojiSuggestionPadding
            : this.props.emojiSuggestionPadding
            - ROW_HEIGHT
              * (this.props.isEmojiPickerSmall ? 3 : this.props.emojis.length)
            - 32
            + composerFullSizePadding;

        return (
            <View
                style={[
                    styles.emojiSuggestionsContainer,
                    {
                        top: padding,
                        width: '100%',
                        left: 0,
                    },
                ]}
            >
                <FlatList
                    data={this.props.emojis}
                    renderItem={({item, index}) => this.renderItem(
                        item,
                        index,
                        this.props.highlightedEmoji,
                        this.props.prefix,
                    )}
                    keyExtractor={item => item.name}

                    style={this.props.isEmojiPickerSmall ? {height: ROW_HEIGHT * 3} : {}}
                />
            </View>
        );
    }
}

EmojiSuggestions.propTypes = propTypes;
EmojiSuggestions.defaultProps = defaultProps;

export default withWindowDimensions(EmojiSuggestions);
