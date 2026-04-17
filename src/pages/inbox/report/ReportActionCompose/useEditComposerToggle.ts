/* eslint-disable no-param-reassign */
import {useCallback, useEffect, useRef} from 'react';
import type {RefObject} from 'react';
import type {ComposerRef, TextSelection} from '@components/Composer/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getPlatform from '@libs/getPlatform';
import {useReportActionActiveEdit} from '@pages/inbox/report/ReportActionEditMessageContext';
import CONST from '@src/CONST';
import ReportActionComposeUtils from './ReportActionComposeUtils';

const isIOSNative = getPlatform() === CONST.PLATFORM.IOS;
type UseEditComposerToggleProps = {
    selection: TextSelection;
    draftComment: string;
    composerRef: RefObject<ComposerRef | null>;
    onEditEnd?: () => void;
    onSelectionChange?: (selection: TextSelection) => void;
    onFocus?: () => void;
    onValueChange?: (value: string) => void;
};

/**
 * useEditComposerToggle is a hook that manages the editing state of the composer.
 * It is used to toggle the editing state of the composer and to apply the changes to the composer.
 * It is also used to restore the draft comment and the selection when the editing state is toggled off.
 * It is also used to focus the composer when the editing state is toggled on.
 * It is also used to update the value of the composer when the editing state is toggled on.
 * It is also used to update the selection of the composer when the editing state is toggled on.
 */
function useEditComposerToggle({selection, draftComment, composerRef, onEditEnd, onFocus, onValueChange, onSelectionChange}: UseEditComposerToggleProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {editingState, editingReportActionID, editingMessage, currentEditMessageSelection} = useReportActionActiveEdit();
    const isEditing = editingState !== 'off';

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

    const applyComposerValue = useCallback(
        (nextValue: string, options?: ApplyComposerValueOptions) => {
            const defaultSelection: TextSelection = {start: nextValue.length, end: nextValue.length};
            const shouldUseEditingSelection = options?.isEditingInComposer ?? false;
            const shouldForceSelectionToEnd = options?.shouldMoveSelectionToEnd ?? false;
            const explicitSelection = options?.selection ?? null;

            const selectionToApply = explicitSelection ?? (shouldUseEditingSelection && !shouldForceSelectionToEnd ? (currentEditMessageSelection ?? defaultSelection) : defaultSelection);

            onValueChange?.(nextValue);
            // We need to manually update the native text prop,
            // in order to force a re-calculation of the composer height and layout,
            // when the composer changes in or out of edit mode.
            if (isIOSNative && options?.shouldForceNativeValueUpdate) {
                composerRef.current?.setNativeProps({text: nextValue});
            }

            onSelectionChange?.(selectionToApply);
            ReportActionComposeUtils.updateNativeSelectionValue(composerRef, selectionToApply.start, selectionToApply.end ?? selectionToApply.start);

            if (options?.isEditingInComposer) {
                onFocus?.();
            }
        },
        [composerRef, currentEditMessageSelection, onFocus, onSelectionChange, onValueChange],
    );

    useEffect(() => {
        // If the draft message is already being submitted, do nothing.
        if (editingState === 'submitted') {
            return;
        }

        if (editingState !== 'editing') {
            if (wasEditingRef.current && wasEditingInComposerRef.current) {
                // Editing just ended in the composer – restore the draft comment and its previous selection.
                applyComposerValue(draftComment ?? '', {selection: previousDraftSelectionRef.current, shouldForceNativeValueUpdate: true});
                onEditEnd?.();

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
    }, [applyComposerValue, composerRef, draftComment, editingMessage, editingReportActionID, editingState, selection, onEditEnd, shouldUseNarrowLayout]);

    return {wasEditingRef};
}

export default useEditComposerToggle;
