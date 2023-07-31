import React, {useState, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Animated, {runOnUI, scrollTo, useAnimatedRef} from 'react-native-reanimated';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import compose from '../../../libs/compose';
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

    /** Props related to translation */
    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
};

function EmojiPickerMenu({preferredLocale, onEmojiSelected, preferredSkinTone, translate}) {
    const emojiList = useAnimatedRef();
    const allEmojis = useMemo(() => EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis), []);
    const headerEmojis = useMemo(() => EmojiUtils.getHeaderEmojis(allEmojis), [allEmojis]);
    const headerRowIndices = useMemo(() => _.map(headerEmojis, (headerEmoji) => Math.floor(headerEmoji.index / CONST.EMOJI_NUM_PER_ROW)), [headerEmojis]);
    const [filteredEmojis, setFilteredEmojis] = useState(allEmojis);
    const [headerIndices, setHeaderIndices] = useState(headerRowIndices);
    const {windowWidth} = useWindowDimensions();

    const getItemLayout = (data, index) => ({length: CONST.EMOJI_PICKER_ITEM_HEIGHT, offset: CONST.EMOJI_PICKER_ITEM_HEIGHT * index, index});

    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     *
     * @param {String} searchTerm
     */
    const filterEmojis = _.debounce((searchTerm) => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim().replaceAll(':', '');

        if (emojiList.current) {
            emojiList.current.scrollToOffset({offset: 0, animated: false});
        }

        if (normalizedSearchTerm === '') {
            setFilteredEmojis(allEmojis);
            setHeaderIndices(headerRowIndices);

            return;
        }
        const newFilteredEmojiList = EmojiUtils.suggestEmojis(`:${normalizedSearchTerm}`, preferredLocale, allEmojis.length);

        setFilteredEmojis(newFilteredEmojiList);
        setHeaderIndices(undefined);
    }, 300);

    /**
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    const addToFrequentAndSelectEmoji = (emoji, emojiObject) => {
        const frequentEmojiList = EmojiUtils.getFrequentlyUsedEmojis(emojiObject);
        User.updateFrequentlyUsedEmojis(frequentEmojiList);
        onEmojiSelected(emoji, emojiObject);
    };

    /**
     * @param {Number} skinTone
     */
    const updatePreferredSkinTone = (skinTone) => {
        if (preferredSkinTone === skinTone) {
            return;
        }

        User.updatePreferredSkinTone(skinTone);
    };

    const scrollToHeader = (headerIndex) => {
        const calculatedOffset = Math.floor(headerIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT;
        emojiList.current.flashScrollIndicators();
        runOnUI(() => {
            'worklet';

            scrollTo(emojiList, 0, calculatedOffset, true);
        })();
    };

    /**
     * Return a unique key for each emoji item
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {String}
     */
    const keyExtractor = (item, index) => `${index}${item.code}`;

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param {Object} item
     * @returns {*}
     */
    const renderItem = ({item}) => {
        const {code, types} = item;
        if (item.spacer) {
            return null;
        }

        if (item.header) {
            return (
                <View style={styles.emojiHeaderContainer}>
                    <Text style={styles.textLabelSupporting}>{translate(`emojiPicker.headers.${code}`)}</Text>
                </View>
            );
        }

        const emojiCode = types && types[preferredSkinTone] ? types[preferredSkinTone] : code;

        return (
            <EmojiPickerMenuItem
                onPress={(emoji) => addToFrequentAndSelectEmoji(emoji, item)}
                emoji={emojiCode}
            />
        );
    };

    const isFiltered = allEmojis.length !== filteredEmojis.length;

    return (
        <View style={styles.emojiPickerContainer}>
            <View style={[styles.ph4, styles.pb1, styles.pt2]}>
                <TextInput
                    label={translate('common.search')}
                    accessibilityLabel={translate('common.search')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    onChangeText={filterEmojis}
                />
            </View>
            {!isFiltered && (
                <CategoryShortcutBar
                    headerEmojis={headerEmojis}
                    onPress={scrollToHeader}
                />
            )}
            <Animated.FlatList
                ref={emojiList}
                keyboardShouldPersistTaps="handled"
                data={filteredEmojis}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                numColumns={CONST.EMOJI_NUM_PER_ROW}
                style={[
                    StyleUtils.getEmojiPickerListHeight(isFiltered),
                    {
                        width: windowWidth,
                    },
                ]}
                stickyHeaderIndices={headerIndices}
                getItemLayout={getItemLayout}
                showsVerticalScrollIndicator
                // used because of a bug in RN where stickyHeaderIndices can't be updated after the list is rendered https://github.com/facebook/react-native/issues/25157
                removeClippedSubviews={false}
                contentContainerStyle={styles.flexGrow1}
                ListEmptyComponent={<Text style={[styles.disabledText]}>{translate('common.noResultsFound')}</Text>}
                alwaysBounceVertical={filteredEmojis.length !== 0}
            />
            <EmojiSkinToneList
                updatePreferredSkinTone={updatePreferredSkinTone}
                preferredSkinTone={preferredSkinTone}
            />
        </View>
    );
}

EmojiPickerMenu.displayName = 'EmojiPickerMenu';
EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

export default compose(
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
