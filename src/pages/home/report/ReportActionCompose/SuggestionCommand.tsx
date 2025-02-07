import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import CommandSuggestions from '@components/CommandSuggestions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useLocalize from '@hooks/useLocalize';
import * as SuggestionsUtils from '@libs/SuggestionUtils';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SuggestionsRef} from './ReportActionCompose';
import type {SuggestionProps} from './Suggestions';

type Command = {
    code: string;
    description: string;
};

type SuggestionsValue = {
    suggestedCommands: Command[];
    shouldShowSuggestionMenu: boolean;
};

type SuggestionCommandProps = SuggestionProps & {
    /** Function to clear the input */
    resetKeyboardInput?: () => void;
};

const defaultSuggestionsValues: SuggestionsValue = {
    suggestedCommands: [],
    shouldShowSuggestionMenu: false,
};

function SuggestionCommand(
    {value, selection, setSelection, updateComment, resetKeyboardInput, measureParentContainerAndReportCursor, isComposerFocused}: SuggestionCommandProps,
    ref: ForwardedRef<SuggestionsRef>,
) {
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);
    const suggestionValuesRef = useRef(suggestionValues);
    // eslint-disable-next-line react-compiler/react-compiler
    suggestionValuesRef.current = suggestionValues;

    const isCommandSuggestionsMenuVisible = suggestionValues.suggestedCommands.length > 0 && suggestionValues.shouldShowSuggestionMenu;

    const [highlightedCommandIndex, setHighlightedCommandIndex] = useArrowKeyFocusManager({
        isActive: isCommandSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedCommands.length - 1,
        shouldExcludeTextAreaNodes: false,
    });

    // Used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockCalc = useRef(false);

    /**
     * Replace the code of command and update selection
     * @param {Number} selectedCommand
     */
    const insertSelectedCommand = useCallback(
        (commandIndex: number) => {
            const commandObj = commandIndex !== -1 ? suggestionValues.suggestedCommands.at(commandIndex) : undefined;
            const commandCode = commandObj?.code;
            const commentAfterColonWithCommandNameRemoved = value.slice(selection.end);

            updateComment(`${commandCode} ${SuggestionsUtils.trimLeadingSpace(commentAfterColonWithCommandNameRemoved)}`, true);

            // In some Android phones keyboard, the text to search for the command is not cleared
            // will be added after the user starts typing again on the keyboard. This package is
            // a workaround to reset the keyboard natively.
            resetKeyboardInput?.();

            setSelection({
                start: (commandCode?.length ?? 0) + CONST.SPACE_LENGTH,
                end: (commandCode?.length ?? 0) + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({...prevState, suggestedCommands: []}));
        },
        [resetKeyboardInput, selection.end, setSelection, suggestionValues.suggestedCommands, updateComment, value],
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
            const suggestionsExist = suggestionValues.suggestedCommands.length > 0;

            if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                e.preventDefault();
                if (suggestionValues.suggestedCommands.length > 0) {
                    insertSelectedCommand(highlightedCommandIndex);
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
        [highlightedCommandIndex, insertSelectedCommand, resetSuggestions, suggestionValues.suggestedCommands.length],
    );

    /**
     * Calculates and cares about the content of an Command Suggester
     */
    const calculateCommandSuggestion = useCallback(
        (newValue: string, selectionStart?: number, selectionEnd?: number) => {
            if (selectionStart !== selectionEnd || !selectionEnd || shouldBlockCalc.current || !newValue || (selectionStart === 0 && selectionEnd === 0)) {
                shouldBlockCalc.current = false;
                resetSuggestions();
                return;
            }
            const isCurrentlyShowingCommandSuggestion = newValue.startsWith('/');

            const nextState: SuggestionsValue = {
                suggestedCommands: [],
                shouldShowSuggestionMenu: false,
            };
            const newSuggestedCommands = [];

            if (newSuggestedCommands?.length && isCurrentlyShowingCommandSuggestion) {
                nextState.suggestedCommands = newSuggestedCommands;
                nextState.shouldShowSuggestionMenu = !isEmptyObject(newSuggestedCommands);
            }

            // Early return if there is no update
            const currentState = suggestionValuesRef.current;
            if (nextState.suggestedCommands.length === 0 && currentState.suggestedCommands.length === 0) {
                return;
            }

            setSuggestionValues((prevState) => ({...prevState, ...nextState}));
            setHighlightedCommandIndex(0);
        },
        [setHighlightedCommandIndex, resetSuggestions],
    );

    useEffect(() => {
        if (!isComposerFocused) {
            return;
        }

        calculateCommandSuggestion(value, selection.start, selection.end);
    }, [value, selection, calculateCommandSuggestion, isComposerFocused]);

    const setShouldBlockSuggestionCalc = useCallback(
        (shouldBlockSuggestionCalc: boolean) => {
            shouldBlockCalc.current = shouldBlockSuggestionCalc;
        },
        [shouldBlockCalc],
    );

    const getSuggestions = useCallback(() => suggestionValues.suggestedCommands, [suggestionValues]);

    const getIsSuggestionsMenuVisible = useCallback(() => isCommandSuggestionsMenuVisible, [isCommandSuggestionsMenuVisible]);

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

    if (!isCommandSuggestionsMenuVisible) {
        return null;
    }

    return (
        <CommandSuggestions
            highlightedCommandIndex={highlightedCommandIndex}
            commands={suggestionValues.suggestedCommands}
            onSelect={insertSelectedCommand}
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

SuggestionCommand.displayName = 'SuggestionCommand';

export default forwardRef(SuggestionCommand);
export type {Command};
