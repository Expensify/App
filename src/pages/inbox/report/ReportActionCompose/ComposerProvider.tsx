import lodashDebounce from 'lodash/debounce';
import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useHandleExceedMaxTaskTitleLength from '@hooks/useHandleExceedMaxTaskTitleLength';
import useOnyx from '@hooks/useOnyx';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {setIsComposerFullSize} from '@userActions/Report';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import {ComposerActionsContext, ComposerMetaContext, ComposerSendActionsContext, ComposerSendStateContext, ComposerStateContext, ComposerTextContext} from './ComposerContext';
import type {SuggestionsRef} from './ComposerContext';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import useComposerFocus from './useComposerFocus';

const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

type ComposerProviderProps = {
    reportID: string;
    children: React.ReactNode;
};

function ComposerProvider({children, reportID}: ComposerProviderProps) {
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [initialModalState] = useOnyx(ONYXKEYS.MODAL);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const shouldFocusComposerOnScreenFocus = shouldFocusInputOnScreenFocus || !!draftComment;

    const initialFocused = shouldFocusComposerOnScreenFocus && shouldShowComposeInput && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;

    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);
    const [isMenuVisible, setMenuVisibility] = useState(false);

    const [text, setText] = useState(() => {
        return draftComment ?? '';
    });

    const isEmpty = !text || !!text.match(CONST.REGEX.EMPTY_COMMENT);

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);
    const isBlockedFromConcierge = includesConcierge && userBlockedFromConcierge;

    const {hasExceededMaxCommentLength, validateCommentMaxLength, setHasExceededMaxCommentLength} = useHandleExceedMaxCommentLength();
    const {hasExceededMaxTaskTitleLength, validateTaskTitleMaxLength, setHasExceededMaxTitleLength} = useHandleExceedMaxTaskTitleLength();

    let exceededMaxLength: number | null = null;
    if (hasExceededMaxTaskTitleLength) {
        exceededMaxLength = CONST.TITLE_CHARACTER_LIMIT;
    } else if (hasExceededMaxCommentLength) {
        exceededMaxLength = CONST.MAX_COMMENT_LENGTH;
    }

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

    const containerRef = useRef<View>(null);
    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerRef | null>(null);
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const attachmentFileRef = useRef<FileObject | FileObject[] | null>(null);

    const composerRefShared = useSharedValue<Partial<ComposerRef>>({});

    const {isFocused, onBlur, onFocus, focus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, isNextModalWillOpenRef} = useComposerFocus({
        composerRef,
        suggestionsRef,
        actionButtonRef,
        initialFocused,
    });

    const clearComposer = () => {
        const clearWorklet = composerRefShared.get().clearWorklet;
        if (!clearWorklet) {
            throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
        }
        scheduleOnUI(clearWorklet);
    };

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
        setText(v);
        if (v.length === 0 && isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }
        debouncedValidate(v);
    };

    const composerState = {
        isFocused,
        isMenuVisible,
        isFullComposerAvailable,
    };

    const composerSendState = {
        isSendDisabled,
        exceededMaxLength,
        hasExceededMaxTaskTitleLength,
        isBlockedFromConcierge,
    };

    const composerActions = {
        setText,
        setMenuVisibility,
        setIsFullComposerAvailable,
        setComposerRef,
        focus,
        onBlur,
        onFocus,
        onAddActionPressed,
        onItemSelected,
        onTriggerAttachmentPicker,
        clearComposer,
    };

    const composerSendActions = {
        handleSendMessage,
        onValueChange,
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
                    <ComposerActionsContext.Provider value={composerActions}>
                        <ComposerSendActionsContext.Provider value={composerSendActions}>
                            <ComposerMetaContext.Provider value={composerMeta}>{children}</ComposerMetaContext.Provider>
                        </ComposerSendActionsContext.Provider>
                    </ComposerActionsContext.Provider>
                </ComposerSendStateContext.Provider>
            </ComposerStateContext.Provider>
        </ComposerTextContext.Provider>
    );
}

export default ComposerProvider;
export type {ComposerProviderProps};
