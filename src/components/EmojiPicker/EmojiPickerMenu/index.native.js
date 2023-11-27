import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Animated, {runOnUI, scrollTo, useAnimatedRef} from 'react-native-reanimated';
import _ from 'underscore';
import emojis from '@assets/emojis';
import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import EmojiPickerMenuItem from '@components/EmojiPicker/EmojiPickerMenuItem';
import EmojiSkinToneList from '@components/EmojiPicker/EmojiSkinToneList';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Stores user's frequently used emojis */
    // eslint-disable-next-line react/forbid-prop-types
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.object),

    /** Props related to translation */
    ...withLocalizePropTypes,
};

const defaultProps = {
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    frequentlyUsedEmojis: [],
};

function EmojiPickerMenu({preferredLocale, onEmojiSelected, preferredSkinTone, translate, frequentlyUsedEmojis}) {
    const styles = useThemeStyles();
    const emojiList = useAnimatedRef();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const allEmojis = useMemo(() => EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis), [frequentlyUsedEmojis]);
    const headerEmojis = useMemo(() => EmojiUtils.getHeaderEmojis(allEmojis), [allEmojis]);
    const headerRowIndices = useMemo(() => _.map(headerEmojis, (headerEmoji) => Math.floor(headerEmoji.index / CONST.EMOJI_NUM_PER_ROW)), [headerEmojis]);
    const [filteredEmojis, setFilteredEmojis] = useState(allEmojis);
    const [headerIndices, setHeaderIndices] = useState(headerRowIndices);
    const {windowWidth} = useWindowDimensions();
    const {singleExecution} = useSingleExecution();

    useEffect(() => {
        setFilteredEmojis(allEmojis);
    }, [allEmojis]);

    useEffect(() => {
        setHeaderIndices(headerRowIndices);
    }, [headerRowIndices]);

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
                onPress={singleExecution((emoji) => onEmojiSelected(emoji, item))}
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
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    onChangeText={filterEmojis}
                    blurOnSubmit={filteredEmojis.length > 0}
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

const EmojiPickerMenuWithRef = React.forwardRef((props, ref) => (
    <EmojiPickerMenu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

EmojiPickerMenuWithRef.displayName = 'EmojiPickerMenuWithRef';

export default compose(
    withLocalize,
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        frequentlyUsedEmojis: {
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
        },
    }),
)(EmojiPickerMenuWithRef);
