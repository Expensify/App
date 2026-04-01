import lodashDebounce from 'lodash/debounce';
import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useHandleExceedMaxTaskTitleLength from '@hooks/useHandleExceedMaxTaskTitleLength';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {setIsComposerFullSize} from '@userActions/Report';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {ComposerActionsContext, ComposerDataActionsContext, ComposerDataContext, ComposerSendStateContext, ComposerStateContext, ComposerValueContext} from './ComposerContext';
import type {SuggestionsRef} from './ComposerContext';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';
import useComposerFocus from './useComposerFocus';
import useComposerSubmit from './useComposerSubmit';
import useShouldAddOrReplaceReceipt from './useShouldAddOrReplaceReceipt';

const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

type ComposerProviderProps = {
    reportID: string;
    children: React.ReactNode;
};

function ComposerProvider({children, reportID}: ComposerProviderProps) {
    const {isOffline} = useNetwork();
    const {shouldAddOrReplaceReceipt, transactionID} = useShouldAddOrReplaceReceipt(reportID, isOffline);
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [initialModalState] = useOnyx(ONYXKEYS.MODAL);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const shouldFocusComposerOnScreenFocus = shouldFocusInputOnScreenFocus || !!draftComment;

    const [isFocused, setIsFocused] = useState(() => {
        return shouldFocusComposerOnScreenFocus && shouldShowComposeInput && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;
    });

    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const [value, setValue] = useState(() => {
        return draftComment ?? '';
    });

    const isEmpty = !value || !!value.match(CONST.REGEX.EMPTY_COMMENT);

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);
    const isBlockedFromConcierge = includesConcierge && userBlockedFromConcierge;

    const {hasExceededMaxCommentLength, validateCommentMaxLength, setHasExceededMaxCommentLength} = useHandleExceedMaxCommentLength();
    const {hasExceededMaxTaskTitleLength, validateTaskTitleMaxLength, setHasExceededMaxTitleLength} = useHandleExceedMaxTaskTitleLength();

    const exceededMaxLength = (() => {
        if (hasExceededMaxTaskTitleLength) {
            return CONST.TITLE_CHARACTER_LIMIT;
        }
        if (hasExceededMaxCommentLength) {
            return CONST.MAX_COMMENT_LENGTH;
        }
        return null;
    })();

    const isSendDisabled = isEmpty || isBlockedFromConcierge || !!exceededMaxLength;

    const validateMaxLength = (v: string) => {
        const taskCommentMatch = v?.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
        if (taskCommentMatch) {
            const title = taskCommentMatch?.[3] ? taskCommentMatch[3].trim().replaceAll('\n', ' ') : '';
            setHasExceededMaxCommentLength(false);
            return validateTaskTitleMaxLength(title);
        }
        setHasExceededMaxTitleLength(false);
        return validateCommentMaxLength(v, {reportID});
    };

    const debouncedValidate = lodashDebounce(validateMaxLength, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME, {leading: true});

    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerRef | null>(null);
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);

    const composerRefShared = useSharedValue<Partial<ComposerRef>>({});

    const updateShouldShowSuggestionMenuToFalse = () => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    };

    const {onBlur, onFocus, focus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, isNextModalWillOpenRef} = useComposerFocus({
        composerRef,
        suggestionsRef,
        actionButtonRef,
        setIsFocused,
    });

    const {submitForm, addAttachment, onAttachmentPreviewClose} = useComposerSubmit({
        report,
        reportID,
        composerRefShared,
        updateShouldShowSuggestionMenuToFalse,
        setIsAttachmentPreviewActive,
    });

    const {validateAttachments, onReceiptDropped, PDFValidationComponent, ErrorModal} = useAttachmentUploadValidation({
        reportID,
        report,
        addAttachment,
        onAttachmentPreviewClose,
        exceededMaxLength,
        shouldAddOrReplaceReceipt,
        transactionID,
        isAttachmentPreviewActive,
        setIsAttachmentPreviewActive,
    });

    const handleSendMessage = () => {
        if (isSendDisabled || !debouncedValidate.flush()) {
            return;
        }

        composerRef.current?.resetHeight();
        if (isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }

        scheduleOnUI(() => {
            const {clearWorklet} = composerRefShared.get();

            if (!clearWorklet) {
                throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
            }

            clearWorklet?.();
        });
    };

    const setComposerRef = (ref: ComposerRef | null) => {
        composerRef.current = ref;
        composerRefShared.set({
            clearWorklet: ref?.clearWorklet,
        });
    };

    const onValueChange = (v: string) => {
        if (v.length === 0 && isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }
        debouncedValidate(v);
    };

    const composerState = {
        isFocused,
        isFullComposerAvailable,
        isComposerFullSize,
        isMenuVisible,
    };

    const composerSendState = {
        isEmpty,
        exceededMaxLength,
        isSendDisabled,
        isBlockedFromConcierge,
        hasExceededMaxTaskTitleLength,
    };

    const composerActions = {
        setIsFocused,
        setIsFullComposerAvailable,
        setMenuVisibility,
        setValue,
        handleSendMessage,
        focus,
        onValueChange,
        validateMaxLength,
        debouncedValidate,
    };

    const composerInternalsData = {
        composerRef,
        suggestionsRef,
        actionButtonRef,
        isNextModalWillOpenRef,
        shouldFocusComposerOnScreenFocus,
        shouldShowComposeInput,
        isAttachmentPreviewActive,
        userBlockedFromConcierge,
        PDFValidationComponent,
        ErrorModal,
    };

    const composerInternalsActions = {
        setComposerRef,
        onBlur,
        onFocus,
        onAddActionPressed,
        onItemSelected,
        onTriggerAttachmentPicker,
        submitForm,
        addAttachment,
        onAttachmentPreviewClose,
        setIsAttachmentPreviewActive,
        onReceiptDropped,
        validateAttachments,
    };

    return (
        <ComposerValueContext.Provider value={value}>
            <ComposerStateContext.Provider value={composerState}>
                <ComposerSendStateContext.Provider value={composerSendState}>
                    <ComposerActionsContext.Provider value={composerActions}>
                        <ComposerDataContext.Provider value={composerInternalsData}>
                            <ComposerDataActionsContext.Provider value={composerInternalsActions}>{children}</ComposerDataActionsContext.Provider>
                        </ComposerDataContext.Provider>
                    </ComposerActionsContext.Provider>
                </ComposerSendStateContext.Provider>
            </ComposerStateContext.Provider>
        </ComposerValueContext.Provider>
    );
}

export default ComposerProvider;
export type {ComposerProviderProps};
