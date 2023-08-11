import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../../styles/styles';
import ONYXKEYS from '../../../../ONYXKEYS';
import * as Report from '../../../../libs/actions/Report';
import ReportTypingIndicator from '../ReportTypingIndicator';
import AttachmentModal from '../../../../components/AttachmentModal';
import compose from '../../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import willBlurTextInputOnTapOutsideFunc from '../../../../libs/willBlurTextInputOnTapOutside';
import canFocusInputOnScreenFocus from '../../../../libs/canFocusInputOnScreenFocus';
import CONST from '../../../../CONST';
import * as ReportUtils from '../../../../libs/ReportUtils';
import participantPropTypes from '../../../../components/participantPropTypes';
import ParticipantLocalTime from '../ParticipantLocalTime';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../../components/withCurrentUserPersonalDetails';
import {withNetwork} from '../../../../components/OnyxProvider';
import * as User from '../../../../libs/actions/User';
import EmojiPickerButton from '../../../../components/EmojiPicker/EmojiPickerButton';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import OfflineIndicator from '../../../../components/OfflineIndicator';
import ExceededCommentLength from '../../../../components/ExceededCommentLength';
import * as EmojiUtils from '../../../../libs/EmojiUtils';
import ReportDropUI from '../ReportDropUI';
import reportPropTypes from '../../../reportPropTypes';
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';
import * as Welcome from '../../../../libs/actions/Welcome';
import withAnimatedRef from '../../../../components/withAnimatedRef';
import Suggestions from './Suggestions';
import SendButton from './SendButton';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import SoloComposer from './SoloComposer';
import debouncedSaveReportComment from './debouncedSaveReportComment';
import withWindowDimensions from '../../../../components/withWindowDimensions';

