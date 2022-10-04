import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableOpacity,
    InteractionManager,
} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import lodashIntersection from 'lodash/intersection';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import Composer from '../../../components/Composer';
import ONYXKEYS from '../../../ONYXKEYS';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../components/AttachmentPicker';
import * as Report from '../../../libs/actions/Report';
import ReportTypingIndicator from './ReportTypingIndicator';
import AttachmentModal from '../../../components/AttachmentModal';
import compose from '../../../libs/compose';
import PopoverMenu from '../../../components/PopoverMenu';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState from '../../../components/withDrawerState';
import CONST from '../../../CONST';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Permissions from '../../../libs/Permissions';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import reportActionPropTypes from './reportActionPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import participantPropTypes from '../../../components/participantPropTypes';
import ParticipantLocalTime from './ParticipantLocalTime';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import * as User from '../../../libs/actions/User';
import Tooltip from '../../../components/Tooltip';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import VirtualKeyboard from '../../../libs/VirtualKeyboard';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import withNavigationFocus from '../../../components/withNavigationFocus';
import reportPropTypes from '../../reportPropTypes';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** A method to call when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** The comment left by the user */
    comment: PropTypes.string,

    /** The ID of the report actions will be created for */
    reportID: PropTypes.string.isRequired,

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates if there is a modal currently visible or not */
        isVisible: PropTypes.bool,
    }),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Is the report view covered by the drawer */
    isDrawerOpen: PropTypes.bool.isRequired,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** Is composer screen focused */
    isFocused: PropTypes.bool.isRequired,

    /** Is the composer full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    betas: [],
    comment: '',
    modal: {},
    report: {},
    reportActions: {},
    blockedFromConcierge: {},
    personalDetails: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class ReportActionCompose extends React.Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
        this.debouncedSaveReportComment = _.debounce(this.debouncedSaveReportComment.bind(this), 1000, false);
        this.debouncedBroadcastUserIsTyping = _.debounce(this.debouncedBroadcastUserIsTyping.bind(this), 100, true);
        this.triggerHotkeyActions = this.triggerHotkeyActions.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setIsFocused = this.setIsFocused.bind(this);
        this.setIsFullComposerAvailable = this.setIsFullComposerAvailable.bind(this);
        this.focus = this.focus.bind(this);
        this.addEmojiToTextBox = this.addEmojiToTextBox.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.setTextInputRef = this.setTextInputRef.bind(this);
        this.getInputPlaceholder = this.getInputPlaceholder.bind(this);
        this.getIOUOptions = this.getIOUOptions.bind(this);
        this.addAttachment = this.addAttachment.bind(this);

        this.comment = props.comment;
        this.shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

        this.state = {
            isFocused: this.shouldFocusInputOnScreenFocus,
            isFullComposerAvailable: props.isComposerFullSize,
            textInputShouldClear: false,
            isCommentEmpty: props.comment.length === 0,
            isMenuVisible: false,
            selection: {
                start: props.comment.length,
                end: props.comment.length,
            },
            maxLines: props.isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES,
            value: props.comment,
            conciergePlaceholderRandomIndex: _.random(this.props.translate('reportActionCompose.conciergePlaceholderOptions').length - 1),
        };
    }

    componentDidMount() {
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!this.shouldFocusInputOnScreenFocus || !this.props.isFocused) {
                return;
            }

            this.focus(false);
        });
        this.setMaxLines();
        this.updateComment(this.comment);
    }

    componentDidUpdate(prevProps) {
        const sidebarOpened = !prevProps.isDrawerOpen && this.props.isDrawerOpen;
        if (sidebarOpened) {
            toggleReportActionComposeView(true);
        }

        // We want to focus or refocus the input when a modal has been closed and the underlying screen is focused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (this.shouldFocusInputOnScreenFocus && this.props.isFocused
            && prevProps.modal.isVisible && !this.props.modal.isVisible) {
            this.focus();
        }

        if (this.props.isComposerFullSize !== prevProps.isComposerFullSize) {
            this.setMaxLines();
        }

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (this.props.report.reportID === prevProps.report.reportID) {
            return;
        }

        this.updateComment(this.props.comment);
    }

    componentWillUnmount() {
        ReportActionComposeFocusManager.clear();
    }

    onSelectionChange(e) {
        this.setState({selection: e.nativeEvent.selection});
    }

    /**
     * Updates the Highlight state of the composer
     *
     * @param {Boolean} shouldHighlight
     */
    setIsFocused(shouldHighlight) {
        this.setState({isFocused: shouldHighlight});
    }

    setIsFullComposerAvailable(isFullComposerAvailable) {
        this.setState({isFullComposerAvailable});
    }

    /**
     * Updates the should clear state of the composer
     *
     * @param {Boolean} shouldClear
     */
    setTextInputShouldClear(shouldClear) {
        this.setState({textInputShouldClear: shouldClear});
    }

    /**
     * Updates the visibility state of the menu
     *
     * @param {Boolean} isMenuVisible
     */
    setMenuVisibility(isMenuVisible) {
        this.setState({isMenuVisible});
    }

    /**
     * Set the TextInput Ref
     *
     * @param {Element} el
     * @memberof ReportActionCompose
     */
    setTextInputRef(el) {
        ReportActionComposeFocusManager.composerRef.current = el;
        this.textInput = el;
    }

    /**
     * Get the placeholder to display in the chat input.
     *
     * @return {String}
     */
    getInputPlaceholder() {
        if (ReportUtils.chatIncludesConcierge(this.props.report)) {
            if (User.isBlockedFromConcierge(this.props.blockedFromConcierge)) {
                return this.props.translate('reportActionCompose.blockedFromConcierge');
            }

            return this.props.translate('reportActionCompose.conciergePlaceholderOptions')[this.state.conciergePlaceholderRandomIndex];
        }

        if (this.isEmptyChat()) {
            return this.props.translate('reportActionCompose.sayHello');
        }

        return this.props.translate('reportActionCompose.writeSomething');
    }

    /**
     * Returns the list of IOU Options
     *
     * @param {Array} reportParticipants
     * @returns {Array<object>}
     */
    getIOUOptions(reportParticipants) {
        const participants = _.filter(reportParticipants, email => this.props.currentUserPersonalDetails.login !== email);
        const hasExcludedIOUEmails = lodashIntersection(reportParticipants, CONST.EXPENSIFY_EMAILS).length > 0;
        const hasMultipleParticipants = participants.length > 1;
        const iouOptions = [];

        if (hasExcludedIOUEmails || participants.length === 0 || !Permissions.canUseIOU(this.props.betas)) {
            return [];
        }

        if (hasMultipleParticipants) {
            return [{
                icon: Expensicons.Receipt,
                text: this.props.translate('iou.splitBill'),
                onSelected: () => Navigation.navigate(ROUTES.getIouSplitRoute(this.props.reportID)),
            }];
        }

        iouOptions.push({
            icon: Expensicons.MoneyCircle,
            text: this.props.translate('iou.requestMoney'),
            onSelected: () => Navigation.navigate(ROUTES.getIouRequestRoute(this.props.reportID)),
        });
        if (Permissions.canUseIOUSend(this.props.betas)) {
            iouOptions.push({
                icon: Expensicons.Send,
                text: this.props.translate('iou.sendMoney'),
                onSelected: () => Navigation.navigate(ROUTES.getIOUSendRoute(this.props.reportID)),
            });
        }
        return iouOptions;
    }

    /**
     * Set the maximum number of lines for the composer
     */
    setMaxLines() {
        let maxLines = this.props.isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;
        if (this.props.isComposerFullSize) {
            maxLines = CONST.COMPOSER.MAX_LINES_FULL;
        }
        this.setState({maxLines});
    }

    isEmptyChat() {
        return _.size(this.props.reportActions) === 1;
    }

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     */
    addEmojiToTextBox(emoji) {
        const emojiWithSpace = `${emoji} `;
        const newComment = this.comment.slice(0, this.state.selection.start)
            + emojiWithSpace + this.comment.slice(this.state.selection.end, this.comment.length);
        this.setState(prevState => ({
            selection: {
                start: prevState.selection.start + emojiWithSpace.length,
                end: prevState.selection.start + emojiWithSpace.length,
            },
        }));
        this.updateComment(newComment);
    }

    /**
     * Focus the composer text input
     * @param {Boolean} [shouldelay=false] Impose delay before focusing the composer
     * @memberof ReportActionCompose
     */
    focus(shouldelay = false) {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        InteractionManager.runAfterInteractions(() => {
            if (!this.textInput) {
                return;
            }

            if (!shouldelay) {
                this.textInput.focus();
            } else {
                // Keyboard is not opened after Emoji Picker is closed
                // SetTimeout is used as a workaround
                // https://github.com/react-native-modal/react-native-modal/issues/114
                // We carefully choose a delay. 100ms is found enough for keyboard to open.
                setTimeout(() => this.textInput.focus(), 100);
            }
        });
    }

    /**
     * Save our report comment in Onyx. We debounce this method in the constructor so that it's not called too often
     * to update Onyx and re-render this component.
     *
     * @param {String} comment
     */
    debouncedSaveReportComment(comment) {
        Report.saveReportComment(this.props.reportID, comment || '');
    }

    /**
     * Broadcast that the user is typing. We debounce this method in the constructor to limit how often we publish
     * client events.
     */
    debouncedBroadcastUserIsTyping() {
        Report.broadcastUserIsTyping(this.props.reportID);
    }

    /**
     * Update the value of the comment in Onyx
     *
     * @param {String} newComment
     */
    updateComment(newComment) {
        this.setState({
            isCommentEmpty: !!newComment.match(/^(\s|`)*$/),
            value: newComment,
        });

        // Indicate that draft has been created.
        if (this.comment.length === 0 && newComment.length !== 0) {
            Report.setReportWithDraft(this.props.reportID, true);
        }

        // The draft has been deleted.
        if (newComment.length === 0) {
            Report.setReportWithDraft(this.props.reportID, false);
        }

        this.comment = newComment;
        this.debouncedSaveReportComment(newComment);
        if (newComment) {
            this.debouncedBroadcastUserIsTyping();
        }
    }

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    triggerHotkeyActions(e) {
        if (!e || VirtualKeyboard.shouldAssumeIsOpen()) {
            return;
        }

        // Submit the form when Enter is pressed
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.submitForm();
        }

        // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty
        if (e.key === 'ArrowUp' && this.textInput.selectionStart === 0 && this.state.isCommentEmpty) {
            e.preventDefault();

            const reportActionKey = _.find(
                _.keys(this.props.reportActions).reverse(),
                key => ReportUtils.canEditReportAction(this.props.reportActions[key]),
            );

            if (reportActionKey !== -1 && this.props.reportActions[reportActionKey]) {
                const {reportActionID, message} = this.props.reportActions[reportActionKey];
                Report.saveReportActionDraft(this.props.reportID, reportActionID, _.last(message).html);
            }
        }
    }

    /**
     * @returns {String}
     */
    prepareCommentAndResetComposer() {
        const trimmedComment = this.comment.trim();

        // Don't submit empty comments or comments that exceed the character limit
        if (this.state.isCommentEmpty || trimmedComment.length > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        this.updateComment('');
        this.setTextInputShouldClear(true);
        if (this.props.isComposerFullSize) {
            Report.setIsComposerFullSize(this.props.reportID, false);
        }
        this.setState({isFullComposerAvailable: false});

        return trimmedComment;
    }

    /**
     * @param {Object} file
     */
    addAttachment(file) {
        const comment = this.prepareCommentAndResetComposer();
        Report.addAttachment(this.props.reportID, file, comment);
        this.setTextInputShouldClear(false);
    }

    /**
     * Add a new comment to this chat
     *
     * @param {SyntheticEvent} [e]
     */
    submitForm(e) {
        if (e) {
            e.preventDefault();
        }

        const comment = this.prepareCommentAndResetComposer();
        if (!comment) {
            return;
        }

        this.props.onSubmit(comment);
    }

    render() {
        // Waiting until ONYX variables are loaded before displaying the component
        if (_.isEmpty(this.props.personalDetails)) {
            return null;
        }

        const reportParticipants = _.without(lodashGet(this.props.report, 'participants', []), this.props.currentUserPersonalDetails.login);
        const participantsWithoutExpensifyEmails = _.difference(reportParticipants, CONST.EXPENSIFY_EMAILS);
        const reportRecipient = this.props.personalDetails[participantsWithoutExpensifyEmails[0]];

        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report)
            && !this.props.isComposerFullSize;

        // Prevents focusing and showing the keyboard while the drawer is covering the chat.
        const isComposeDisabled = this.props.isDrawerOpen && this.props.isSmallScreenWidth;
        const isBlockedFromConcierge = ReportUtils.chatIncludesConcierge(this.props.report) && User.isBlockedFromConcierge(this.props.blockedFromConcierge);
        const inputPlaceholder = this.getInputPlaceholder();
        const hasExceededMaxCommentLength = this.comment.length > CONST.MAX_COMMENT_LENGTH;

        return (
            <View style={[
                shouldShowReportRecipientLocalTime && !lodashGet(this.props.network, 'isOffline') && styles.chatItemComposeWithFirstRow,
                this.props.isComposerFullSize && styles.chatItemFullComposeRow,
            ]}
            >
                {shouldShowReportRecipientLocalTime
                    && <ParticipantLocalTime participant={reportRecipient} />}
                <View style={[
                    (!isBlockedFromConcierge && (this.state.isFocused || this.state.isDraggingOver))
                        ? styles.chatItemComposeBoxFocusedColor
                        : styles.chatItemComposeBoxColor,
                    styles.flexRow,
                    styles.chatItemComposeBox,
                    this.props.isComposerFullSize && styles.chatItemFullComposeBox,
                    hasExceededMaxCommentLength && styles.borderColorDanger,
                ]}
                >
                    <AttachmentModal
                        headerTitle={this.props.translate('reportActionCompose.sendAttachment')}
                        onConfirm={this.addAttachment}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPicker>
                                    {({openPicker}) => (
                                        <>
                                            <View style={[
                                                styles.dFlex, styles.flexColumn,
                                                (this.state.isFullComposerAvailable || this.props.isComposerFullSize) ? styles.justifyContentBetween : styles.justifyContentEnd,
                                            ]}
                                            >
                                                {this.props.isComposerFullSize && (
                                                    <Tooltip text={this.props.translate('reportActionCompose.collapse')}>
                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.preventDefault();
                                                                Report.setIsComposerFullSize(this.props.reportID, false);
                                                            }}
                                                            style={styles.composerSizeButton}
                                                            underlayColor={themeColors.componentBG}
                                                            disabled={isBlockedFromConcierge}
                                                        >
                                                            <Icon src={Expensicons.Collapse} />
                                                        </TouchableOpacity>
                                                    </Tooltip>

                                                )}
                                                {(!this.props.isComposerFullSize && this.state.isFullComposerAvailable) && (
                                                    <Tooltip text={this.props.translate('reportActionCompose.expand')}>
                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.preventDefault();
                                                                Report.setIsComposerFullSize(this.props.reportID, true);
                                                            }}
                                                            style={styles.composerSizeButton}
                                                            underlayColor={themeColors.componentBG}
                                                            disabled={isBlockedFromConcierge}
                                                        >
                                                            <Icon src={Expensicons.Expand} />
                                                        </TouchableOpacity>
                                                    </Tooltip>
                                                )}
                                                <Tooltip text={this.props.translate('reportActionCompose.addAction')}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.preventDefault();
                                                            this.setMenuVisibility(true);
                                                        }}
                                                        style={styles.chatItemAttachButton}
                                                        underlayColor={themeColors.componentBG}
                                                        disabled={isBlockedFromConcierge}
                                                    >
                                                        <Icon src={Expensicons.Plus} />
                                                    </TouchableOpacity>
                                                </Tooltip>
                                            </View>
                                            <PopoverMenu
                                                isVisible={this.state.isMenuVisible}
                                                onClose={() => this.setMenuVisibility(false)}
                                                onItemSelected={() => this.setMenuVisibility(false)}
                                                anchorPosition={styles.createMenuPositionReportActionCompose}
                                                menuItems={[...this.getIOUOptions(reportParticipants),
                                                    {
                                                        icon: Expensicons.Paperclip,
                                                        text: this.props.translate('reportActionCompose.addAttachment'),
                                                        onSelected: () => {
                                                            openPicker({
                                                                onPicked: displayFileInModal,
                                                            });
                                                        },
                                                    },
                                                ]}
                                            />
                                        </>
                                    )}
                                </AttachmentPicker>
                                <View style={styles.textInputComposeSpacing}>
                                    <Composer
                                        autoFocus={!this.props.modal.isVisible && (this.shouldFocusInputOnScreenFocus || this.isEmptyChat())}
                                        multiline
                                        ref={this.setTextInputRef}
                                        textAlignVertical="top"
                                        placeholder={inputPlaceholder}
                                        placeholderTextColor={themeColors.placeholderText}
                                        onChangeText={this.updateComment}
                                        onKeyPress={this.triggerHotkeyActions}
                                        onDragEnter={(e, isOriginComposer) => {
                                            if (!isOriginComposer) {
                                                return;
                                            }

                                            this.setState({isDraggingOver: true});
                                        }}
                                        onDragOver={(e, isOriginComposer) => {
                                            if (!isOriginComposer) {
                                                return;
                                            }

                                            this.setState({isDraggingOver: true});
                                        }}
                                        onDragLeave={() => this.setState({isDraggingOver: false})}
                                        onDrop={(e) => {
                                            e.preventDefault();

                                            const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                                            if (!file) {
                                                return;
                                            }

                                            displayFileInModal(file);
                                            this.setState({isDraggingOver: false});
                                        }}
                                        style={[styles.textInputCompose, this.props.isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                                        maxLines={this.state.maxLines}
                                        onFocus={() => this.setIsFocused(true)}
                                        onBlur={() => this.setIsFocused(false)}
                                        onPasteFile={displayFileInModal}
                                        shouldClear={this.state.textInputShouldClear}
                                        onClear={() => this.setTextInputShouldClear(false)}
                                        isDisabled={isComposeDisabled || isBlockedFromConcierge}
                                        selection={this.state.selection}
                                        onSelectionChange={this.onSelectionChange}
                                        isFullComposerAvailable={this.state.isFullComposerAvailable}
                                        setIsFullComposerAvailable={this.setIsFullComposerAvailable}
                                        isComposerFullSize={this.props.isComposerFullSize}
                                        value={this.state.value}
                                    />
                                </View>
                            </>
                        )}
                    </AttachmentModal>
                    {canUseTouchScreen() && this.props.isMediumScreenWidth ? null : (
                        <EmojiPickerButton
                            isDisabled={isBlockedFromConcierge}
                            onModalHide={() => this.focus(true)}
                            onEmojiSelected={this.addEmojiToTextBox}
                        />
                    )}
                    <View style={[styles.justifyContentEnd]}>
                        <Tooltip text={this.props.translate('common.send')}>
                            <TouchableOpacity
                                style={[
                                    styles.chatItemSubmitButton,
                                    (this.state.isCommentEmpty || hasExceededMaxCommentLength) ? styles.buttonDisable : styles.buttonSuccess,
                                ]}
                                onPress={this.submitForm}
                                underlayColor={themeColors.componentBG}

                                // Keep focus on the composer when Send message is clicked.
                                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                                onMouseDown={e => e.preventDefault()}
                                disabled={this.state.isCommentEmpty || isBlockedFromConcierge || hasExceededMaxCommentLength}
                                hitSlop={{
                                    top: 3, right: 3, bottom: 3, left: 3,
                                }}
                            >
                                <Icon src={Expensicons.Send} fill={themeColors.componentBG} />
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                </View>
                <View style={[
                    styles.flexRow,
                    styles.justifyContentBetween,
                    styles.alignItemsCenter,
                    (!this.props.isSmallScreenWidth || (this.props.isSmallScreenWidth && !this.props.network.isOffline)) && styles.chatItemComposeSecondaryRow]}
                >
                    {!this.props.isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                    <ReportTypingIndicator reportID={this.props.reportID} />
                    <ExceededCommentLength commentLength={this.comment.length} />
                </View>
            </View>
        );
    }
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withDrawerState,
    withNavigationFocus,
    withLocalize,
    withNetwork(),
    withPersonalDetails(),
    withCurrentUserPersonalDetails,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        comment: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        },
        modal: {
            key: ONYXKEYS.MODAL,
        },
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
    }),
)(ReportActionCompose);
