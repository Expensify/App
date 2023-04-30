import React from 'react';
import {View, Pressable} from 'react-native';
import _ from 'underscore';

// We take FlatList from this package to properly handle the scrolling of EmojiSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import * as EmojiUtils from '../../libs/EmojiUtils';
import Text from '../Text';
import CONST from '../../CONST';
import getStyledTextArray from '../../libs/GetStyledTextArray';
import {propTypes, defaultProps} from './emojiSuggestionsPropTypes';

/**
 * @param {Number} numRows
 * @param {Boolean} isEmojiPickerLarge
 * @returns {Number}
 */
const measureHeightOfEmojiRows = (numRows, isEmojiPickerLarge) => {
    if (isEmojiPickerLarge) {
        return numRows * CONST.EMOJI_SUGGESTER.ITEM_HEIGHT;
    }
    if (numRows > 2) {
        // on small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        return CONST.EMOJI_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST.EMOJI_SUGGESTER.ITEM_HEIGHT;
    }
    return numRows * CONST.EMOJI_SUGGESTER.ITEM_HEIGHT;
};

/**
 * Create unique keys for each emoji item
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */
const keyExtractor = (item, index) => `${item.name}+${index}}`;

const BaseEmojiSuggestions = (props) => {
    /**
     * Render a suggestion menu item component.
     * @param {Object} params.item
     * @param {Number} params.index
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = ({item, index}) => {
        const styledTextArray = getStyledTextArray(item.name, props.prefix);

        return (
            <Pressable
                style={({hovered}) => StyleUtils.getEmojiSuggestionItemStyle(
                    props.highlightedEmojiIndex,
                    CONST.EMOJI_SUGGESTER.ITEM_HEIGHT,
                    hovered,
                    index,
                )}
                onMouseDown={e => e.preventDefault()}
                onPress={() => props.onSelect(index)}
                onLongPress={() => {}}
            >
                <View style={styles.emojiSuggestionContainer}>
                    <Text style={styles.emojiSuggestionsEmoji}>{EmojiUtils.getEmojiCodeWithSkinColor(item, props.preferredSkinToneIndex)}</Text>
                    <Text style={styles.emojiSuggestionsText}>
                        :
                        {_.map(styledTextArray, ({text, isColored}, i) => (
                            <Text key={`${text}+${i}`} style={StyleUtils.getColoredBackgroundStyle(isColored)}>
                                {text}
                            </Text>
                        ))}
                        :
                    </Text>
                </View>
            </Pressable>
        );
    };

    const rowHeight = measureHeightOfEmojiRows(
        props.emojis.length,
        props.isEmojiPickerLarge,
    );

    return (
        <View
            ref={props.forwardedRef}
            style={[
                styles.emojiSuggestionsContainer,
                StyleUtils.getEmojiSuggestionContainerStyle(
                    rowHeight,
                    props.shouldIncludeReportRecipientLocalTimeHeight,
                ),
            ]}
        >
            <FlatList
                keyboardShouldPersistTaps="handled"
                data={props.emojis}
                renderItem={renderSuggestionMenuItem}
                keyExtractor={keyExtractor}
                removeClippedSubviews={false}
                style={{height: rowHeight}}
            />
        </View>
    );
};

BaseEmojiSuggestions.propTypes = propTypes;
BaseEmojiSuggestions.defaultProps = defaultProps;
BaseEmojiSuggestions.displayName = 'BaseEmojiSuggestions';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseEmojiSuggestions {...props} forwardedRef={ref} />
));
