import {PortalHost} from '@gorhom/portal';
import lodashGet from 'lodash/get';
import type {SyntheticEvent} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {MeasureInWindowOnSuccessCallback, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {runOnJS, setNativeProps, useAnimatedRef} from 'react-native-reanimated';
import AttachmentModal from '@components/AttachmentModal';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import OfflineIndicator from '@components/OfflineIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import compose from '@libs/compose';
import getDraftComment from '@libs/ComposerUtils/getDraftComment';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getModalState from '@libs/getModalState';
import * as ReportUtils from '@libs/ReportUtils';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import ParticipantLocalTime from '@pages/home/report/ParticipantLocalTime';
import ReportDropUI from '@pages/home/report/ReportDropUI';
import ReportTypingIndicator from '@pages/home/report/ReportTypingIndicator';
import * as EmojiPickerActions from '@userActions/EmojiPickerAction';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import SendButton from './SendButton';

type ComposerRef = {
    blur: () => void;
    focus: (shouldDelay?: boolean) => void;
    replaceSelectionWithText: (text: string, shouldAddTrailSpace: boolean) => void;
    prepareCommentAndResetComposer: () => string;
    isFocused: () => boolean;
};

type SuggestionsRef = {
    resetSuggestions: () => void;
    onSelectionChange: (event: any) => void;
    triggerHotkeyActions: (event: any) => void;
    updateShouldShowSuggestionMenuToFalse: () => void;
    setShouldBlockSuggestionCalc: (shouldBlock: boolean) => void;
    getSuggestions: () => string[];
};

type ReportActionComposeOnyxProps = {
    /** The NVP describing a user's block status */
    blockedFromConcierge: OnyxEntry<OnyxTypes.BlockedFromConcierge>;

    /** Whether the composer input should be shown */
    shouldShowComposeInput: OnyxEntry<boolean>;
};

type ReportActionComposeProps = {
    /** A method to call when the form is submitted */
    onSubmit: (newComment: string | undefined) => void;

    /** The ID of the report actions will be created for */
    reportID: string;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Is composer full size */
    isComposerFullSize?: boolean;

    /** Whether user interactions should be disabled */
    disabled?: boolean;

    /** Height of the list which the composer is part of */
    listHeight?: number;

    /** Whether the composer input should be shown */
    shouldShowComposeInput?: boolean;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** /** Whetjer the report is ready for display */
    isReportReadyForDisplay?: boolean;
} & ReportActionComposeOnyxProps &
    WithCurrentUserPersonalDetailsProps;

// const defaultProps = {
//     report: {},
//     blockedFromConcierge: {},
//     preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
//     isComposerFullSize: false,
//     pendingAction: null,
//     shouldShowComposeInput: true,
//     listHeight: 0,
//     isReportReadyForDisplay: true,
//     ...withCurrentUserPersonalDetailsDefaultProps,
// };

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

function ReportActionCompose({
    blockedFromConcierge,
    currentUserPersonalDetails,
    disabled,
    isComposerFullSize,
    onSubmit,
    pendingAction,
    report,
    reportID,
    reportActions,
    listHeight,
    shouldShowComposeInput,
    isReportReadyForDisplay,
}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isMediumScreenWidth, isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const animatedRef = useAnimatedRef();
    const actionButtonRef = useRef(null);
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(() => {
        const initialModalState = getModalState();
        return shouldFocusInputOnScreenFocus && shouldShowComposeInput && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;
    });
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);

    // A flag to indicate whether the onScroll callback is likely triggered by a layout change (caused by text change) or not
    const isScrollLikelyLayoutTriggered = useRef(false);

    /**
     * Reset isScrollLikelyLayoutTriggered to false.
     *
     * The function is debounced with a handpicked wait time to address 2 issues:
     * 1. There is a slight delay between onChangeText and onScroll
     * 2. Layout change will trigger onScroll multiple times
     */
    const debouncedLowerIsScrollLikelyLayoutTriggered = useDebounce(
        useCallback(() => (isScrollLikelyLayoutTriggered.current = false), []),
        500,
    );

    const raiseIsScrollLikelyLayoutTriggered = useCallback(() => {
        isScrollLikelyLayoutTriggered.current = true;
        debouncedLowerIsScrollLikelyLayoutTriggered();
    }, [debouncedLowerIsScrollLikelyLayoutTriggered]);

    /**
     * Updates the should clear state of the composer
     */
    const [textInputShouldClear, setTextInputShouldClear] = useState(false);
    const [isCommentEmpty, setIsCommentEmpty] = useState(() => {
        const draftComment = getDraftComment(reportID);
        return !draftComment || !!draftComment.match(/^(\s)*$/);
    });

    /**
     * Updates the visibility state of the menu
     */
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     */
    const {hasExceededMaxCommentLength, validateCommentMaxLength} = useHandleExceedMaxCommentLength();

    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerRef>(null);

    const reportParticipantIDs = useMemo(
        () => report?.participantAccountIDs?.filter((accountID) => accountID !== currentUserPersonalDetails.accountID),
        [currentUserPersonalDetails.accountID, report],
    );

    const shouldShowReportRecipientLocalTime = useMemo(
        () => ReportUtils.canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize,
        [personalDetails, report, currentUserPersonalDetails.accountID, isComposerFullSize],
    );

    const isBlockedFromConcierge = useMemo(() => ReportUtils.chatIncludesConcierge(report) && User.isBlockedFromConcierge(blockedFromConcierge), [report, blockedFromConcierge]);

    // If we are on a small width device then don't show last 3 items from conciergePlaceholderOptions
    const conciergePlaceholderRandomIndex = useMemo(
        () => Math.floor(Math.random() * (translate('reportActionCompose.conciergePlaceholderOptions').length - (isSmallScreenWidth ? 4 : 1) + 1)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // Placeholder to display in the chat input.
    const inputPlaceholder = useMemo(() => {
        if (ReportUtils.chatIncludesConcierge(report)) {
            if (User.isBlockedFromConcierge(blockedFromConcierge)) {
                return translate('reportActionCompose.blockedFromConcierge');
            }

            return translate('reportActionCompose.conciergePlaceholderOptions')[conciergePlaceholderRandomIndex];
        }

        return translate('reportActionCompose.writeSomething');
    }, [report, blockedFromConcierge, translate, conciergePlaceholderRandomIndex]);

    const focus = () => {
        if (composerRef?.current === null) {
            return;
        }
        composerRef.current.focus(true);
    };

    const isKeyboardVisibleWhenShowingModalRef = useRef(false);
    const isNextModalWillOpenRef = useRef(false);
    const restoreKeyboardState = useCallback(() => {
        if (!isKeyboardVisibleWhenShowingModalRef.current || isNextModalWillOpenRef.current) {
            return;
        }
        focus();
        isKeyboardVisibleWhenShowingModalRef.current = false;
    }, []);

    const containerRef = useRef<View>(null);
    const measureContainer = useCallback(
        (callback: MeasureInWindowOnSuccessCallback) => {
            if (!containerRef.current) {
                return;
            }
            containerRef.current.measureInWindow(callback);
        },
        // We added isComposerFullSize in dependencies so that when this value changes, we recalculate the position of the popup
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isComposerFullSize],
    );

    const onAddActionPressed = useCallback(() => {
        if (!willBlurTextInputOnTapOutside) {
            isKeyboardVisibleWhenShowingModalRef.current = !!composerRef.current?.isFocused();
        }
        composerRef.current?.blur();
    }, []);

    const onItemSelected = useCallback(() => {
        isKeyboardVisibleWhenShowingModalRef.current = false;
    }, []);

    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, []);

    const addAttachment = useCallback(
        (file: File) => {
            const newComment = composerRef.current?.prepareCommentAndResetComposer();
            Report.addAttachment(reportID, file, newComment);
            setTextInputShouldClear(false);
        },
        [reportID],
    );

    /**
     * Event handler to update the state after the attachment preview is closed.
     */
    const onAttachmentPreviewClose = useCallback(() => {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
        restoreKeyboardState();
    }, [updateShouldShowSuggestionMenuToFalse, restoreKeyboardState]);

    /**
     * Add a new comment to this chat
     */
    const submitForm = useCallback(
        (e?: SyntheticEvent) => {
            if (e) {
                e.preventDefault();
            }

            const newComment = composerRef.current?.prepareCommentAndResetComposer();
            if (!newComment) {
                return;
            }

            onSubmit(newComment);
        },
        [onSubmit],
    );

    const onTriggerAttachmentPicker = useCallback(() => {
        isNextModalWillOpenRef.current = true;
        isKeyboardVisibleWhenShowingModalRef.current = true;
    }, []);

    const onBlur = useCallback((e) => {
        setIsFocused(false);
        if (suggestionsRef.current) {
            suggestionsRef.current.resetSuggestions();
        }
        if (e.relatedTarget && e.relatedTarget === actionButtonRef.current) {
            isKeyboardVisibleWhenShowingModalRef.current = true;
        }
    }, []);

    const onFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    // resets the composer to normal size when
    // the send button is pressed.
    const resetFullComposerSize = useCallback(() => {
        if (isComposerFullSize) {
            Report.setIsComposerFullSize(reportID, false);
        }
        setIsFullComposerAvailable(false);
    }, [isComposerFullSize, reportID]);

    // We are returning a callback here as we want to incoke the method on unmount only
    useEffect(
        () => () => {
            if (!EmojiPickerActions.isActive(report?.reportID ?? '')) {
                return;
            }
            EmojiPickerActions.hideEmojiPicker();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const reportRecipientAcountIDs = ReportUtils.getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails[reportRecipientAcountIDs[0]];
    const shouldUseFocusedColor = !isBlockedFromConcierge && !disabled && isFocused;

    const hasReportRecipient = _.isObject(reportRecipient) && !_.isEmpty(reportRecipient);

    const isSendDisabled = isCommentEmpty || isBlockedFromConcierge || !!disabled || hasExceededMaxCommentLength;

    const handleSendMessage = useCallback(() => {
        'worklet';

        if (isSendDisabled || !isReportReadyForDisplay) {
            return;
        }

        // We are setting the isCommentEmpty flag to true so the status of it will be in sync of the native text input state
        runOnJS(setIsCommentEmpty)(true);
        runOnJS(resetFullComposerSize)();
        setNativeProps(animatedRef, {text: ''}); // clears native text input on the UI thread
        runOnJS(submitForm)();
    }, [isSendDisabled, resetFullComposerSize, submitForm, animatedRef, isReportReadyForDisplay]);

    return (
        <View style={[shouldShowReportRecipientLocalTime && !isOffline && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <OfflineWithFeedback pendingAction={pendingAction}>
                {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime participant={reportRecipient} />}
            </OfflineWithFeedback>
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <PortalHost name="suggestions" />
                <OfflineWithFeedback
                    pendingAction={pendingAction}
                    style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                    contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
                >
                    <View
                        ref={containerRef}
                        style={[
                            shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                            styles.flexRow,
                            styles.chatItemComposeBox,
                            isComposerFullSize && styles.chatItemFullComposeBox,
                            hasExceededMaxCommentLength && styles.borderColorDanger,
                        ]}
                    >
                        {/* @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript. */}
                        <AttachmentModal
                            headerTitle={translate('reportActionCompose.sendAttachment')}
                            onConfirm={addAttachment}
                            onModalShow={() => setIsAttachmentPreviewActive(true)}
                            onModalHide={onAttachmentPreviewClose}
                        >
                            {/* @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript. */}
                            {({displayFileInModal}) => (
                                <>
                                    <AttachmentPickerWithMenuItems
                                        displayFileInModal={displayFileInModal}
                                        reportID={reportID}
                                        report={report}
                                        reportParticipantIDs={reportParticipantIDs}
                                        isFullComposerAvailable={isFullComposerAvailable}
                                        isComposerFullSize={isComposerFullSize}
                                        isBlockedFromConcierge={isBlockedFromConcierge}
                                        disabled={disabled}
                                        setMenuVisibility={setMenuVisibility}
                                        isMenuVisible={isMenuVisible}
                                        onTriggerAttachmentPicker={onTriggerAttachmentPicker}
                                        raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLikelyLayoutTriggered}
                                        onCanceledAttachmentPicker={() => {
                                            isNextModalWillOpenRef.current = false;
                                            restoreKeyboardState();
                                        }}
                                        onMenuClosed={restoreKeyboardState}
                                        onAddActionPressed={onAddActionPressed}
                                        onItemSelected={onItemSelected}
                                        actionButtonRef={actionButtonRef}
                                    />
                                    <ComposerWithSuggestions
                                        ref={composerRef}
                                        // @ts-expect-error TODO: Remove this once ComposerWithSuggestions is migrated to TypeScript.
                                        animatedRef={animatedRef}
                                        suggestionsRef={suggestionsRef}
                                        isNextModalWillOpenRef={isNextModalWillOpenRef}
                                        isScrollLikelyLayoutTriggered={isScrollLikelyLayoutTriggered}
                                        raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLikelyLayoutTriggered}
                                        reportID={reportID}
                                        report={report}
                                        reportActions={reportActions}
                                        isMenuVisible={isMenuVisible}
                                        inputPlaceholder={inputPlaceholder}
                                        isComposerFullSize={isComposerFullSize}
                                        displayFileInModal={displayFileInModal}
                                        textInputShouldClear={textInputShouldClear}
                                        setTextInputShouldClear={setTextInputShouldClear}
                                        isBlockedFromConcierge={isBlockedFromConcierge}
                                        disabled={disabled}
                                        isFullComposerAvailable={isFullComposerAvailable}
                                        setIsFullComposerAvailable={setIsFullComposerAvailable}
                                        setIsCommentEmpty={setIsCommentEmpty}
                                        handleSendMessage={handleSendMessage}
                                        shouldShowComposeInput={shouldShowComposeInput}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                        measureParentContainer={measureContainer}
                                        listHeight={listHeight}
                                        onValueChange={validateCommentMaxLength}
                                    />
                                    <ReportDropUI
                                        onDrop={(e) => {
                                            if (isAttachmentPreviewActive) {
                                                return;
                                            }
                                            const data = lodashGet(e, ['dataTransfer', 'items', 0]);
                                            displayFileInModal(data);
                                        }}
                                    />
                                </>
                            )}
                        </AttachmentModal>
                        {DeviceCapabilities.canUseTouchScreen() && isMediumScreenWidth ? null : (
                            <EmojiPickerButton
                                isDisabled={isBlockedFromConcierge || disabled}
                                onModalHide={focus}
                                //  @ts-expect-error TODO: Remove this once EmojiPickerButton is migrated to TypeScript.
                                onEmojiSelected={(...args) => composerRef.current?.replaceSelectionWithText(...args)}
                                emojiPickerID={report?.reportID}
                            />
                        )}
                        <SendButton
                            isDisabled={isSendDisabled}
                            handleSendMessage={handleSendMessage}
                        />
                    </View>
                    <View
                        style={[
                            styles.flexRow,
                            styles.justifyContentBetween,
                            styles.alignItemsCenter,
                            (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow,
                        ]}
                    >
                        {!isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                        <ReportTypingIndicator reportID={reportID} />
                        {hasExceededMaxCommentLength && <ExceededCommentLength />}
                    </View>
                </OfflineWithFeedback>
            </View>
        </View>
    );
}

ReportActionCompose.displayName = 'ReportActionCompose';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
        shouldShowComposeInput: {
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
        },
    }),
)(ReportActionCompose);
