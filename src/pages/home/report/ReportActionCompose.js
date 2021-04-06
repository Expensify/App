/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import TextInputFocusable from '../../../components/TextInputFocusable';
import ONYXKEYS from '../../../ONYXKEYS';
import Icon from '../../../components/Icon';
import {Plus, Send, Paperclip} from '../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../components/AttachmentPicker';
import {addAction, saveReportComment, broadcastUserIsTyping} from '../../../libs/actions/Report';
import ReportTypingIndicator from './ReportTypingIndicator';
import AttachmentModal from '../../../components/AttachmentModal';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import compose from '../../../libs/compose';
import CreateMenu from '../../../components/CreateMenu';
import Navigation from '../../../libs/Navigation/Navigation';

const propTypes = {
    // A method to call when the form is submitted
    onSubmit: PropTypes.func.isRequired,

    // The comment left by the user
    comment: PropTypes.string,

    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Details about any modals being used
    modal: PropTypes.shape({
        // Indicates if there is a modal currently visible or not
        isVisible: PropTypes.bool,
    }),

    // The report currently being looked at
    report: PropTypes.shape({

        // participants associated with current report
        participants: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    comment: '',
    modal: {},
};

class ReportActionCompose extends React.Component {
    constructor(props) {
        super(props);
        this.updateComment = this.updateComment.bind(this);
        this.debouncedSaveReportComment = _.debounce(this.debouncedSaveReportComment.bind(this), 1000, false);
        this.debouncedBroadcastUserIsTyping = _.debounce(this.debouncedBroadcastUserIsTyping.bind(this), 100, true);
        this.submitForm = this.submitForm.bind(this);
        this.triggerSubmitShortcut = this.triggerSubmitShortcut.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setIsFocused = this.setIsFocused.bind(this);
        this.focus = this.focus.bind(this);
        this.comment = props.comment;

        this.state = {
            isFocused: true,
            textInputShouldClear: false,
            isCommentEmpty: props.comment.length === 0,
            isMenuVisible: false,
        };
    }

    componentDidUpdate(prevProps) {
        // When any modal goes from visible to hidden, bring focus to the compose field
        if (prevProps.modal.isVisible && !this.props.modal.isVisible) {
            this.focus();
        }
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
     * Focus the composer text input
     */
    focus() {
        if (this.textInput) {
            this.textInput.focus();
        }
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
        this.setState({
            isCommentEmpty: newComment.length === 0,
        });
        this.comment = newComment;
        this.debouncedSaveReportComment(newComment);
        this.debouncedBroadcastUserIsTyping();
    }

    /**
     * Listens for the keyboard shortcut and submits
     * the form when we have enter
     *
     * @param {Object} e
     */
    triggerSubmitShortcut(e) {
        if (e && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.submitForm();
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
        // We want to make sure to disable on small screens because in iOS safari the keyboard up/down buttons will
        // focus this from the chat switcher.
        // https://github.com/Expensify/Expensify.cash/issues/1228
        const inputDisable = this.props.isSmallScreenWidth && Navigation.isDrawerOpen();
        // eslint-disable-next-line no-unused-vars
        const hasMultipleParticipants = lodashGet(this.props.report, 'participants.length') > 1;

        return (
            <View style={[styles.chatItemCompose]}>
                <View style={[
                    (this.state.isFocused || this.state.isDraggingOver)
                        ? styles.chatItemComposeBoxFocusedColor
                        : styles.chatItemComposeBoxColor,
                    styles.chatItemComposeBox,
                    styles.flexRow,
                ]}
                >
                    <AttachmentModal
                        title="Upload Attachment"
                        onConfirm={(file) => {
                            addAction(this.props.reportID, '', file);
                            this.setTextInputShouldClear(false);
                        }}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPicker>
                                    {({openPicker}) => (
                                        <>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.preventDefault();
                                                    this.setMenuVisibility(true);

                                                    /* Keep last focus inside the input so that focus is restored
                                                     on modal close. Otherwise breaks modal 2 modal transition */
                                                    this.focus();
                                                }}
                                                style={styles.chatItemAttachButton}
                                                underlayColor={themeColors.componentBG}
                                            >
                                                <Icon src={Plus} />
                                            </TouchableOpacity>
                                            <CreateMenu
                                                isVisible={this.state.isMenuVisible}
                                                onClose={() => this.setMenuVisibility(false)}
                                                onItemSelected={(item) => {
                                                    if (item.text === 'Upload Photo') {
                                                        openPicker({
                                                            onPicked: file => displayFileInModal({file}),
                                                        });
                                                    }

                                                    this.setMenuVisibility(false);
                                                }}
                                                menuItems={[
                                                    {
                                                        icon: Paperclip,
                                                        text: 'Upload Photo',
                                                        onSelected: () => {},
                                                    },
                                                ]}

                                            /**
                                             * Temporarily hiding IOU Modal options while Modal is incomplete. Will
                                             * be replaced by a beta flag once IOUConfirm is completed.
                                            menuOptions={hasMultipleParticipants
                                                ? [
                                                    CONST.MENU_ITEM_KEYS.SPLIT_BILL,
                                                    CONST.MENU_ITEM_KEYS.ATTACHMENT_PICKER]
                                                : [
                                                    CONST.MENU_ITEM_KEYS.REQUEST_MONEY,
                                                    CONST.MENU_ITEM_KEYS.ATTACHMENT_PICKER]}
                                            */
                                            />
                                        </>
                                    )}
                                </AttachmentPicker>
                                <TextInputFocusable
                                    autoFocus
                                    multiline
                                    ref={el => this.textInput = el}
                                    textAlignVertical="top"
                                    placeholder="Write something..."
                                    placeholderTextColor={themeColors.placeholderText}
                                    onChangeText={this.updateComment}
                                    onKeyPress={this.triggerSubmitShortcut}
                                    onDragEnter={() => this.setState({isDraggingOver: true})}
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
                                    isDisabled={inputDisable}
                                />

                            </>
                        )}
                    </AttachmentModal>
                    <TouchableOpacity
                        style={[styles.chatItemSubmitButton,
                            this.state.isCommentEmpty
                                ? styles.buttonDisable : styles.buttonSuccess]}
                        onPress={this.submitForm}
                        underlayColor={themeColors.componentBG}
                        disabled={this.state.isCommentEmpty}
                    >
                        <Icon src={Send} fill={themeColors.componentBG} />
                    </TouchableOpacity>
                </View>
                <ReportTypingIndicator reportID={this.props.reportID} />
            </View>
        );
    }
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default compose(
    withOnyx({
        comment: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        },
        modal: {
            key: ONYXKEYS.MODAL,
        },
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
    }),
    withWindowDimensions,
)(ReportActionCompose);
