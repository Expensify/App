import {useNavigation} from '@react-navigation/native';
import noop from 'lodash/noop';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {MeasureInWindowOnSuccessCallback, NativeSyntheticEvent, TextInputFocusEventData, TextInputSelectionChangeEventData} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {runOnUI, useSharedValue} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentModal from '@components/AttachmentModal';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {Mention} from '@components/MentionSuggestions';
import OfflineIndicator from '@components/OfflineIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {getDraftComment} from '@libs/DraftCommentUtils';
import getModalState from '@libs/getModalState';
import Performance from '@libs/Performance';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import ParticipantLocalTime from '@pages/home/report/ParticipantLocalTime';
import ReportDropUI from '@pages/home/report/ReportDropUI';
import ReportTypingIndicator from '@pages/home/report/ReportTypingIndicator';
import variables from '@styles/variables';
import * as EmojiPickerActions from '@userActions/EmojiPickerAction';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerWithSuggestionsProps} from './ComposerWithSuggestions/ComposerWithSuggestions';
import SendButton from './SendButton';

type ComposerRef = {
    blur: () => void;
    focus: (shouldDelay?: boolean) => void;
    replaceSelectionWithText: EmojiPickerActions.OnEmojiSelected;
    getCurrentText: () => string;
    isFocused: () => boolean;
    /**
     * Calling clear will immediately clear the input on the UI thread (its a worklet).
     * Once the composer ahs cleared onCleared will be called with the value that was cleared.
     */
    clear: () => void;
};

type SuggestionsRef = {
    resetSuggestions: () => void;
    onSelectionChange?: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
    triggerHotkeyActions: (event: KeyboardEvent) => boolean | undefined;
    updateShouldShowSuggestionMenuToFalse: (shouldShowSuggestionMenu?: boolean) => void;
    setShouldBlockSuggestionCalc: (shouldBlock: boolean) => void;
    getSuggestions: () => Mention[] | Emoji[];
    getIsSuggestionsMenuVisible: () => boolean;
};

type ReportActionComposeOnyxProps = {
    /** The NVP describing a user's block status */
    blockedFromConcierge: OnyxEntry<OnyxTypes.BlockedFromConcierge>;

    /** Whether the composer input should be shown */
    shouldShowComposeInput: OnyxEntry<boolean>;
};

type ReportActionComposeProps = ReportActionComposeOnyxProps &
    WithCurrentUserPersonalDetailsProps &
    Pick<ComposerWithSuggestionsProps, 'reportID' | 'isEmptyChat' | 'isComposerFullSize' | 'lastReportAction'> & {
        /** A method to call when the form is submitted */
        onSubmit: (newComment: string) => void;

        /** The report currently being looked at */
        report: OnyxEntry<OnyxTypes.Report>;

        /** The type of action that's pending  */
        pendingAction?: OnyxCommon.PendingAction;

        /** Whether the report is ready for display */
        isReportReadyForDisplay?: boolean;

        /** A method to call when the input is focus */
        onComposerFocus?: () => void;

        /** A method to call when the input is blur */
        onComposerBlur?: () => void;

        /** Should the input be disabled  */
        disabled?: boolean;

        /** Should show educational tooltip */
        shouldShowEducationalTooltip?: boolean;
    };

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// eslint-disable-next-line import/no-mutable-exports
let onSubmitAction = noop;

