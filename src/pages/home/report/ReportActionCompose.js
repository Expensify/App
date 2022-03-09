import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableOpacity,
    InteractionManager,
} from 'react-native';
import {withNavigationFocus} from '@react-navigation/compat';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import lodashIntersection from 'lodash/intersection';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import TextInputFocusable from '../../../components/TextInputFocusable';
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
import variables from '../../../styles/variables';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Permissions from '../../../libs/Permissions';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import reportActionPropTypes from './reportActionPropTypes';
import * as ReportUtils from '../../../libs/reportUtils';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import Text from '../../../components/Text';
import participantPropTypes from '../../../components/participantPropTypes';
import ParticipantLocalTime from './ParticipantLocalTime';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import DateUtils from '../../../libs/DateUtils';
import * as User from '../../../libs/actions/User';
import Tooltip from '../../../components/Tooltip';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import VirtualKeyboard from '../../../libs/VirtualKeyboard';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** A method to call when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** The comment left by the user */
    comment: PropTypes.string,

    /** The ID of the report actions will be created for */
    reportID: PropTypes.number.isRequired,

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates if there is a modal currently visible or not */
        isVisible: PropTypes.bool,
    }),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: PropTypes.shape({

        /** participants associated with current report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Is the report view covered by the drawer */
    isDrawerOpen: PropTypes.bool.isRequired,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** Is composer screen focused */
    isFocused: PropTypes.bool.isRequired,

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    comment: '',
    modal: {},
    report: {},
    reportActions: {},
    network: {isOffline: false},
    blockedFromConcierge: {},
    personalDetails: {},
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
        this.focus = this.focus.bind(this);
        this.addEmojiToTextBox = this.addEmojiToTextBox.bind(this);
        this.comment = props.comment;
        this.shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.setTextInputRef = this.setTextInputRef.bind(this);
        this.getInputPlaceholder = this.getInputPlaceholder.bind(this);

        this.state = {
            isFocused: this.shouldFocusInputOnScreenFocus,
            textInputShouldClear: false,
            isCommentEmpty: props.comment.length === 0,
            isMenuVisible: false,
            selection: {
                start: props.comment.length,
                end: props.comment.length,
            },
        };
    }

    componentDidMount() {
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!this.shouldFocusInputOnScreenFocus || !this.props.isFocused) {
                return;
            }

            this.focus(false);
        });
    }

    componentDidUpdate(prevProps) {
        // We want to focus or refocus the input when a modal has been closed and the underlying screen is focused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (this.shouldFocusInputOnScreenFocus && this.props.isFocused
            && prevProps.modal.isVisible && !this.props.modal.isVisible) {
            this.focus();
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
        if (ReportUtils.chatIncludesConcierge(this.props.report) && User.isBlockedFromConcierge(this.props.blockedFromConcierge)) {
            return this.props.translate('reportActionCompose.blockedFromConcierge');
        }

        if (_.size(this.props.reportActions) === 1) {
            return this.props.translate('reportActionCompose.sayHello');
        }

        return this.props.translate('reportActionCompose.writeSomething');
    }

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     */
    addEmojiToTextBox(emoji) {
        const newComment = this.comment.slice(0, this.state.selection.start)
            + emoji + this.comment.slice(this.state.selection.end, this.comment.length);
        this.textInput.setNativeProps({
            text: newComment,
        });
        this.setState(prevState => ({
            selection: {
                start: prevState.selection.start + emoji.length,
                end: prevState.selection.start + emoji.length,
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
                // We carefully choose a delay. 50ms is found enough for keyboard to open.
                setTimeout(() => this.textInput.focus(), 50);
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
        this.textInput.setNativeProps({text: newComment});
        this.setState({
            isCommentEmpty: newComment.length === 0,
        });

        // Indicate that draft has been created.
        if (this.comment.length === 0 && newComment.length !== 0) {
            Report.setReportWithDraft(this.props.reportID.toString(), true);
        }

        // The draft has been deleted.
        if (newComment.length === 0) {
            Report.setReportWithDraft(this.props.reportID.toString(), false);
        }

        this.comment = newComment;
        this.debouncedSaveReportComment(newComment);
        if (newComment) {
            this.debouncedBroadcastUserIsTyping();
        }

        this.textInput.scrollTop = this.textInput.scrollHeight;
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

        // Trigger the edit box for last sent message if ArrowUp is pressed
        if (e.key === 'ArrowUp' && this.state.isCommentEmpty) {
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
     * Add a new comment to this chat
     *
     * @param {SyntheticEvent} [e]
     */
    submitForm(e) {
        if (e) {
            e.preventDefault();
        }

        const trimmedComment = this.comment.trim();

        // Don't submit empty comments
        if (!trimmedComment) {
            return;
        }

        DateUtils.throttledUpdateTimezone();

        this.props.onSubmit(trimmedComment);
        this.updateComment('');
        this.setTextInputShouldClear(true);
    }

    render() {
        // Waiting until ONYX variables are loaded before displaying the component
        if (_.isEmpty(this.props.personalDetails)) {
            return null;
        }

        const reportParticipants = lodashGet(this.props.report, 'participants', []);
        const hasMultipleParticipants = reportParticipants.length > 1;
        const hasExcludedIOUEmails = lodashIntersection(reportParticipants, CONST.EXPENSIFY_EMAILS).length > 0;
        const reportRecipient = this.props.personalDetails[reportParticipants[0]];
        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report);

        // Prevents focusing and showing the keyboard while the drawer is covering the chat.
        const isComposeDisabled = this.props.isDrawerOpen && this.props.isSmallScreenWidth;
        const isBlockedFromConcierge = ReportUtils.chatIncludesConcierge(this.props.report) && User.isBlockedFromConcierge(this.props.blockedFromConcierge);
        const inputPlaceholder = this.getInputPlaceholder();
        return (
            <View style={[shouldShowReportRecipientLocalTime && styles.chatItemComposeWithFirstRow]}>
                {shouldShowReportRecipientLocalTime
                    && <ParticipantLocalTime participant={reportRecipient} />}
                <View style={[
                    (!isBlockedFromConcierge && (this.state.isFocused || this.state.isDraggingOver))
                        ? styles.chatItemComposeBoxFocusedColor
                        : styles.chatItemComposeBoxColor,
                    styles.chatItemComposeBox,
                    styles.flexRow,
                ]}
                >
                    <AttachmentModal
                        isUploadingAttachment
                        onConfirm={(file) => {
                            this.submitForm();
                            Report.addAction(this.props.reportID, '', file);
                            this.setTextInputShouldClear(false);
                        }}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPicker>
                                    {({openPicker}) => (
                                        <>
                                            <View style={[styles.justifyContentEnd]}>
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
                                                animationIn="fadeInUp"
                                                animationOut="fadeOutDown"
                                                menuItems={[
                                                    ...(!hasExcludedIOUEmails
                                                        && Permissions.canUseIOU(this.props.betas) ? [
                                                            hasMultipleParticipants
                                                                ? {
                                                                    icon: Expensicons.Receipt,
                                                                    text: this.props.translate('iou.splitBill'),
                                                                    onSelected: () => {
                                                                        Navigation.navigate(
                                                                            ROUTES.getIouSplitRoute(
                                                                                this.props.reportID,
                                                                            ),
                                                                        );
                                                                    },
                                                                } : {
                                                                    icon: Expensicons.MoneyCircle,
                                                                    text: this.props.translate('iou.requestMoney'),
                                                                    onSelected: () => {
                                                                        Navigation.navigate(
                                                                            ROUTES.getIouRequestRoute(
                                                                                this.props.reportID,
                                                                            ),
                                                                        );
                                                                    },
                                                                },
                                                        ] : []),
                                                    ...(!hasExcludedIOUEmails && Permissions.canUseIOUSend(this.props.betas) && !hasMultipleParticipants ? [
                                                        {
                                                            icon: Expensicons.Send,
                                                            text: this.props.translate('iou.sendMoney'),
                                                            onSelected: () => {
                                                                Navigation.navigate(
                                                                    ROUTES.getIOUSendRoute(
                                                                        this.props.reportID,
                                                                    ),
                                                                );
                                                            },
                                                        },
                                                    ] : []),
                                                    {
                                                        icon: Expensicons.Paperclip,
                                                        text: this.props.translate('reportActionCompose.addAttachment'),
                                                        onSelected: () => {
                                                            openPicker({
                                                                onPicked: (file) => {
                                                                    displayFileInModal({file});
                                                                },
                                                            });
                                                        },
                                                    },
                                                ]}
                                            />
                                        </>
                                    )}
                                </AttachmentPicker>
                                <TextInputFocusable
                                    autoFocus={this.shouldFocusInputOnScreenFocus || _.size(this.props.reportActions) === 1}
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

                                        displayFileInModal({file});
                                        this.setState({isDraggingOver: false});
                                    }}
                                    style={[styles.textInputCompose, styles.flex4]}
                                    defaultValue={this.props.comment}
                                    maxLines={this.props.isSmallScreenWidth ? 6 : 16} // This is the same that slack has
                                    onFocus={() => this.setIsFocused(true)}
                                    onBlur={() => this.setIsFocused(false)}
                                    onPasteFile={file => displayFileInModal({file})}
                                    shouldClear={this.state.textInputShouldClear}
                                    onClear={() => this.setTextInputShouldClear(false)}
                                    isDisabled={isComposeDisabled || isBlockedFromConcierge}
                                    selection={this.state.selection}
                                    onSelectionChange={this.onSelectionChange}
                                />
                            </>
                        )}
                    </AttachmentModal>
                    {canUseTouchScreen() && !this.props.isSmallScreenWidth ? null : (
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
                                    this.state.isCommentEmpty ? styles.buttonDisable : styles.buttonSuccess,
                                ]}
                                onPress={this.submitForm}
                                underlayColor={themeColors.componentBG}
                                disabled={this.state.isCommentEmpty || isBlockedFromConcierge}
                                hitSlop={{
                                    top: 3, right: 3, bottom: 3, left: 3,
                                }}
                            >
                                <Icon src={Expensicons.Send} fill={themeColors.componentBG} />
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                </View>
                {this.props.network.isOffline ? (
                    <View style={[styles.chatItemComposeSecondaryRow]}>
                        <View style={[
                            styles.chatItemComposeSecondaryRowOffset,
                            styles.flexRow,
                            styles.alignItemsCenter]}
                        >
                            <Icon
                                src={Expensicons.Offline}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                            <Text style={[styles.ml2, styles.chatItemComposeSecondaryRowSubText]}>
                                {this.props.translate('reportActionCompose.youAppearToBeOffline')}
                            </Text>
                        </View>
                    </View>
                ) : <ReportTypingIndicator reportID={this.props.reportID} />}
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
    withPersonalDetails(),
    withNetwork(),
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
