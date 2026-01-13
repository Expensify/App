import type {FlashListRef} from '@shopify/flash-list';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import emojis from '@assets/emojis';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredEmojiSkinTone from '@hooks/usePreferredEmojiSkinTone';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {EmojiPickerList, EmojiPickerListItem} from '@libs/EmojiUtils';
import {getHeaderEmojis, getSpacersIndexes, mergeEmojisWithFrequentlyUsedEmojis, processFrequentlyUsedEmojis, suggestEmojis} from '@libs/EmojiUtils';
import ONYXKEYS from '@src/ONYXKEYS';

const useEmojiPickerMenu = () => {
    const emojiListRef = useRef<FlashListRef<EmojiPickerListItem>>(null);
    const [frequentlyUsedEmojis] = useOnyx(ONYXKEYS.FREQUENTLY_USED_EMOJIS, {canBeMissing: true});
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const allEmojis = useMemo(() => mergeEmojisWithFrequentlyUsedEmojis(emojis, processFrequentlyUsedEmojis(frequentlyUsedEmojis)), [frequentlyUsedEmojis]);
    const headerEmojis = useMemo(() => getHeaderEmojis(allEmojis), [allEmojis]);
    const headerRowIndices = useMemo(() => headerEmojis.map((headerEmoji) => headerEmoji.index), [headerEmojis]);
    const spacersIndexes = useMemo(() => getSpacersIndexes(allEmojis), [allEmojis]);
    const [filteredEmojis, setFilteredEmojis] = useState<EmojiPickerList>(allEmojis);
    const [headerIndices, setHeaderIndices] = useState(headerRowIndices);
    const isListFiltered = allEmojis.length !== filteredEmojis.length;
    const {preferredLocale} = useLocalize();
    const [preferredSkinTone] = usePreferredEmojiSkinTone();
    const {windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardState();

    /**
     * The EmojiPicker sets the `innerContainerStyle` with `maxHeight: '95%'` in `styles.popoverInnerContainer`
     * to prevent the list from being cut off when the list height exceeds the container's height.
     * To calculate the available list height, we subtract the keyboard height from the `windowHeight`
     * to ensure the list is properly adjusted when the keyboard is visible.
     */
    const listStyle = StyleUtils.getEmojiPickerListHeight(isListFiltered, windowHeight * 0.95 - keyboardHeight);

    useEffect(() => {
        setFilteredEmojis(allEmojis);
    }, [allEmojis]);

    useEffect(() => {
        setHeaderIndices(headerRowIndices);
    }, [headerRowIndices]);

    /**
     * Suggest emojis based on the search term
     */
    const suggestEmojisCallback = useCallback(
        (searchTerm: string) => {
            const normalizedSearchTerm = searchTerm.toLowerCase().trim().replaceAll(':', '');
            const emojisSuggestions = suggestEmojis(`:${normalizedSearchTerm}`, preferredLocale, allEmojis.length);

            return [normalizedSearchTerm, emojisSuggestions] as const;
        },
        [allEmojis.length, preferredLocale],
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
        suggestEmojis: suggestEmojisCallback,
        preferredSkinTone,
        listStyle,
        emojiListRef,
        spacersIndexes,
    };
};

export default useEmojiPickerMenu;