function ReportActionCompose({
    blockedFromConcierge,
    currentUserPersonalDetails,
    disabled = false,
    isComposerFullSize = false,
    onSubmit,
    pendingAction,
    report,
    reportID,
    shouldShowComposeInput = true,
    isReportReadyForDisplay = true,
    isEmptyChat,
    lastReportAction,
    shouldShowEducationalTooltip,
    onComposerFocus,
    onComposerBlur,
}: ReportActionComposeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth, isMediumScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const navigation = useNavigation();

    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(() => {
        const initialModalState = getModalState();
        return shouldFocusInputOnScreenFocus && shouldShowComposeInput && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;
    });
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);
    const [shouldHideEducationalTooltip, setShouldHideEducationalTooltip] = useState(false);

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

    const [isCommentEmpty, setIsCommentEmpty] = useState(() => {
        const draftComment = getDraftComment(reportID);
        return !draftComment || !!draftComment.match(CONST.REGEX.EMPTY_COMMENT);
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
    const composerRef = useRef<ComposerRef>();
    const reportParticipantIDs = useMemo(
        () =>
            Object.keys(report?.participants ?? {})
                .map(Number)
                .filter((accountID) => accountID !== currentUserPersonalDetails.accountID),
        [currentUserPersonalDetails.accountID, report?.participants],
    );

    const shouldShowReportRecipientLocalTime = useMemo(
        () => ReportUtils.canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize,
        [personalDetails, report, currentUserPersonalDetails.accountID, isComposerFullSize],
    );

    const includesConcierge = useMemo(() => ReportUtils.chatIncludesConcierge({participants: report?.participants}), [report?.participants]);
    const userBlockedFromConcierge = useMemo(() => User.isBlockedFromConcierge(blockedFromConcierge), [blockedFromConcierge]);
    const isBlockedFromConcierge = useMemo(() => includesConcierge && userBlockedFromConcierge, [includesConcierge, userBlockedFromConcierge]);

    // If we are on a small width device then don't show last 3 items from conciergePlaceholderOptions
    const conciergePlaceholderRandomIndex = useMemo(
        () => Math.floor(Math.random() * (translate('reportActionCompose.conciergePlaceholderOptions').length - (shouldUseNarrowLayout ? 4 : 1) + 1)),
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    // Placeholder to display in the chat input.
    const inputPlaceholder = useMemo(() => {
        if (includesConcierge) {
            if (userBlockedFromConcierge) {
                return translate('reportActionCompose.blockedFromConcierge');
            }

            return translate('reportActionCompose.conciergePlaceholderOptions')[conciergePlaceholderRandomIndex];
        }

        return translate('reportActionCompose.writeSomething');
    }, [includesConcierge, translate, userBlockedFromConcierge, conciergePlaceholderRandomIndex]);

    const focus = () => {
        if (composerRef.current === null) {
            return;
        }
        composerRef.current?.focus(true);
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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

    const attachmentFileRef = useRef<FileObject | null>(null);
    const addAttachment = useCallback((file: FileObject) => {
        attachmentFileRef.current = file;
        const clear = composerRef.current?.clear;
        if (!clear) {
            throw new Error('The composerRef.clear function is not set yet. This should never happen, and indicates a developer error.');
        }

        runOnUI(clear)();
    }, []);

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
        (newComment: string) => {
            playSound(SOUNDS.DONE);

            const newCommentTrimmed = newComment.trim();

            if (attachmentFileRef.current) {
                Report.addAttachment(reportID, attachmentFileRef.current, newCommentTrimmed);
                attachmentFileRef.current = null;
            } else {
                Performance.markStart(CONST.TIMING.MESSAGE_SENT, {message: newCommentTrimmed});
                onSubmit(newCommentTrimmed);
            }
        },
        [onSubmit, reportID],
    );

    const onTriggerAttachmentPicker = useCallback(() => {
        isNextModalWillOpenRef.current = true;
        isKeyboardVisibleWhenShowingModalRef.current = true;
    }, []);

    const onBlur = useCallback(
        (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
            const webEvent = event as unknown as FocusEvent;
            setIsFocused(false);
            onComposerBlur?.();
            if (suggestionsRef.current) {
                suggestionsRef.current.resetSuggestions();
            }
            if (webEvent.relatedTarget && webEvent.relatedTarget === actionButtonRef.current) {
                isKeyboardVisibleWhenShowingModalRef.current = true;
            }
        },
        [onComposerBlur],
    );

    const onFocus = useCallback(() => {
        setIsFocused(true);
        onComposerFocus?.();
    }, [onComposerFocus]);

    // We are returning a callback here as we want to incoke the method on unmount only
    useEffect(
        () => () => {
            if (!EmojiPickerActions.isActive(report?.reportID ?? '-1')) {
                return;
            }
            EmojiPickerActions.hideEmojiPicker();
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setShouldHideEducationalTooltip(true);
        });
        return unsubscribe;
    }, [navigation]);

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to mention other reports they are members of, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = useMemo(() => !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE, [report]);
    const reportRecipientAcountIDs = ReportUtils.getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails[reportRecipientAcountIDs[0]];
    const shouldUseFocusedColor = !isBlockedFromConcierge && !disabled && isFocused;

    const hasReportRecipient = !isEmptyObject(reportRecipient);

    const isSendDisabled = isCommentEmpty || isBlockedFromConcierge || !!disabled || hasExceededMaxCommentLength;

    // Note: using JS refs is not well supported in reanimated, thus we need to store the function in a shared value
    // useSharedValue on web doesn't support functions, so we need to wrap it in an object.
    const composerRefShared = useSharedValue<{
        clear: (() => void) | undefined;
    }>({clear: undefined});
    const handleSendMessage = useCallback(() => {
        'worklet';

        const clearComposer = composerRefShared.value.clear;
        if (!clearComposer) {
            throw new Error('The composerRefShared.clear function is not set yet. This should never happen, and indicates a developer error.');
        }

        if (isSendDisabled || !isReportReadyForDisplay) {
            return;
        }

        // This will cause onCleared to be triggered where we actually send the message
        clearComposer();
    }, [isSendDisabled, isReportReadyForDisplay, composerRefShared]);

    // eslint-disable-next-line react-compiler/react-compiler
    onSubmitAction = handleSendMessage;

    const emojiShiftVertical = useMemo(() => {
        const chatItemComposeSecondaryRowHeight = styles.chatItemComposeSecondaryRow.height + styles.chatItemComposeSecondaryRow.marginTop + styles.chatItemComposeSecondaryRow.marginBottom;
        const reportActionComposeHeight = styles.chatItemComposeBox.minHeight + chatItemComposeSecondaryRowHeight;
        const emojiOffsetWithComposeBox = (styles.chatItemComposeBox.minHeight - styles.chatItemEmojiButton.height) / 2;
        return reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;
    }, [styles]);

    const renderWorkspaceChatTooltip = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter, styles.gap1]}>
                <Icon
                    src={Expensicons.Lightbulb}
                    fill={theme.tooltipHighlightText}
                    medium
                />
                <Text>
                    <Text style={styles.quickActionTooltipTitle}>{translate('reportActionCompose.tooltip.title')}</Text>
                    <Text style={styles.quickActionTooltipSubtitle}>{translate('reportActionCompose.tooltip.subtitle')}</Text>
                </Text>
            </View>
        ),
        [
            styles.alignItemsCenter,
            styles.flexRow,
            styles.justifyContentCenter,
            styles.flexWrap,
            styles.textAlignCenter,
            styles.gap1,
            styles.quickActionTooltipTitle,
            styles.quickActionTooltipSubtitle,
            theme.tooltipHighlightText,
            translate,
        ],
    );

    return (
        <View style={[shouldShowReportRecipientLocalTime && !isOffline && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <OfflineWithFeedback pendingAction={pendingAction}>
                {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime participant={reportRecipient} />}
            </OfflineWithFeedback>
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <OfflineWithFeedback
                    shouldDisableOpacity
                    pendingAction={pendingAction}
                    style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                    contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
                >
                    <EducationalTooltip
                        shouldRender={!shouldHideEducationalTooltip && shouldShowEducationalTooltip}
                        renderTooltipContent={renderWorkspaceChatTooltip}
                        shouldUseOverlay
                        onPressOverlay={() => User.dismissWorkspaceTooltip()}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                        wrapperStyle={styles.reportActionComposeTooltipWrapper}
                        shiftHorizontal={variables.composerTooltipShiftHorizontal}
                        shiftVertical={variables.composerTooltipShiftVertical}
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
                            <AttachmentModal
                                headerTitle={translate('reportActionCompose.sendAttachment')}
                                onConfirm={addAttachment}
                                onModalShow={() => setIsAttachmentPreviewActive(true)}
                                onModalHide={onAttachmentPreviewClose}
                            >
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
                                            disabled={!!disabled}
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
                                            ref={(ref) => {
                                                composerRef.current = ref ?? undefined;
                                                // eslint-disable-next-line react-compiler/react-compiler
                                                composerRefShared.value = {
                                                    clear: ref?.clear,
                                                };
                                            }}
                                            suggestionsRef={suggestionsRef}
                                            isNextModalWillOpenRef={isNextModalWillOpenRef}
                                            isScrollLikelyLayoutTriggered={isScrollLikelyLayoutTriggered}
                                            raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLikelyLayoutTriggered}
                                            reportID={reportID}
                                            policyID={report?.policyID ?? '-1'}
                                            parentReportID={report?.parentReportID}
                                            parentReportActionID={report?.parentReportActionID}
                                            includeChronos={ReportUtils.chatIncludesChronos(report)}
                                            isGroupPolicyReport={isGroupPolicyReport}
                                            isEmptyChat={isEmptyChat}
                                            lastReportAction={lastReportAction}
                                            isMenuVisible={isMenuVisible}
                                            inputPlaceholder={inputPlaceholder}
                                            isComposerFullSize={isComposerFullSize}
                                            displayFileInModal={displayFileInModal}
                                            onCleared={submitForm}
                                            isBlockedFromConcierge={isBlockedFromConcierge}
                                            disabled={!!disabled}
                                            isFullComposerAvailable={isFullComposerAvailable}
                                            setIsFullComposerAvailable={setIsFullComposerAvailable}
                                            setIsCommentEmpty={setIsCommentEmpty}
                                            handleSendMessage={handleSendMessage}
                                            shouldShowComposeInput={shouldShowComposeInput}
                                            onFocus={onFocus}
                                            onBlur={onBlur}
                                            measureParentContainer={measureContainer}
                                            onValueChange={(value) => {
                                                if (value.length === 0 && isComposerFullSize) {
                                                    Report.setIsComposerFullSize(reportID, false);
                                                }
                                                validateCommentMaxLength(value, {reportID});
                                            }}
                                        />
                                        <ReportDropUI
                                            onDrop={(event: DragEvent) => {
                                                if (isAttachmentPreviewActive) {
                                                    return;
                                                }
                                                const data = event.dataTransfer?.files[0];
                                                if (data) {
                                                    data.uri = URL.createObjectURL(data);
                                                    displayFileInModal(data);
                                                }
                                            }}
                                        />
                                    </>
                                )}
                            </AttachmentModal>
                            {DeviceCapabilities.canUseTouchScreen() && isMediumScreenWidth ? null : (
                                <EmojiPickerButton
                                    isDisabled={isBlockedFromConcierge || disabled}
                                    onModalHide={(isNavigating) => {
                                        if (isNavigating) {
                                            return;
                                        }
                                        focus();
                                    }}
                                    onEmojiSelected={(...args) => composerRef.current?.replaceSelectionWithText(...args)}
                                    emojiPickerID={report?.reportID}
                                    shiftVertical={emojiShiftVertical}
                                />
                            )}
                            <SendButton
                                isDisabled={isSendDisabled}
                                handleSendMessage={handleSendMessage}
                            />
                        </View>
                    </EducationalTooltip>
                    <View
                        style={[
                            styles.flexRow,
                            styles.justifyContentBetween,
                            styles.alignItemsCenter,
                            (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow,
                        ]}
                    >
                        {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                        <ReportTypingIndicator reportID={reportID} />
                        {hasExceededMaxCommentLength && <ExceededCommentLength />}
                    </View>
                </OfflineWithFeedback>
            </View>
        </View>
    );
}

ReportActionCompose.displayName = 'ReportActionCompose';

export default withCurrentUserPersonalDetails(
    withOnyx<ReportActionComposeProps, ReportActionComposeOnyxProps>({
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
        shouldShowComposeInput: {
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
        },
    })(memo(ReportActionCompose)),
);
export {onSubmitAction};
export type {SuggestionsRef, ComposerRef};
