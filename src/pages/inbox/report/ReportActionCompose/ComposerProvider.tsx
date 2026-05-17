import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import {scheduleOnUI} from 'react-native-worklets';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {useReportActionActiveEdit} from '@pages/inbox/report/ReportActionEditMessageContext';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import {
    ComposerActionsContext,
    ComposerEditActionsContext,
    ComposerEditStateContext,
    ComposerMetaContext,
    ComposerSendStateContext,
    ComposerStateContext,
    ComposerTextContext,
} from './ComposerContext';
import type {SuggestionsRef} from './ComposerContext';
import type {ComposerWithSuggestionsRef} from './ComposerWithSuggestions';
import useComposerFocus from './useComposerFocus';
import useDebouncedCommentMaxLengthValidation from './useDebouncedCommentMaxLengthValidation';
import useEditMessage from './useEditMessage';

const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

type ComposerProviderProps = {
    reportID: string;
    children: React.ReactNode;
};

function ComposerProvider({children, reportID}: ComposerProviderProps) {
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
    const [text, setText] = useState(() => {
        return draftComment ?? '';
    });

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
        const clearWorklet = composerRef.current?.clearWorklet;
        if (!clearWorklet) {
            throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
        }
        scheduleOnUI(clearWorklet);
    };

    const setComposerRef = (ref: ComposerWithSuggestionsRef | null) => {
        composerRef.current = ref;
    };

    const composerState = {
        isFocused,
        isMenuVisible,
        isFullComposerAvailable,
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
