import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import TextInputFocusable from '../../../components/TextInputFocusable';
import ONYXKEYS from '../../../ONYXKEYS';
import Icon from '../../../components/Icon';
import {Paperclip, Send, Emoji} from '../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../components/AttachmentPicker';
import {addAction, saveReportComment, broadcastUserIsTyping} from '../../../libs/actions/Report';
import ReportTypingIndicator from './ReportTypingIndicator';
import AttachmentModal from '../../../components/AttachmentModal';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import PopoverWithMeasuredContent from '../../../components/PopoverWithMeasuredContent';
import EmojiPickerMenu from './EmojiPickerMenu';
import CONST from '../../../CONST';

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

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    comment: '',
    modal: {},
};

class ReportActionCompose extends React.Component {
    constructor(props) {
        super(props);

        // The horizontal and vertical position (relative to the screen) where the popover will display.
        this.popoverAnchorPosition = {
            horizontal: 0,
            vertical: 0,
        };

        this.updateComment = this.updateComment.bind(this);
        this.debouncedSaveReportComment = _.debounce(this.debouncedSaveReportComment.bind(this), 1000, false);
        this.debouncedBroadcastUserIsTyping = _.debounce(this.debouncedBroadcastUserIsTyping.bind(this), 100, true);
        this.submitForm = this.submitForm.bind(this);
        this.triggerSubmitShortcut = this.triggerSubmitShortcut.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setIsFocused = this.setIsFocused.bind(this);
        this.showEmojiPicker = this.showEmojiPicker.bind(this);
        this.hideEmojiPicker = this.hideEmojiPicker.bind(this);
        this.addEmojiToTextBox = this.addEmojiToTextBox.bind(this);
        this.comment = props.comment;

        this.state = {
            isFocused: false,
            textInputShouldClear: false,
            isCommentEmpty: props.comment.length === 0,
            isPickerVisible: false,
        };
    }

    componentDidUpdate(prevProps) {
        // The first time the component loads the props is empty and the next time it may contain value.
        // If it does let's update this.comment so that it matches the defaultValue that we show in textInput.
        if (this.props.comment && prevProps.comment === '' && prevProps.comment !== this.props.comment) {
            this.comment = this.props.comment;
        }

        // When any modal goes from visible to hidden, bring focus to the compose field
        if (prevProps.modal.isVisible && !this.props.modal.isVisible) {
            this.setIsFocused(true);
        }
    }

    /**
     * Updates the Highlight state of the composer
     *
     * @param {Boolean} shouldHighlight
     */
    setIsFocused(shouldHighlight) {
        this.setState({isFocused: shouldHighlight});
        if (shouldHighlight && this.textInput) {
            this.textInput.focus();
        }
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
     * Save the location of a native press event.
     *
     * @param {Object} nativeEvent
     */
    capturePressLocation(nativeEvent) {
        this.popoverAnchorPosition = {
            horizontal: nativeEvent.pageX,
            vertical: nativeEvent.pageY,
        };
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    showEmojiPicker(event) {
        const nativeEvent = event.nativeEvent || {};
        this.capturePressLocation(nativeEvent);
        this.setState({isPickerVisible: true});
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hideEmojiPicker() {
        this.setState({isPickerVisible: false});
    }

    addEmojiToTextBox(emoji) {
        this.hideEmojiPicker();
        this.textInput.value += emoji;
        this.setIsFocused(true);
        this.updateComment(this.textInput.value);
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
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.preventDefault();

                                                // Do not open attachment picker from keypress event
                                                if (!e.key) {
                                                    openPicker({
                                                        onPicked: (file) => {
                                                            displayFileInModal({file});
                                                        },
                                                    });
                                                }
                                            }}
                                            style={[styles.chatItemAttachButton]}
                                            underlayColor={themeColors.componentBG}
                                        >
                                            <Icon src={Paperclip} />
                                        </TouchableOpacity>
                                    )}
                                </AttachmentPicker>
                                <TextInputFocusable
                                    multiline
                                    ref={el => this.textInput = el}
                                    textAlignVertical="top"
                                    placeholder="Write something..."
                                    placeholderTextColor={themeColors.textSupporting}
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
                    <PopoverWithMeasuredContent
                        isVisible={this.state.isPickerVisible}
                        onClose={this.hideEmojiPicker}
                        anchorPosition={this.popoverAnchorPosition}
                        animationIn="fadeIn"
                        anchorOrigin={
                            {
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                            }
                        }
                        measureContent={() => (
                            <EmojiPickerMenu
                                isVisible
                                addEmojiToTextBox={this.addEmojiToTextBox}
                            />
                        )}
                    >
                        <EmojiPickerMenu
                            isVisible={this.state.isPickerVisible}
                            addEmojiToTextBox={this.addEmojiToTextBox}
                        />
                    </PopoverWithMeasuredContent>
                    <TouchableOpacity
                        style={styles.chatItemEmojiButton}
                        onPress={this.showEmojiPicker}
                        underlayColor={themeColors.componentBG}
                    >
                        <Icon src={Emoji} />
                    </TouchableOpacity>
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
    }),
    withWindowDimensions,
)(ReportActionCompose);
