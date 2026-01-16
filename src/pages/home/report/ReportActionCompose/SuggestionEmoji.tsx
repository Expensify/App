import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {Emoji} from '@assets/emojis/types';
import EmojiSuggestions from '@components/EmojiSuggestions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useDebounce from '@hooks/useDebounce';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {suggestEmojis} from '@libs/EmojiUtils';
import {trimLeadingSpace} from '@libs/SuggestionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SuggestionProps} from './Suggestions';

type SuggestionsValue = {
    suggestedEmojis: Emoji[];
    colonIndex: number;
    shouldShowSuggestionMenu: boolean;
};

type SuggestionEmojiProps = SuggestionProps & {
    /** Function to clear the input */
    resetKeyboardInput?: () => void;
};
/**
 * Check if this piece of string looks like an emoji
 */
const isEmojiCode = (str: string, pos: number): boolean => {
    const leftWords = str.slice(0, pos).split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
    const leftWord = leftWords.at(-1) ?? '';
    return CONST.REGEX.HAS_COLON_ONLY_AT_THE_BEGINNING.test(leftWord) && leftWord.length > 2;
};

const defaultSuggestionsValues: SuggestionsValue = {
    suggestedEmojis: [],
    colonIndex: -1,
    shouldShowSuggestionMenu: false,
};

