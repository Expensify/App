import React, {Component} from 'react';
import {View, findNodeHandle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Animated, {runOnUI, _scrollTo} from 'react-native-reanimated';
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
import TextInput from '../../TextInput';
import CategoryShortcutBar from '../CategoryShortcutBar';
import * as StyleUtils from '../../../styles/StyleUtils';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // Ref for emoji FlatList
        this.emojiList = undefined;

        this.emojis = EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis);

        // Get the header emojis along with the code, index and icon.
        // index is the actual header index starting at the first emoji and counting each one
        this.headerEmojis = EmojiUtils.getHeaderEmojis(this.emojis);

        // This is the indices of each header's Row
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index to the flatlist
        this.headerRowIndices = _.map(this.headerEmojis, (headerEmoji) => Math.floor(headerEmoji.index / CONST.EMOJI_NUM_PER_ROW));

        this.renderItem = this.renderItem.bind(this);
        this.isMobileLandscape = this.isMobileLandscape.bind(this);
        this.updatePreferredSkinTone = this.updatePreferredSkinTone.bind(this);
        this.filterEmojis = _.debounce(this.filterEmojis.bind(this), 300);
        this.scrollToHeader = this.scrollToHeader.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);

        this.state = {
            filteredEmojis: this.emojis,
            headerIndices: this.headerRowIndices,
        };
    }

    getItemLayout(data, index) {
        return {length: CONST.EMOJI_PICKER_ITEM_HEIGHT, offset: CONST.EMOJI_PICKER_ITEM_HEIGHT * index, index};
    }

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     *
     * @param {String} searchTerm
     */
    filterEmojis(searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim().replaceAll(':', '');

        if (this.emojiList) {
            this.emojiList.scrollToOffset({offset: 0, animated: false});
        }

        if (normalizedSearchTerm === '') {
            this.setState({
                filteredEmojis: this.emojis,
                headerIndices: this.headerRowIndices,
            });

            return;
        }
        const newFilteredEmojiList = EmojiUtils.suggestEmojis(`:${normalizedSearchTerm}`, this.props.preferredLocale, this.emojis.length);

        this.setState({
            filteredEmojis: newFilteredEmojiList,
            headerIndices: undefined,
        });
    }

    /**
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    addToFrequentAndSelectEmoji(emoji, emojiObject) {
        const frequentEmojiList = EmojiUtils.getFrequentlyUsedEmojis(emojiObject);
        User.updateFrequentlyUsedEmojis(frequentEmojiList);
        this.props.onEmojiSelected(emoji, emojiObject);
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
        const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
        this.emojiList.flashScrollIndicators();
        const node = findNodeHandle(this.emojiList);
        runOnUI(() => {
            'worklet';

            _scrollTo(node, 0, calculatedOffset, true);
        })();
    }

    /**
     * Return a unique key for each emoji item
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {String}
     */
    keyExtractor(item, index) {
        return `${index}${item.code}`;
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
                <View style={styles.emojiHeaderContainer}>
                    <Text style={styles.textLabelSupporting}>{this.props.translate(`emojiPicker.headers.${code}`)}</Text>
                </View>
            );
        }

        const emojiCode = types && types[this.props.preferredSkinTone] ? types[this.props.preferredSkinTone] : code;

        return (
            <EmojiPickerMenuItem
                onPress={(emoji) => this.addToFrequentAndSelectEmoji(emoji, item)}
                emoji={emojiCode}
            />
        );
    }

    render() {
        const isFiltered = this.emojis.length !== this.state.filteredEmojis.length;
        return (
            <View style={styles.emojiPickerContainer}>
                <View style={[styles.ph4, styles.pb1, styles.pt2]}>
                    <TextInput
                        label={this.props.translate('common.search')}
                        onChangeText={this.filterEmojis}
                    />
                </View>
                {!isFiltered && (
                    <CategoryShortcutBar
                        headerEmojis={this.headerEmojis}
                        onPress={this.scrollToHeader}
                    />
                )}
                <Animated.FlatList
                    ref={(el) => (this.emojiList = el)}
                    keyboardShouldPersistTaps="handled"
                    data={this.state.filteredEmojis}
                    renderItem={this.renderItem}
                    keyExtractor={this.keyExtractor}
                    numColumns={CONST.EMOJI_NUM_PER_ROW}
                    style={[
                        StyleUtils.getEmojiPickerListHeight(isFiltered),
                        {
                            width: this.props.windowWidth,
                        },
                    ]}
                    stickyHeaderIndices={this.state.headerIndices}
                    getItemLayout={this.getItemLayout}
                    showsVerticalScrollIndicator
                    // used because of a bug in RN where stickyHeaderIndices can't be updated after the list is rendered https://github.com/facebook/react-native/issues/25157
                    removeClippedSubviews={false}
                    contentContainerStyle={styles.flexGrow1}
                    ListEmptyComponent={
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.flex1]}>
                            <Text style={[styles.disabledText]}>{this.props.translate('common.noResultsFound')}</Text>
                        </View>
                    }
                />
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
    }),
)(
    React.forwardRef((props, ref) => (
        <EmojiPickerMenu
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
