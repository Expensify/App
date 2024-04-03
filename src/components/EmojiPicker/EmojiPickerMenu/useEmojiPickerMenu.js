import {useCallback, useEffect, useMemo, useState} from 'react';
import {useAnimatedRef} from 'react-native-reanimated';
import _ from 'underscore';
import emojis from '@assets/emojis';
import {useFrequentlyUsedEmojis} from '@components/OnyxProvider';
import useLocalize from '@hooks/useLocalize';
import usePreferredEmojiSkinTone from '@hooks/usePreferredEmojiSkinTone';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as EmojiUtils from '@libs/EmojiUtils';

const useEmojiPickerMenu = () => {
    const emojiListRef = useAnimatedRef();
    const frequentlyUsedEmojis = useFrequentlyUsedEmojis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const allEmojis = useMemo(() => EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis), [frequentlyUsedEmojis]);
    const headerEmojis = useMemo(() => EmojiUtils.getHeaderEmojis(allEmojis), [allEmojis]);
    const headerRowIndices = useMemo(() => _.map(headerEmojis, (headerEmoji) => headerEmoji.index), [headerEmojis]);
    const spacersIndexes = useMemo(() => EmojiUtils.getSpacersIndexes(allEmojis), [allEmojis]);
    const [filteredEmojis, setFilteredEmojis] = useState(allEmojis);
    const [headerIndices, setHeaderIndices] = useState(headerRowIndices);
    const isListFiltered = allEmojis.length !== filteredEmojis.length;
    const {preferredLocale} = useLocalize();
    const [preferredSkinTone] = usePreferredEmojiSkinTone();
    const {windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    /**
     * At EmojiPicker has set innerContainerStyle with maxHeight: '95%' by styles.popoverInnerContainer
     * to avoid the list style to be cut off due to the list height being larger than the container height
     * so we need to calculate listStyle based on the height of the window and innerContainerStyle at the EmojiPicker
     */
    const listStyle = StyleUtils.getEmojiPickerListHeight(isListFiltered, windowHeight * 0.95);

    useEffect(() => {
        setFilteredEmojis(allEmojis);
    }, [allEmojis]);

    useEffect(() => {
        setHeaderIndices(headerRowIndices);
    }, [headerRowIndices]);

    /**
     * Suggest emojis based on the search term
     * @param {String} searchTerm
     * @returns {[String, Array]}
     */
    const suggestEmojis = useCallback(
        (searchTerm) => {
            const normalizedSearchTerm = searchTerm.toLowerCase().trim().replaceAll(':', '');
            const emojisSuggestions = EmojiUtils.suggestEmojis(`:${normalizedSearchTerm}`, preferredLocale, allEmojis.length);

            return [normalizedSearchTerm, emojisSuggestions];
        },
        [allEmojis, preferredLocale],
    );

    return {
        allEmojis,
        headerEmojis,
        headerRowIndices,
        filteredEmojis,
        headerIndices,
        setFilteredEmojis,
        setHeaderIndices,
        isListFiltered,
        suggestEmojis,
        preferredSkinTone,
        listStyle,
        emojiListRef,
        spacersIndexes,
    };
};

export default useEmojiPickerMenu;