const propTypes = {
    /** A method to call when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** The ID of the report actions will be created for */
    reportID: PropTypes.string.isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** Is composer full size */
    isComposerFullSize: PropTypes.bool,

    /** Whether user interactions should be disabled */
    disabled: PropTypes.bool,

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),

    /** Whether the composer input should be shown */
    shouldShowComposeInput: PropTypes.bool,

    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** animated ref from react-native-reanimated */
    animatedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]).isRequired,

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    modal: {},
    report: {},
    blockedFromConcierge: {},
    personalDetails: {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    isComposerFullSize: false,
    pendingAction: null,
    shouldShowComposeInput: true,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

function ReportActionCompose({
    animatedRef,
    blockedFromConcierge,
    currentUserPersonalDetails,
    disabled,
    isComposerFullSize,
    isMediumScreenWidth,
    isSmallScreenWidth,
    network,
    onSubmit,
    pendingAction,
    personalDetails,
    report,
    reportID,
    shouldShowComposeInput,
    translate,
    isCommentEmpty: isCommentEmptyProp,
}) {
    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(shouldFocusInputOnScreenFocus && shouldShowComposeInput /* TODO: && !modal.isVisible && !modal.willAlertModalBecomeVisible */);
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);

    /**
     * Updates the should clear state of the composer
     */
    const [textInputShouldClear, setTextInputShouldClear] = useState(false);
    const [isCommentEmpty, setIsCommentEmpty] = useState(isCommentEmptyProp);

    /**
     * Updates the visibility state of the menu
     */
    const [isMenuVisible, setMenuVisibility] = useState(false);

    const [composerHeight, setComposerHeight] = useState(0);
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const insertedEmojisRef = useRef([]);

    /**
     * Update frequently used emojis list. We debounce this method in the constructor so that UpdateFrequentlyUsedEmojis
     * API is not called too often.
     */
    const debouncedUpdateFrequentlyUsedEmojis = useCallback(() => {
        User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(insertedEmojisRef.current));
        insertedEmojisRef.current = [];
    }, []);

    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     */
    const [hasExceededMaxCommentLength, setExceededMaxCommentLength] = useState(false);

    const suggestionsRef = useRef(null);

    const reportParticipants = useMemo(() => _.without(lodashGet(report, 'participantAccountIDs', []), currentUserPersonalDetails.accountID), [currentUserPersonalDetails.accountID, report]);
    const participantsWithoutExpensifyAccountIDs = useMemo(() => _.difference(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS), [reportParticipants]);

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

    /**
     * Used to show Popover menu on Workspace chat at first sign-in
     * @returns {Boolean}
     */
    const showPopoverMenu = useMemo(
        () =>
            _.debounce(() => {
                setMenuVisibility(true);
                return true;
            }),
        [],
    );

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
            // Since we're submitting the form here which should clear the composer
            // We don't really care about saving the draft the user was typing
            // We need to make sure an empty draft gets saved instead
            debouncedSaveReportComment.cancel();
            const newComment = prepareCommentAndResetComposer();
            Report.addAttachment(reportID, file, newComment);
            setTextInputShouldClear(false);
        },
        [reportID],
    );

    /**
     * Event handler to update the state after the attachment preview is closed.
     */
    const attachmentPreviewClosed = useCallback(() => {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
    }, [updateShouldShowSuggestionMenuToFalse]);

    const onInsertedEmoji = useCallback(
        (emojiObject) => {
            insertedEmojisRef.current = [...insertedEmojisRef.current, emojiObject];
            debouncedUpdateFrequentlyUsedEmojis(emojiObject);
        },
        [debouncedUpdateFrequentlyUsedEmojis],
    );

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

            // Since we're submitting the form here which should clear the composer
            // We don't really care about saving the draft the user was typing
            // We need to make sure an empty draft gets saved instead
            debouncedSaveReportComment.cancel();

            const newComment = prepareCommentAndResetComposer();
            if (!newComment) {
                return;
            }

            onSubmit(newComment);
        },
        [onSubmit],
    );

    const onTriggerAttachmentPicker = useCallback(() => {
        // Set a flag to block suggestion calculation until we're finished using the file picker,
        // which will stop any flickering as the file picker opens on non-native devices.
        if (!willBlurTextInputOnTapOutsideFunc) {
            return;
        }
        suggestionsRef.current.setShouldBlockEmojiCalc(true);
    }, []);

    // TODO: migrate me
    // useEffect(() => {
    //     updateComment(commentRef.current);

    //     // Shows Popover Menu on Workspace Chat at first sign-in
    //     if (!disabled) {
    //         Welcome.show({
    //             routes: lodashGet(navigation.getState(), 'routes', []),
    //             showPopoverMenu,
    //         });
    //     }

    //     if (comment.length !== 0) {
    //         Report.setReportWithDraft(reportID, true);
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    // Prevents focusing and showing the keyboard while the drawer is covering the chat.
    const reportRecipient = personalDetails[participantsWithoutExpensifyAccountIDs[0]];
    const shouldUseFocusedColor = !isBlockedFromConcierge && !disabled && isFocused;
    const isFullSizeComposerAvailable = isFullComposerAvailable; // && !_.isEmpty(value);
    const hasReportRecipient = _.isObject(reportRecipient) && !_.isEmpty(reportRecipient);

    const isSendDisabled = isCommentEmpty || isBlockedFromConcierge || disabled || hasExceededMaxCommentLength;

    return (
        <View style={[shouldShowReportRecipientLocalTime && !lodashGet(network, 'isOffline') && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <OfflineWithFeedback
                pendingAction={pendingAction}
                style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
            >
                {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime participant={reportRecipient} />}
                <View
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
                        onModalHide={attachmentPreviewClosed}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPickerWithMenuItems
                                    displayFileInModal={displayFileInModal}
                                    reportID={reportID}
                                    report={report}
                                    reportParticipants={reportParticipants}
                                    isFullSizeComposerAvailable={isFullSizeComposerAvailable}
                                    isComposerFullSize={isComposerFullSize}
                                    updateShouldShowSuggestionMenuToFalse={updateShouldShowSuggestionMenuToFalse}
                                    isBlockedFromConcierge={isBlockedFromConcierge}
                                    disabled={disabled}
                                    setMenuVisibility={setMenuVisibility}
                                    isMenuVisible={isMenuVisible}
                                    onTriggerAttachmentPicker={onTriggerAttachmentPicker}
                                />
                                <SoloComposer
                                    reportID={reportID}
                                    report={report}
                                    isMenuVisible={isMenuVisible}
                                    animatedRef={animatedRef}
                                    inputPlaceholder={inputPlaceholder}
                                    isComposerFullSize={isComposerFullSize}
                                    setIsFocused={setIsFocused}
                                    suggestionsRef={suggestionsRef}
                                    displayFileInModal={displayFileInModal}
                                    textInputShouldClear={textInputShouldClear}
                                    setTextInputShouldClear={setTextInputShouldClear}
                                    isBlockedFromConcierge={isBlockedFromConcierge}
                                    disabled={disabled}
                                    isFullSizeComposerAvailable={isFullSizeComposerAvailable}
                                    setIsFullComposerAvailable={setIsFullComposerAvailable}
                                    composerHeight={composerHeight}
                                    setComposerHeight={setComposerHeight}
                                    setIsCommentEmpty={setIsCommentEmpty}
                                    submitForm={submitForm}
                                    shouldShowReportRecipientLocalTime={shouldShowReportRecipientLocalTime}
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
                            onModalHide={() => focus(true)}
                            onEmojiSelected={() => replaceSelectionWithText}
                        />
                    )}
                    <SendButton
                        isDisabled={isSendDisabled}
                        setIsCommentEmpty={setIsCommentEmpty}
                        submitForm={submitForm}
                        animatedRef={animatedRef}
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
                    {/* TODO: Maybe subscribe this to comment on its own? */}
                    {/* <ExceededCommentLength
                        comment={commentRef.current}
                        onExceededMaxCommentLength={setExceededMaxCommentLength}
                    /> */}
                </View>
            </OfflineWithFeedback>
        </View>
    );
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withWindowDimensions,
    withCurrentUserPersonalDetails,
    withAnimatedRef,
    withOnyx({
        isCommentEmpty: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
            selector: (comment) => _.isEmpty(comment),
        },
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
