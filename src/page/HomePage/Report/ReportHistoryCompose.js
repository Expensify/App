import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../../../style/StyleSheet';
import TextInputFocusable from '../../../components/TextInputFocusable';

const propTypes = {
    // A method to call when the form is submitted
    onSubmit: PropTypes.func.isRequired,

    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,
};

class ReportHistoryCompose extends React.Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.triggerSubmitShortcut = this.triggerSubmitShortcut.bind(this);
        this.submitForm = this.submitForm.bind(this);

        this.state = {
            comment: '',
        };
    }

    /**
     * Update the value of the comment input in the state
     *
     * @param {string} newComment
     */
    updateComment(newComment) {
        this.setState({
            comment: newComment,
        });
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

        // Don't submit empty comments
        // @TODO show an error in the UI
        if (!this.state.comment) {
            return;
        }

        this.props.onSubmit(this.props.reportID, this.state.comment);
        this.setState({
            comment: '',
        });
    }

    render() {
        return (
            <View style={[styles.chatItemCompose, styles.flexRow]}>
                <TextInputFocusable
                    multiline
                    textAlignVertical="top"
                    numberOfLines={1}
                    minHeight={40}
                    maxHeight={60}
                    placeholder="Write something..."
                    placeholderTextColor="#7D8B8F"
                    onChangeText={this.updateComment}
                    onKeyPress={this.triggerSubmitShortcut}
                    style={[styles.textInput, styles.flex4]}
                    value={this.state.comment}
                />
                <TouchableOpacity
                    style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                    onPress={this.submitForm}
                    underlayColor="#fff"
                >
                    <Text style={[styles.buttonText, styles.buttonSuccessText]}>Send</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
ReportHistoryCompose.propTypes = propTypes;

export default ReportHistoryCompose;
