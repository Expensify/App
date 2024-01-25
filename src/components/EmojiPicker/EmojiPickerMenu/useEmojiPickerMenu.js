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
    const [filteredEmojis, setFilteredEmojis] = useState(allEmojis);
    const [headerIndices, setHeaderIndices] = useState(headerRowIndices);
    const isListFiltered = allEmojis.length !== filteredEmojis.length;
    const {preferredLocale} = useLocalize();
    const [preferredSkinTone] = usePreferredEmojiSkinTone();
    const {windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const listStyle = StyleUtils.getEmojiPickerListHeight(isListFiltered, windowHeight);

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
    };
};

export default useEmojiPickerMenu;
