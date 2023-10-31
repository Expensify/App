import {PortalHost} from '@gorhom/portal';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {runOnJS, useAnimatedRef} from 'react-native-reanimated';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import OfflineIndicator from '@components/OfflineIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {withNetwork} from '@components/OnyxProvider';
import participantPropTypes from '@components/participantPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import compose from '@libs/compose';
import getDraftComment from '@libs/ComposerUtils/getDraftComment';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getModalState from '@libs/getModalState';
import * as ReportUtils from '@libs/ReportUtils';
import updatePropsPaperWorklet from '@libs/updatePropsPaperWorklet';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import ParticipantLocalTime from '@pages/home/report/ParticipantLocalTime';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import ReportDropUI from '@pages/home/report/ReportDropUI';
import ReportTypingIndicator from '@pages/home/report/ReportTypingIndicator';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as EmojiPickerActions from '@userActions/EmojiPickerAction';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import SendButton from './SendButton';

const propTypes = {
    /** A method to call when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** The ID of the report actions will be created for */
    reportID: PropTypes.string.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Is composer full size */
    isComposerFullSize: PropTypes.bool,

    /** Whether user interactions should be disabled */
    disabled: PropTypes.bool,

    /** Height of the list which the composer is part of */
    listHeight: PropTypes.number,

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),

    /** Whether the composer input should be shown */
    shouldShowComposeInput: PropTypes.bool,

    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** /** Whetjer the report is ready for display */
    isReportReadyForDisplay: PropTypes.bool,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    report: {},
    blockedFromConcierge: {},
    personalDetails: {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    isComposerFullSize: false,
    pendingAction: null,
    shouldShowComposeInput: true,
    listHeight: 0,
    isReportReadyForDisplay: true,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

function ReportActionCompose({
    blockedFromConcierge,
    currentUserPersonalDetails,
    disabled,
    isComposerFullSize,
    network,
    onSubmit,
    pendingAction,
    personalDetails,
    report,
    reportID,
    reportActions,
    listHeight,
    shouldShowComposeInput,
    isReportReadyForDisplay,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isMediumScreenWidth, isSmallScreenWidth} = useWindowDimensions();
    const animatedRef = useAnimatedRef();
    const actionButtonRef = useRef(null);

    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(() => {
        const initialModalState = getModalState();
        return shouldFocusInputOnScreenFocus && shouldShowComposeInput && !initialModalState.isVisible && !initialModalState.willAlertModalBecomeVisible;
    });
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);

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
    const [hasExceededMaxCommentLength, setExceededMaxCommentLength] = useState(false);

    const suggestionsRef = useRef(null);
    const composerRef = useRef(null);

    const reportParticipantIDs = useMemo(
        () => _.without(lodashGet(report, 'participantAccountIDs', []), currentUserPersonalDetails.accountID),
        [currentUserPersonalDetails.accountID, report],
    );

    const shouldShowReportRecipientLocalTime = useMemo(
        () => ReportUtils.canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize,
        [personalDetails, report, currentUserPersonalDetails.accountID, isComposerFullSize],
    );

    const isBlockedFromConcierge = useMemo(() => ReportUtils.chatIncludesConcierge(report) && User.isBlockedFromConcierge(blockedFromConcierge), [report, blockedFromConcierge]);

    // If we are on a small width device then don't show last 3 items from conciergePlaceholderOptions
    const conciergePlaceholderRandomIndex = useMemo(
        () => _.random(translate('reportActionCompose.conciergePlaceholderOptions').length - (isSmallScreenWidth ? 4 : 1)),
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
        if (composerRef === null || composerRef.current === null) {
            return;
        }
        composerRef.current.focus(true);
    };

    const isKeyboardVisibleWhenShowingModalRef = useRef(false);
    const restoreKeyboardState = useCallback(() => {
        if (!isKeyboardVisibleWhenShowingModalRef.current) {
            return;
        }
        focus();
        isKeyboardVisibleWhenShowingModalRef.current = false;
    }, []);

    const containerRef = useRef(null);
    const measureContainer = useCallback((callback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    }, []);

    const onAddActionPressed = useCallback(() => {
        if (!willBlurTextInputOnTapOutside) {
            isKeyboardVisibleWhenShowingModalRef.current = composerRef.current.isFocused();
        }
        composerRef.current.blur();
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

    /**
     * @param {Object} file
     */
    const addAttachment = useCallback(
        (file) => {
            const newComment = composerRef.current.prepareCommentAndResetComposer();
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
     *
     * @param {SyntheticEvent} [e]
     */
    const submitForm = useCallback(
        (e) => {
            if (e) {
                e.preventDefault();
            }

            const newComment = composerRef.current.prepareCommentAndResetComposer();
            if (!newComment) {
                return;
            }

            onSubmit(newComment);
        },
        [onSubmit],
    );

    const isNextModalWillOpenRef = useRef(false);
    const onTriggerAttachmentPicker = useCallback(() => {
        // Set a flag to block suggestion calculation until we're finished using the file picker,
        // which will stop any flickering as the file picker opens on non-native devices.
        if (willBlurTextInputOnTapOutside) {
            suggestionsRef.current.setShouldBlockSuggestionCalc(true);
        }
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
            if (!EmojiPickerActions.isActive(report.reportID)) {
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

    const isSendDisabled = isCommentEmpty || isBlockedFromConcierge || disabled || hasExceededMaxCommentLength;

    const handleSendMessage = useCallback(() => {
        'worklet';

        if (isSendDisabled || !isReportReadyForDisplay) {
            return;
        }

        const viewTag = animatedRef();
        const viewName = 'RCTMultilineTextInputView';
        const updates = {text: ''};
        // We are setting the isCommentEmpty flag to true so the status of it will be in sync of the native text input state
        runOnJS(setIsCommentEmpty)(true);
        runOnJS(resetFullComposerSize)();
        updatePropsPaperWorklet(viewTag, viewName, updates); // clears native text input on the UI thread
        runOnJS(submitForm)();
    }, [isSendDisabled, resetFullComposerSize, submitForm, animatedRef, isReportReadyForDisplay]);

    return (
        <View style={[shouldShowReportRecipientLocalTime && !lodashGet(network, 'isOffline') && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
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
                                        updateShouldShowSuggestionMenuToFalse={updateShouldShowSuggestionMenuToFalse}
                                        isBlockedFromConcierge={isBlockedFromConcierge}
                                        disabled={disabled}
                                        setMenuVisibility={setMenuVisibility}
                                        isMenuVisible={isMenuVisible}
                                        onTriggerAttachmentPicker={onTriggerAttachmentPicker}
                                        onCanceledAttachmentPicker={restoreKeyboardState}
                                        onMenuClosed={restoreKeyboardState}
                                        onAddActionPressed={onAddActionPressed}
                                        onItemSelected={onItemSelected}
                                        actionButtonRef={actionButtonRef}
                                    />
                                    <ComposerWithSuggestions
                                        ref={composerRef}
                                        animatedRef={animatedRef}
                                        suggestionsRef={suggestionsRef}
                                        isNextModalWillOpenRef={isNextModalWillOpenRef}
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
                                onEmojiSelected={(...args) => composerRef.current.replaceSelectionWithText(...args)}
                                emojiPickerID={report.reportID}
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
                            (!isSmallScreenWidth || (isSmallScreenWidth && !network.isOffline)) && styles.chatItemComposeSecondaryRow,
                        ]}
                    >
                        {!isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                        <ReportTypingIndicator reportID={reportID} />
                        <ExceededCommentLength
                            reportID={reportID}
                            onExceededMaxCommentLength={setExceededMaxCommentLength}
                        />
                    </View>
                </OfflineWithFeedback>
            </View>
        </View>
    );
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;
ReportActionCompose.displayName = 'ReportActionCompose';

export default compose(
    withNetwork(),
    withCurrentUserPersonalDetails,
    withOnyx({
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        shouldShowComposeInput: {
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
        },
    }),
)(ReportActionCompose);
