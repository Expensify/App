import {useEffect, useRef} from 'react';
import type {RefObject} from 'react';
import type {ComposerRef, TextSelection} from '@components/Composer/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import {useComposerEditActions, useComposerEditState} from './ComposerContext';
import ReportActionComposeUtils from './ReportActionComposeUtils';
import updateNativeTextInputValue from './updateNativeTextInputValue';

type UseEditComposerToggleProps = {
    /** The selection of the composer */
    selection: TextSelection;

    /** The draft comment of the composer */
    draftComment: string;

    /** The ref to the composer */
    composerRef: RefObject<ComposerRef | null>;

    /** Handle changing the selection of the composer */
    onSelectionChange?: (selection: TextSelection) => void;

    /** Handle focusing the composer */
    onFocus?: () => void;

    /** Handle changing the value of the composer */
    onValueChange?: (value: string) => void;
};

/**
 * useEditComposerToggle is a hook that manages the editing state of the composer.
 * It is used to toggle the editing state of the composer and to apply the changes to the composer.
 * Additionally, it is used to restore the draft comment and the selection when the editing state is toggled off,
 * to focus the composer when the editing state is toggled on,
 * to update the value of the composer when the editing state is toggled on,
 * and to update the selection of the composer when the editing state is toggled on.
 */
function useEditComposerToggle({selection, draftComment, composerRef, onFocus, onValueChange, onSelectionChange}: UseEditComposerToggleProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {isEditingInComposer, editingState, editingReportActionID, editingMessage, currentEditMessageSelection} = useComposerEditState();
    const {setDidResetComposerHeightWhileEditing} = useComposerEditActions();
    const isEditing = editingState !== CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF;

    const wasEditingRef = useRef(isEditing);
    const wasEditingInComposerRef = useRef(shouldUseNarrowLayout);
    const wasComposerFocusedBeforeEditingRef = useRef(false);
    const previousDraftSelectionRef = useRef<TextSelection | null>(null);
    const previousEditingReportActionIDRef = useRef<string | null>(null);

    type ApplyComposerValueOptions = {
        isEditingInComposer?: boolean;
        shouldMoveSelectionToEnd?: boolean;
        selection?: TextSelection | null;
        shouldForceNativeValueUpdate?: boolean;
    };

    const applyComposerValue = (nextValue: string, options?: ApplyComposerValueOptions) => {
        const defaultSelection: TextSelection = {start: nextValue.length, end: nextValue.length};
        const shouldUseEditingSelection = options?.isEditingInComposer ?? false;
        const shouldForceSelectionToEnd = options?.shouldMoveSelectionToEnd ?? false;
        const explicitSelection = options?.selection ?? null;

        const selectionToApply = explicitSelection ?? (shouldUseEditingSelection && !shouldForceSelectionToEnd ? (currentEditMessageSelection ?? defaultSelection) : defaultSelection);

        onValueChange?.(nextValue);
        updateNativeTextInputValue({text: nextValue, shouldForceNativeValueUpdate: options?.shouldForceNativeValueUpdate ?? false, composerRef});

        onSelectionChange?.(selectionToApply);
        ReportActionComposeUtils.updateNativeSelectionValue(composerRef, selectionToApply.start, selectionToApply.end ?? selectionToApply.start);

        if (options?.isEditingInComposer) {
            onFocus?.();
        }
    };

    useEffect(() => {
        // If the draft message is already being submitted, do nothing.
        if (editingState === CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED) {
            return;
        }

        if (editingState !== CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING) {
            if (wasEditingRef.current && wasEditingInComposerRef.current) {
                // Editing just ended in the composer – restore the draft comment and its previous selection.
                applyComposerValue(draftComment ?? '', {selection: previousDraftSelectionRef.current, shouldForceNativeValueUpdate: true});

                // Once the composer is no longer in edit mode, we can reset the manual composer height.
                if (wasEditingInComposerRef.current) {
                    setDidResetComposerHeightWhileEditing(false);
                }

                if (!wasComposerFocusedBeforeEditingRef.current) {
                    composerRef.current?.blur();
                }
            }

            wasEditingRef.current = false;
            wasEditingInComposerRef.current = shouldUseNarrowLayout;
            previousDraftSelectionRef.current = null;
            return;
        }

        // Editing just started.
        if (!wasEditingRef.current) {
            wasComposerFocusedBeforeEditingRef.current = composerRef.current?.isFocused() ?? false;
            // Store the draft selection before switching into edit mode so we can restore it later.
            previousDraftSelectionRef.current = selection;

            wasEditingRef.current = true;
            wasEditingInComposerRef.current = shouldUseNarrowLayout;

            if (!shouldUseNarrowLayout) {
                // Wide layout – another editor handles the edit, keep composer draft as-is.
                return;
            }
            // In narrow layout we always show the message being edited.
            // When starting to edit in the composer, always place the cursor at the end of the message.
            applyComposerValue(editingMessage ?? '', {isEditingInComposer: true, shouldMoveSelectionToEnd: true, shouldForceNativeValueUpdate: true});
            return;
        }

        // Editing is ongoing and layout toggled from wide to narrow.
        if (shouldUseNarrowLayout && !wasEditingInComposerRef.current) {
            wasEditingInComposerRef.current = true;
            // We just moved from wide to narrow while editing – start editing in the composer.
            applyComposerValue(editingMessage ?? '', {isEditingInComposer: true});
            return;
        }

        // Editing is ongoing and layout toggled from narrow to wide.
        if (!shouldUseNarrowLayout && wasEditingInComposerRef.current) {
            wasEditingInComposerRef.current = false;
            applyComposerValue(draftComment ?? '');
            return;
        }

        // The editing report action and message changed
        if (shouldUseNarrowLayout && editingReportActionID !== previousEditingReportActionIDRef.current) {
            applyComposerValue(editingMessage ?? '', {isEditingInComposer: true, shouldForceNativeValueUpdate: true});
        }

        previousEditingReportActionIDRef.current = editingReportActionID;
    }, [
        applyComposerValue,
        composerRef,
        draftComment,
        editingMessage,
        editingReportActionID,
        editingState,
        isEditingInComposer,
        selection,
        setDidResetComposerHeightWhileEditing,
        shouldUseNarrowLayout,
    ]);
}

export default useEditComposerToggle;
