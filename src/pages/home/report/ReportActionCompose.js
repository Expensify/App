import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableOpacity,
    Pressable,
    InteractionManager,
    Dimensions,
} from 'react-native';
import {withNavigationFocus} from '@react-navigation/compat';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles, {getButtonBackgroundColorStyle, getIconFillColor} from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import TextInputFocusable from '../../../components/TextInputFocusable';
import ONYXKEYS from '../../../ONYXKEYS';
import Icon from '../../../components/Icon';
import {
    Plus,
    Send,
    Emoji,
    Paperclip,
    Offline,
    MoneyCircle,
    Receipt,
} from '../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../components/AttachmentPicker';
import {
    addAction,
    saveReportComment,
    saveReportActionDraft,
    broadcastUserIsTyping,
} from '../../../libs/actions/Report';
import ReportTypingIndicator from './ReportTypingIndicator';
import AttachmentModal from '../../../components/AttachmentModal';
import compose from '../../../libs/compose';
import PopoverMenu from '../../../components/PopoverMenu';
import Popover from '../../../components/Popover';
import EmojiPickerMenu from './EmojiPickerMenu';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withDrawerState from '../../../components/withDrawerState';
import getButtonState from '../../../libs/getButtonState';
import CONST from '../../../CONST';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import variables from '../../../styles/variables';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Permissions from '../../../libs/Permissions';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as User from '../../../libs/actions/User';
import ReportActionPropTypes from './ReportActionPropTypes';
import {canEditReportAction, isArchivedRoom} from '../../../libs/reportUtils';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import Text from '../../../components/Text';
import {participantPropTypes} from '../sidebar/optionPropTypes';
import currentUserPersonalDetailsPropsTypes from '../../settings/Profile/currentUserPersonalDetailsPropsTypes';
import ParticipantLocalTime from './ParticipantLocalTime';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import Tooltip from '../../../components/Tooltip';

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

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: PropTypes.shape({

        /** participants associated with current report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),

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
    myPersonalDetails: {},
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
        this.showEmojiPicker = this.showEmojiPicker.bind(this);
        this.hideEmojiPicker = this.hideEmojiPicker.bind(this);
        this.addEmojiToTextBox = this.addEmojiToTextBox.bind(this);
        this.focus = this.focus.bind(this);
        this.comment = props.comment;
        this.shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
        this.focusEmojiSearchInput = this.focusEmojiSearchInput.bind(this);
        this.measureEmojiPopoverAnchorPosition = this.measureEmojiPopoverAnchorPosition.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.emojiPopoverAnchor = null;
        this.emojiSearchInput = null;
        this.setTextInputRef = this.setTextInputRef.bind(this);
        this.getInputPlaceholder = this.getInputPlaceholder.bind(this);

        this.state = {
            isFocused: this.shouldFocusInputOnScreenFocus,
            textInputShouldClear: false,
            isCommentEmpty: props.comment.length === 0,
            isEmojiPickerVisible: false,
            isMenuVisible: false,

            // The horizontal and vertical position (relative to the window) where the emoji popover will display.
            emojiPopoverAnchorPosition: {
                horizontal: 0,
                vertical: 0,
            },
            selection: {
                start: props.comment.length,
                end: props.comment.length,
            },
        };
    }

    componentDidMount() {
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (this.shouldFocusInputOnScreenFocus && this.props.isFocused) {
                this.focus(false);
            }
        });
        Dimensions.addEventListener('change', this.measureEmojiPopoverAnchorPosition);
    }

    componentDidUpdate(prevProps) {
        // We want to focus or refocus the input when a modal has been closed and the underlying screen is focused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (this.shouldFocusInputOnScreenFocus && this.props.isFocused
            && prevProps.modal.isVisible && !this.props.modal.isVisible) {
            this.focus();
        }

        // If we switch from a sidebar, the component does not mount again
        // so we need to update the comment manually.
        if (prevProps.comment !== this.props.comment) {
            this.textInput.setNativeProps({text: this.props.comment});
        }
    }

    componentWillUnmount() {
        ReportActionComposeFocusManager.clear();
        Dimensions.removeEventListener('change', this.measureEmojiPopoverAnchorPosition);
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
        if (isArchivedRoom(this.props.report)) {
            return this.props.translate('reportActionCompose.roomIsArchived');
        }

        if (this.props.report.participants
            && this.props.report.participants.includes(CONST.EMAIL.CONCIERGE)
            && !_.isEmpty(this.props.blockedFromConcierge)
            && User.isBlockedFromConcierge(this.props.blockedFromConcierge.expiresAt)) {
            return this.props.translate('reportActionCompose.blockedFromConcierge');
        }

        return this.props.translate('reportActionCompose.writeSomething');
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
            if (this.textInput) {
                if (!shouldelay) {
                    this.textInput.focus();
                } else {
                    // Keyboard is not opened after Emoji Picker is closed
                    // SetTimeout is used as a workaround
                    // https://github.com/react-native-modal/react-native-modal/issues/114
                    // We carefully choose a delay. 50ms is found enough for keyboard to open.
                    setTimeout(() => this.textInput.focus(), 50);
                }
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
        saveReportComment(this.props.reportID, comment || '');
    }

    /**
     * Broadcast that the user is typing. We debounce this method in the constructor to limit how often we publish
     * client events.
     */
    debouncedBroadcastUserIsTyping() {
        broadcastUserIsTyping(this.props.reportID);
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
        if (e) {
            // Submit the form when Enter is pressed
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitForm();
            }

            // Trigger the edit box for last sent message if ArrowUp is pressed
            if (e.key === 'ArrowUp' && this.state.isCommentEmpty) {
                e.preventDefault();

                const reportActionKey = _.find(
                    Object.keys(this.props.reportActions).reverse(),
                    key => canEditReportAction(this.props.reportActions[key]),
                );

                if (reportActionKey !== -1 && this.props.reportActions[reportActionKey]) {
                    const {reportActionID, message} = this.props.reportActions[reportActionKey];
                    saveReportActionDraft(this.props.reportID, reportActionID, _.last(message).html);
                }
            }
        }
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     */
    showEmojiPicker() {
        this.textInput.blur();
        this.setState({isEmojiPickerVisible: true});
    }

    /**
     * This gets called onLayout to find the cooridnates of the Anchor for the Emoji Picker.
     */
    measureEmojiPopoverAnchorPosition() {
        if (this.emojiPopoverAnchor) {
            this.emojiPopoverAnchor.measureInWindow((x, y, width) => this.setState({
                emojiPopoverAnchorPosition: {horizontal: x + width, vertical: y},
            }));
        }
    }


    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hideEmojiPicker() {
        this.setState({isEmojiPickerVisible: false});
    }

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     */
    addEmojiToTextBox(emoji) {
        this.hideEmojiPicker();
        const {selection} = this.state;
        const newComment = this.comment.slice(0, selection.start)
            + emoji + this.comment.slice(selection.end, this.comment.length);
        this.textInput.setNativeProps({
            text: newComment,
        });
        const updatedSelection = {
            start: selection.start + emoji.length,
            end: selection.start + emoji.length,
        };
        this.setState({selection: updatedSelection});
        this.updateComment(newComment);
    }

    /**
     * Focus the search input in the emoji picker.
     */
    focusEmojiSearchInput() {
        if (this.emojiSearchInput) {
            this.emojiSearchInput.focus();
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

        this.props.onSubmit(trimmedComment);
        this.updateComment('');
        this.setTextInputShouldClear(true);
    }

    render() {
        // Waiting until ONYX variables are loaded before displaying the component
        if (_.isEmpty(this.props.personalDetails) || _.isEmpty(this.props.myPersonalDetails)) {
            return null;
        }

        // eslint-disable-next-line no-unused-vars
        const reportParticipants = lodashGet(this.props.report, 'participants', []);
        const hasMultipleParticipants = reportParticipants.length > 1;
        const hasChronosParticipant = _.contains(reportParticipants, CONST.EMAIL.CHRONOS);
        const hasConciergeParticipant = _.contains(reportParticipants, CONST.EMAIL.CONCIERGE);
        const reportRecipient = this.props.personalDetails[reportParticipants[0]];
        const currentUserTimezone = lodashGet(this.props.myPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);
        const reportRecipientTimezone = lodashGet(reportRecipient, 'timezone', CONST.DEFAULT_TIME_ZONE);
        const shouldShowReportRecipientLocalTime = !hasConciergeParticipant
            && !hasChronosParticipant
            && !hasMultipleParticipants
            && reportRecipient
            && reportRecipientTimezone
            && currentUserTimezone.selected !== reportRecipientTimezone.selected;

        // Prevents focusing and showing the keyboard while the drawer is covering the chat.
        const isComposeDisabled = this.props.isDrawerOpen && this.props.isSmallScreenWidth;
        const isConciergeChat = this.props.report.participants
            && this.props.report.participants.includes(CONST.EMAIL.CONCIERGE);
        let isBlockedFromConcierge = false;
        if (isConciergeChat && !_.isEmpty(this.props.blockedFromConcierge)) {
            isBlockedFromConcierge = User.isBlockedFromConcierge(this.props.blockedFromConcierge.expiresAt);
        }
        const inputPlaceholder = this.getInputPlaceholder();
        const isArchivedChatRoom = isArchivedRoom(this.props.report);

        return (
            <View style={[
                styles.chatItemCompose,
                shouldShowReportRecipientLocalTime && styles.chatItemComposeWithFirstRow,
            ]}
            >
                {shouldShowReportRecipientLocalTime
                    && <ParticipantLocalTime participant={reportRecipient} currentUserTimezone={currentUserTimezone} />}
                <View style={[
                    (this.state.isFocused || this.state.isDraggingOver)
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
                            addAction(this.props.reportID, '', file);
                            this.setTextInputShouldClear(false);
                        }}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPicker>
                                    {({openPicker}) => (
                                        <>
                                            <Tooltip text={this.props.translate('reportActionCompose.addAction')}>
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.preventDefault();
                                                        this.setMenuVisibility(true);
                                                    }}
                                                    style={styles.chatItemAttachButton}
                                                    underlayColor={themeColors.componentBG}
                                                    disabled={isBlockedFromConcierge || isArchivedChatRoom}
                                                >
                                                    <Icon src={Plus} />
                                                </TouchableOpacity>
                                            </Tooltip>
                                            <PopoverMenu
                                                isVisible={this.state.isMenuVisible}
                                                onClose={() => this.setMenuVisibility(false)}
                                                onItemSelected={() => this.setMenuVisibility(false)}
                                                anchorPosition={styles.createMenuPositionReportActionCompose}
                                                animationIn="fadeInUp"
                                                animationOut="fadeOutDown"
                                                menuItems={[
                                                    ...(!hasConciergeParticipant
                                                        && Permissions.canUseIOU(this.props.betas) ? [
                                                            hasMultipleParticipants
                                                                ? {
                                                                    icon: Receipt,
                                                                    text: this.props.translate('iou.splitBill'),
                                                                    onSelected: () => {
                                                                        Navigation.navigate(
                                                                            ROUTES.getIouSplitRoute(
                                                                                this.props.reportID,
                                                                            ),
                                                                        );
                                                                    },
                                                                }
                                                                : {
                                                                    icon: MoneyCircle,
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
                                                    {
                                                        icon: Paperclip,
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
                                    autoFocus={this.shouldFocusInputOnScreenFocus}
                                    multiline
                                    ref={this.setTextInputRef}
                                    textAlignVertical="top"
                                    placeholder={inputPlaceholder}
                                    placeholderTextColor={themeColors.placeholderText}
                                    onChangeText={this.updateComment}
                                    onKeyPress={this.triggerHotkeyActions}
                                    onDragEnter={(e, isOriginComposer) => {
                                        if (isOriginComposer) {
                                            this.setState({isDraggingOver: true});
                                        }
                                    }}
                                    onDragOver={(e, isOriginComposer) => {
                                        if (isOriginComposer) {
                                            this.setState({isDraggingOver: true});
                                        }
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
                                    maxLines={16} // This is the same that slack has
                                    onFocus={() => this.setIsFocused(true)}
                                    onBlur={() => this.setIsFocused(false)}
                                    onPasteFile={file => displayFileInModal({file})}
                                    shouldClear={this.state.textInputShouldClear}
                                    onClear={() => this.setTextInputShouldClear(false)}
                                    isDisabled={isComposeDisabled || isBlockedFromConcierge || isArchivedChatRoom}
                                    selection={this.state.selection}
                                    onSelectionChange={this.onSelectionChange}
                                />

                            </>
                        )}
                    </AttachmentModal>
                    {

                        // There is no way to disable animations and they are really laggy, because there are so many
                        // emojis. The best alternative is to set it to 1ms so it just "pops" in and out
                    }
                    <Popover
                        isVisible={this.state.isEmojiPickerVisible}
                        onClose={this.hideEmojiPicker}
                        onModalShow={this.focusEmojiSearchInput}
                        onModalHide={() => this.focus(true)}
                        hideModalContentWhileAnimating
                        animationInTiming={1}
                        animationOutTiming={1}
                        anchorPosition={{
                            bottom: this.props.windowHeight - this.state.emojiPopoverAnchorPosition.vertical,
                            left: this.state.emojiPopoverAnchorPosition.horizontal - CONST.EMOJI_PICKER_SIZE,
                        }}
                    >
                        <EmojiPickerMenu
                            onEmojiSelected={this.addEmojiToTextBox}
                            ref={el => this.emojiSearchInput = el}
                        />
                    </Popover>
                    <Pressable
                        style={({hovered, pressed}) => ([
                            styles.chatItemEmojiButton,
                            getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
                        ])}
                        ref={el => this.emojiPopoverAnchor = el}
                        onLayout={this.measureEmojiPopoverAnchorPosition}
                        onPress={this.showEmojiPicker}
                        disabled={isBlockedFromConcierge || isArchivedChatRoom}
                    >
                        {({hovered, pressed}) => (
                            <Tooltip text={this.props.translate('reportActionCompose.emoji')}>
                                <Icon
                                    src={Emoji}
                                    fill={getIconFillColor(getButtonState(hovered, pressed))}
                                />
                            </Tooltip>
                        )}
                    </Pressable>
                    <Tooltip text={this.props.translate('common.send')}>
                        <TouchableOpacity
                            style={[styles.chatItemSubmitButton,
                                this.state.isCommentEmpty
                                    ? styles.buttonDisable : styles.buttonSuccess]}
                            onPress={this.submitForm}
                            underlayColor={themeColors.componentBG}
                            disabled={this.state.isCommentEmpty || isBlockedFromConcierge || isArchivedChatRoom}
                        >
                            <Icon src={Send} fill={themeColors.componentBG} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>
                {this.props.network.isOffline ? (
                    <View style={[styles.chatItemComposeSecondaryRow]}>
                        <View style={[
                            styles.chatItemComposeSecondaryRowOffset,
                            styles.flexRow,
                            styles.alignItemsCenter]}
                        >
                            <Icon
                                src={Offline}
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
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
    }),
)(ReportActionCompose);