function SuggestionEmoji({
    value,
    selection,
    setSelection,
    updateComment,
    isAutoSuggestionPickerLarge,
    resetKeyboardInput,
    measureParentContainerAndReportCursor,
    isComposerFocused,
    ref,
}: SuggestionEmojiProps) {
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {canBeMissing: true});
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);
    const suggestionValuesRef = useRef(suggestionValues);
    suggestionValuesRef.current = suggestionValues;

    const isEmojiSuggestionsMenuVisible = suggestionValues.suggestedEmojis.length > 0 && suggestionValues.shouldShowSuggestionMenu;

    const [highlightedEmojiIndex, setHighlightedEmojiIndex] = useArrowKeyFocusManager({
        isActive: isEmojiSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedEmojis.length - 1,
        shouldExcludeTextAreaNodes: false,
    });

    const {preferredLocale} = useLocalize();

    // Used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockCalc = useRef(false);

    /**
     * Replace the code of emoji and update selection
     * @param {Number} selectedEmoji
     */
    const insertSelectedEmoji = useCallback(
        (highlightedEmojiIndexInner: number) => {
            const commentBeforeColon = value.slice(0, suggestionValues.colonIndex);
            const emojiObject = highlightedEmojiIndexInner !== -1 ? suggestionValues.suggestedEmojis.at(highlightedEmojiIndexInner) : undefined;
            const emojiCode = emojiObject?.types?.at(preferredSkinTone) && preferredSkinTone !== -1 ? emojiObject.types.at(preferredSkinTone) : emojiObject?.code;
            const commentAfterColonWithEmojiNameRemoved = value.slice(selection.end);

            updateComment(`${commentBeforeColon}${emojiCode} ${trimLeadingSpace(commentAfterColonWithEmojiNameRemoved)}`, true);

            // In some Android phones keyboard, the text to search for the emoji is not cleared
            // will be added after the user starts typing again on the keyboard. This package is
            // a workaround to reset the keyboard natively.
            resetKeyboardInput?.();

            setSelection({
                start: suggestionValues.colonIndex + (emojiCode?.length ?? 0) + CONST.SPACE_LENGTH,
                end: suggestionValues.colonIndex + (emojiCode?.length ?? 0) + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({...prevState, suggestedEmojis: []}));
        },
        [preferredSkinTone, resetKeyboardInput, selection.end, setSelection, suggestionValues.colonIndex, suggestionValues.suggestedEmojis, updateComment, value],
    );

    /**
     * Clean data related to suggestions
     */
    const resetSuggestions = useCallback(() => {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);

    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        setSuggestionValues((prevState) => {
            if (prevState.shouldShowSuggestionMenu) {
                return {...prevState, shouldShowSuggestionMenu: false};
            }
            return prevState;
        });
    }, []);

    /**
     * Listens for keyboard shortcuts and applies the action
     */
    const triggerHotkeyActions = useCallback(
        (e: KeyboardEvent) => {
            const suggestionsExist = suggestionValues.suggestedEmojis.length > 0;

            if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                e.preventDefault();
                if (suggestionValues.suggestedEmojis.length > 0) {
                    insertSelectedEmoji(highlightedEmojiIndex);
                }
                return true;
            }

            if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();

                if (suggestionsExist) {
                    resetSuggestions();
                }

                return true;
            }
        },
        [highlightedEmojiIndex, insertSelectedEmoji, resetSuggestions, suggestionValues.suggestedEmojis.length],
    );

    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    const calculateEmojiSuggestion = useCallback(
        (newValue: string, selectionStart?: number, selectionEnd?: number) => {
            if (selectionStart !== selectionEnd || !selectionEnd || shouldBlockCalc.current || !newValue || (selectionStart === 0 && selectionEnd === 0)) {
                shouldBlockCalc.current = false;
                resetSuggestions();
                return;
            }
            const leftString = newValue.substring(0, selectionEnd);
            const colonIndex = leftString.lastIndexOf(':');
            const isCurrentlyShowingEmojiSuggestion = isEmojiCode(newValue, selectionEnd);

            const nextState: SuggestionsValue = {
                suggestedEmojis: [],
                colonIndex,
                shouldShowSuggestionMenu: false,
            };
            const newSuggestedEmojis = suggestEmojis(leftString, preferredLocale);

            if (newSuggestedEmojis?.length && isCurrentlyShowingEmojiSuggestion) {
                nextState.suggestedEmojis = newSuggestedEmojis;
                nextState.shouldShowSuggestionMenu = !isEmptyObject(newSuggestedEmojis);
            }

            // Early return if there is no update
            const currentState = suggestionValuesRef.current;
            if (nextState.suggestedEmojis.length === 0 && currentState.suggestedEmojis.length === 0) {
                return;
            }

            setSuggestionValues((prevState) => ({...prevState, ...nextState}));
            setHighlightedEmojiIndex(0);
        },
        [preferredLocale, setHighlightedEmojiIndex, resetSuggestions],
    );

    const debouncedCalculateEmojiSuggestion = useDebounce(
        useCallback(
            (newValue: string, selectionStart?: number, selectionEnd?: number) => {
                calculateEmojiSuggestion(newValue, selectionStart, selectionEnd);
            },
            [calculateEmojiSuggestion],
        ),
        CONST.TIMING.SUGGESTION_DEBOUNCE_TIME,
    );

    useEffect(() => {
        if (!isComposerFocused) {
            return;
        }

        debouncedCalculateEmojiSuggestion(value, selection.start, selection.end);
    }, [value, selection.start, selection.end, debouncedCalculateEmojiSuggestion, isComposerFocused]);

    const setShouldBlockSuggestionCalc = useCallback(
        (shouldBlockSuggestionCalc: boolean) => {
            shouldBlockCalc.current = shouldBlockSuggestionCalc;
        },
        [shouldBlockCalc],
    );

    const getSuggestions = useCallback(() => suggestionValues.suggestedEmojis, [suggestionValues.suggestedEmojis]);

    const getIsSuggestionsMenuVisible = useCallback(() => isEmojiSuggestionsMenuVisible, [isEmojiSuggestionsMenuVisible]);

    useImperativeHandle(
        ref,
        () => ({
            resetSuggestions,
            triggerHotkeyActions,
            setShouldBlockSuggestionCalc,
            updateShouldShowSuggestionMenuToFalse,
            getSuggestions,
            getIsSuggestionsMenuVisible,
        }),
        [resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions, getIsSuggestionsMenuVisible],
    );

    if (!isEmojiSuggestionsMenuVisible) {
        return null;
    }

    return (
        <EmojiSuggestions
            highlightedEmojiIndex={highlightedEmojiIndex}
            emojis={suggestionValues.suggestedEmojis}
            prefix={value.slice(suggestionValues.colonIndex + 1, selection.end)}
            onSelect={insertSelectedEmoji}
            preferredSkinToneIndex={preferredSkinTone}
            isEmojiPickerLarge={!!isAutoSuggestionPickerLarge}
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

export default SuggestionEmoji;
