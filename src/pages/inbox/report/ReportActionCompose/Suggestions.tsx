import type {ForwardedRef} from 'react';
import React, {useEffect, useImperativeHandle, useRef} from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import type {TextSelection} from '@components/Composer/types';
import {useDragAndDropState} from '@components/DragAndDrop/Provider';
import usePrevious from '@hooks/usePrevious';
import type {SuggestionsRef} from './ComposerContext';
import SuggestionEmoji from './SuggestionEmoji';
import SuggestionMention from './SuggestionMention';

type SuggestionProps = {
    /** The current input value */
    value: string;

    /** The current selection value */
    selection: TextSelection;

    /** Callback to update the current selection */
    setSelection: (newSelection: TextSelection) => void;

    /** Callback to update the comment draft */
    updateComment: (newComment: string, shouldDebounceSaveComment?: boolean) => void;

    /** Measures the parent container's position and dimensions. Also add cursor coordinates */
    measureParentContainerAndReportCursor: (callback: MeasureParentContainerAndCursorCallback) => void;

    /** Report composer focus state */
    isComposerFocused?: boolean;

    /** Callback to reset the keyboard input */
    resetKeyboardInput?: () => void;

    /** Whether the auto suggestion picker is large */
    isAutoSuggestionPickerLarge?: boolean;

    /** The height of the composer */
    composerHeight?: number;

    /** Reference to the outer element */
    ref?: ForwardedRef<SuggestionsRef>;
};

/**
 * This component contains the individual suggestion components.
 * If you want to add a new suggestion type, add it here.
 *
 */
function Suggestions({
    value,
    selection,
    setSelection,
    updateComment,
    resetKeyboardInput,
    measureParentContainerAndReportCursor,
    isAutoSuggestionPickerLarge = true,
    isComposerFocused,
    ref,
}: SuggestionProps) {
    const suggestionEmojiRef = useRef<SuggestionsRef>(null);
    const suggestionMentionRef = useRef<SuggestionsRef>(null);
    const {isDraggingOver} = useDragAndDropState();
    const prevIsDraggingOver = usePrevious(isDraggingOver);

    function getSuggestions() {
        if (suggestionEmojiRef.current?.getSuggestions) {
            const emojiSuggestions = suggestionEmojiRef.current.getSuggestions();
            if (emojiSuggestions.length > 0) {
                return emojiSuggestions;
            }
        }

        if (suggestionMentionRef.current?.getSuggestions) {
            const mentionSuggestions = suggestionMentionRef.current.getSuggestions();
            if (mentionSuggestions.length > 0) {
                return mentionSuggestions;
            }
        }

        return [];
    }

    /**
     * Clean data related to EmojiSuggestions
     */
    function resetSuggestions() {
        suggestionEmojiRef.current?.resetSuggestions();
        suggestionMentionRef.current?.resetSuggestions();
    }

    /**
     * Listens for keyboard shortcuts and applies the action
     */
    function triggerHotkeyActions(e: KeyboardEvent) {
        const emojiHandler = suggestionEmojiRef.current?.triggerHotkeyActions(e);
        const mentionHandler = suggestionMentionRef.current?.triggerHotkeyActions(e);
        return emojiHandler ?? mentionHandler;
    }

    function onSelectionChange(e: TextInputSelectionChangeEvent) {
        const emojiHandler = suggestionEmojiRef.current?.onSelectionChange?.(e);
        suggestionMentionRef.current?.onSelectionChange?.(e);
        return emojiHandler;
    }

    function updateShouldShowSuggestionMenuToFalse() {
        suggestionEmojiRef.current?.updateShouldShowSuggestionMenuToFalse();
        suggestionMentionRef.current?.updateShouldShowSuggestionMenuToFalse();
    }

    function setShouldBlockSuggestionCalc(shouldBlock: boolean) {
        suggestionEmojiRef.current?.setShouldBlockSuggestionCalc(shouldBlock);
        suggestionMentionRef.current?.setShouldBlockSuggestionCalc(shouldBlock);
    }

    function getIsSuggestionsMenuVisible(): boolean {
        const isEmojiVisible = suggestionEmojiRef.current?.getIsSuggestionsMenuVisible() ?? false;
        const isSuggestionVisible = suggestionMentionRef.current?.getIsSuggestionsMenuVisible() ?? false;
        return isEmojiVisible || isSuggestionVisible;
    }

    useImperativeHandle(ref, () => ({
        resetSuggestions,
        onSelectionChange,
        triggerHotkeyActions,
        updateShouldShowSuggestionMenuToFalse,
        setShouldBlockSuggestionCalc,
        getSuggestions,
        getIsSuggestionsMenuVisible,
    }));

    useEffect(() => {
        if (!(!prevIsDraggingOver && isDraggingOver)) {
            return;
        }
        updateShouldShowSuggestionMenuToFalse();
    }, [isDraggingOver, prevIsDraggingOver, updateShouldShowSuggestionMenuToFalse]);

    const baseProps = {
        value,
        setSelection,
        selection,
        updateComment,
        isAutoSuggestionPickerLarge,
        measureParentContainerAndReportCursor,
        isComposerFocused,
    };

    return (
        <View testID="suggestions">
            <SuggestionEmoji
                ref={suggestionEmojiRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...baseProps}
                resetKeyboardInput={resetKeyboardInput}
            />
            <SuggestionMention
                ref={suggestionMentionRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...baseProps}
            />
        </View>
    );
}

export default Suggestions;

export type {SuggestionProps};
