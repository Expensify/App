import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import Log from '@libs/Log';
import {chatIncludesConcierge} from '@libs/ReportUtils';

import {useReportActionActiveEdit} from '@pages/inbox/report/ReportActionEditMessageContext';

import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

import type {LayoutChangeEvent, View} from 'react-native';

import React, {useRef, useState} from 'react';
import {scheduleOnUI} from 'react-native-worklets';

import type {SuggestionsRef} from './ComposerContext';
import type {ComposerWithSuggestionsRef} from './ComposerWithSuggestions';

import {
    ComposerActionsContext,
    ComposerEditActionsContext,
    ComposerEditStateContext,
    ComposerMetaContext,
    ComposerSendStateContext,
    ComposerStateContext,
    ComposerTextContext,
} from './ComposerContext';
import useComposerFocus from './useComposerFocus';
import useDebouncedCommentMaxLengthValidation from './useDebouncedCommentMaxLengthValidation';
import useEditMessage from './useEditMessage';

const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

type ComposerProviderProps = {
    reportID: string;
    nativeID?: string;
    onLayout?: (event: LayoutChangeEvent) => void;
    children: React.ReactNode;
};

function ComposerProvider({children, reportID, nativeID, onLayout}: ComposerProviderProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const [initialModalState] = useOnyx(ONYXKEYS.MODAL);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const shouldFocusComposerOnScreenFocus = shouldFocusInputOnScreenFocus || !!draftComment;
    const initialFocused = shouldFocusComposerOnScreenFocus && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);
    const isBlockedFromConcierge = includesConcierge && userBlockedFromConcierge;

    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const getInitialText = () => {
        return draftComment ?? '';
    };
    const textRef = useRef<string>(getInitialText());
    const [text, setTextState] = useState(getInitialText);

    const setText = (v: string) => {
        setTextState(v);
        textRef.current = v;
    };

    const containerRef = useRef<View>(null);
    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerWithSuggestionsRef | null>(null);
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const attachmentFileRef = useRef<FileObject | FileObject[] | null>(null);

    const {editingState, editingReportID, editingReportActionID, editingReportAction, editingMessage, currentEditMessageSelection} = useReportActionActiveEdit();

    const [didResetComposerHeightWhileEditing, setDidResetComposerHeightWhileEditing] = useState(false);

    const isEditingInComposer = shouldUseNarrowLayout && editingState !== 'off' && !didResetComposerHeightWhileEditing;
    const effectiveDraft = isEditingInComposer ? editingMessage : draftComment;

    const {debouncedCommentMaxLengthValidation, exceededMaxLength, isExceedingMaxLength, isTaskTitle} = useDebouncedCommentMaxLengthValidation({
        reportID,
        isEditing: !!editingReportAction,
    });

    // Prime the debounce so flush() returns a valid result for restored drafts.
    // Initialize to true (skip) when there's no draft, false (run) when there is.
    const [hasInitialValidationRun, setHasInitialValidationRun] = useState(!draftComment);
    if (!hasInitialValidationRun && draftComment) {
        setHasInitialValidationRun(true);
        debouncedCommentMaxLengthValidation(draftComment);
        debouncedCommentMaxLengthValidation.flush();
    }

    const originalReportID = useOriginalReportID(editingReportID ?? undefined, editingReportAction);

    const {publishDraft, deleteDraft} = useEditMessage({
        reportID: editingReportID ?? undefined,
        originalReportID,
        reportAction: editingReportAction,
        shouldScrollToLastMessage: false,
        debouncedCommentMaxLengthValidation,
        composerRef,
    });

    const isDraftCommentEmpty = !text || !!text.match(CONST.REGEX.EMPTY_COMMENT);
    const isSubmittingDraftCommentDisabled = isBlockedFromConcierge || isExceedingMaxLength || isDraftCommentEmpty;
    const isSendDisabled = !isEditingInComposer && isSubmittingDraftCommentDisabled;

    const {isFocused, onBlur, onFocus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, isNextModalWillOpenRef} = useComposerFocus({
        composerRef,
        suggestionsRef,
        actionButtonRef,
        initialFocused,
    });

    const clearComposer = () => {
        const tryClear = (attemptsLeft: number) => {
            const clearWorklet = composerRef.current?.clearWorklet;
            if (clearWorklet) {
                scheduleOnUI(clearWorklet);
                return;
            }

            // On the attachment-send path, clearComposer is the trigger for the actual send: clearWorklet runs the
            // native input clear, whose onClear handler calls validateAndSubmitDraft -> addAttachmentWithComment. So a
            // missing ref must not be swallowed, or the attachment is silently dropped. The composer lives on an
            // RNSScreen that react-native-screens freezes while another screen (e.g. ReportAddAttachment) is on top, so
            // right after navigating back the ref may not have re-attached yet. Retry on the next frame instead of
            // throwing/dropping the submit, but bound the retries so we never loop forever if the composer is truly gone.
            if (attemptsLeft <= 0) {
                // We never got the composer back, so the attachment can't be sent. Drop the pending file so a
                // future send in this same provider doesn't piggyback the stale attachment onto an unrelated message.
                attachmentFileRef.current = null;
                Log.hmmm('[ComposerProvider] Skipping clearComposer because composerRef.clearWorklet never re-attached');
                return;
            }
            requestAnimationFrame(() => tryClear(attemptsLeft - 1));
        };

        tryClear(CONST.COMPOSER.CLEAR_WORKLET_MAX_RETRIES);
    };

    const setComposerRef = (ref: ComposerWithSuggestionsRef | null) => {
        composerRef.current = ref;
    };

    const composerState = {
        reportID,
        isFocused,
        isMenuVisible,
        isFullComposerAvailable,
        nativeID,
    };

    const composerEditState = {
        editingState,
        isEditingInComposer,
        editingReportID,
        editingReportActionID,
        editingReportAction,
        editingMessage,
        draftComment,
        effectiveDraft,
        currentEditMessageSelection,
        didResetComposerHeightWhileEditing,
    };

    const composerSendState = {
        isSendDisabled,
        debouncedCommentMaxLengthValidation,
        isExceedingMaxLength,
        exceededMaxLength,
        isBlockedFromConcierge,
        isTaskTitle,
    };

    const composerActions = {
        setText,
        setMenuVisibility,
        setIsFullComposerAvailable,
        setComposerRef,
        onBlur,
        onFocus,
        onAddActionPressed,
        onItemSelected,
        onTriggerAttachmentPicker,
        clearComposer,
        onLayout,
    };

    const composerEditActions = {
        publishDraft,
        deleteDraft,
        setDidResetComposerHeightWhileEditing,
    };

    const composerMeta = {
        containerRef,
        composerRef,
        suggestionsRef,
        actionButtonRef,
        isNextModalWillOpenRef,
        attachmentFileRef,
        textRef,
    };

    return (
        <ComposerTextContext.Provider value={text}>
            <ComposerStateContext.Provider value={composerState}>
                <ComposerSendStateContext.Provider value={composerSendState}>
                    <ComposerEditStateContext.Provider value={composerEditState}>
                        <ComposerActionsContext.Provider value={composerActions}>
                            <ComposerEditActionsContext.Provider value={composerEditActions}>
                                <ComposerMetaContext.Provider value={composerMeta}>{children}</ComposerMetaContext.Provider>
                            </ComposerEditActionsContext.Provider>
                        </ComposerActionsContext.Provider>
                    </ComposerEditStateContext.Provider>
                </ComposerSendStateContext.Provider>
            </ComposerStateContext.Provider>
        </ComposerTextContext.Provider>
    );
}

export default ComposerProvider;
