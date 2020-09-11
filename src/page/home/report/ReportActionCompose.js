import React from 'react';
import PropTypes from 'prop-types';
import {View, Image, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import styles, {colors} from '../../../style/StyleSheet';
import TextInputFocusable from '../../../components/TextInputFocusable';
import sendIcon from '../../../../assets/images/icon-send.png';
import IONKEYS from '../../../IONKEYS';
import paperClipIcon from '../../../../assets/images/icon-paper-clip.png';
import CONFIG from '../../../CONFIG';
import openURLInNewTab from '../../../lib/openURLInNewTab';
import withIon from '../../../components/withIon';
import {saveReportComment} from '../../../lib/actions/Report';


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
        this.submitForm = this.submitForm.bind(this);
        this.triggerSubmitShortcut = this.triggerSubmitShortcut.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.comment = '';
    }

    componentDidUpdate(prevProps) {
        if (this.props.comment && prevProps.comment === '' && prevProps.comment !== this.props.comment) {
            this.comment = this.props.comment;
        }
    }

    /**
     * Save our report comment in Ion. We debounce this method in the constructor so that it's not called too often
     * to update Ion and re-render this component.
     *
     * @param {string} comment
     */
    debouncedSaveReportComment(comment) {
        saveReportComment(this.props.reportID, comment || '');
    }

    /**
     * Update the value of the comment in Ion
     *
     * @param {string} newComment
     */
    updateComment(newComment) {
        this.comment = newComment;
        this.debouncedSaveReportComment(newComment);
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

        // Let's get the data directly from textInput because saving the data in Ion report comment is asynchronous
        // so if we refer this.props.comment here we won't get the most recent value if the user types fast.
        const trimmedComment = this.comment.trim();

        // Don't submit empty comments
        // @TODO show an error in the UI
        if (!trimmedComment) {
            return;
        }

        this.props.onSubmit(trimmedComment);
        this.textInput.clear();
        this.updateComment('');
    }

    render() {
        const href = `${CONFIG.PUSHER.AUTH_URL}/report?reportID=${this.props.reportID}&shouldScrollToLastUnread=true`;
        return (
            <View style={[styles.chatItemCompose]}>
                <View style={[styles.chatItemComposeBox, styles.flexRow]}>
                    <TouchableOpacity
                        onPress={() => openURLInNewTab(href)}
                        style={[styles.chatItemAttachButton]}
                        underlayColor={colors.componentBG}
                    >
                        <Image
                            style={[styles.chatItemSubmitButtonIcon]}
                            resizeMode="contain"
                            source={paperClipIcon}
                        />
                    </TouchableOpacity>
                    <TextInputFocusable
                        multiline
                        textAlignVertical="top"
                        placeholder="Write something..."
                        ref={el => this.textInput = el}
                        placeholderTextColor={colors.textSupporting}
                        onChangeText={this.updateComment}
                        onKeyPress={this.triggerSubmitShortcut}
                        style={[styles.textInput, styles.textInputCompose, styles.flex4]}
                        defaultValue={this.props.comment || ''}
                        maxLines={16} // This is the same that slack has
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
            </View>
        );
    }
}
ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default withIon({
    comment: {
        key: `${IONKEYS.REPORT_DRAFT_COMMENT}_%DATAFROMPROPS%`,
        pathForProps: 'reportID',
    },
})(ReportActionCompose);
