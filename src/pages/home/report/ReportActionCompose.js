import React from 'react';
import PropTypes from 'prop-types';
import {View, Image, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import styles, {colors} from '../../../styles/StyleSheet';
import TextInputFocusable from '../../../components/TextInputFocusable';
import sendIcon from '../../../../assets/images/icon-send.png';
import ONYXKEYS from '../../../ONYXKEYS';
import paperClipIcon from '../../../../assets/images/icon-paper-clip.png';
import AttachmentPicker from '../../../components/AttachmentPicker';
import {addAction, saveReportComment, broadcastUserIsTyping} from '../../../libs/actions/Report';
import ReportTypingIndicator from './ReportTypingIndicator';

const propTypes = {
    // A method to call when the form is submitted
    onSubmit: PropTypes.func.isRequired,

    // The comment left by the user
    comment: PropTypes.string,

    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,
};

const defaultProps = {
    comment: '',
};

class ReportActionCompose extends React.Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
        this.debouncedSaveReportComment = _.debounce(this.debouncedSaveReportComment.bind(this), 1000, false);
        this.debouncedBroadcastUserIsTyping = _.debounce(() => broadcastUserIsTyping(props.reportID), 100, true);
        this.submitForm = this.submitForm.bind(this);
        this.triggerSubmitShortcut = this.triggerSubmitShortcut.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setIsFocused = this.setIsFocused.bind(this);
        this.comment = '';
        this.state = {
            isFocused: false,
            textInputShouldClear: false
        };
    }

    componentDidUpdate(prevProps) {
        // The first time the component loads the props is empty and the next time it may contain value.
        // If it does let's update this.comment so that it matches the defaultValue that we show in textInput.
        if (this.props.comment && prevProps.comment === '' && prevProps.comment !== this.props.comment) {
            this.comment = this.props.comment;
        }
    }

    /**
     * Updates the Highlight state of the composer
     *
     * @param {boolean} shouldHighlight
     */
    setIsFocused(shouldHighlight) {
        this.setState({isFocused: shouldHighlight});
    }

    /**
     * Updates the should clear state of the composer
     *
     * @param {boolean} shouldClear
     */
    setTextInputShouldClear(shouldClear) {
        this.setState({textInputShouldClear: shouldClear});
    }

    /**
     * Save our report comment in Onyx. We debounce this method in the constructor so that it's not called too often
     * to update Onyx and re-render this component.
     *
     * @param {string} comment
     */
    debouncedSaveReportComment(comment) {
        saveReportComment(this.props.reportID, comment || '');
    }

    /**
     * Update the value of the comment in Onyx
     *
     * @param {string} newComment
     */
    updateComment(newComment) {
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
        return (
            <View style={[styles.chatItemCompose]}>
                <View style={[
                    this.state.isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                    styles.chatItemComposeBox,
                    styles.flexRow
                ]}
                >
                    <AttachmentPicker>
                        {({openPicker}) => (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.preventDefault();
                                    openPicker({
                                        onPicked: (file) => {
                                            addAction(this.props.reportID, '', file);
                                            this.setTextInputShouldClear(true);
                                        },
                                    });
                                }}
                                style={[styles.chatItemAttachButton]}
                                underlayColor={colors.componentBG}
                            >
                                <Image
                                    style={[styles.chatItemSubmitButtonIcon]}
                                    resizeMode="contain"
                                    source={paperClipIcon}
                                />
                            </TouchableOpacity>
                        )}
                    </AttachmentPicker>
                    <TextInputFocusable
                        multiline
                        ref={el => this.textInput = el}
                        textAlignVertical="top"
                        placeholder="Write something..."
                        placeholderTextColor={colors.textSupporting}
                        onChangeText={this.updateComment}
                        onKeyPress={this.triggerSubmitShortcut}
                        style={[styles.textInput, styles.textInputCompose, styles.flex4]}
                        defaultValue={this.props.comment || ''}
                        maxLines={16} // This is the same that slack has
                        onFocus={() => this.setIsFocused(true)}
                        onBlur={() => this.setIsFocused(false)}
                        shouldClear={this.state.textInputShouldClear}
                        onClear={() => this.setTextInputShouldClear(false)}
                    />
                    <TouchableOpacity
                        style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                        onPress={this.submitForm}
                        underlayColor={colors.componentBG}
                    >
                        <Image
                            resizeMode="contain"
                            style={[styles.chatItemSubmitButtonIcon]}
                            source={sendIcon}
                        />
                    </TouchableOpacity>
                </View>
                <ReportTypingIndicator reportID={this.props.reportID} />
            </View>
        );
    }
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default withOnyx({
    comment: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
    },
})(ReportActionCompose);
