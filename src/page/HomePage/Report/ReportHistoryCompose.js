import React from 'react';
import PropTypes from 'prop-types';
import {View, TextInput, Button} from 'react-native';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // A method to call when the form is submitted
    onSubmit: PropTypes.func.isRequired,
};

class ReportHistoryCompose extends React.Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.triggerSubmitShortcut = this.triggerSubmitShortcut.bind(this);

        this.state = {
            comment: '',
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    componentDidUpdate() {
        this.textInput.focus();
    }

    /**
     * Update the value of the comment input in the state
     *
     * @param {SyntheticEvent} e
     */
    updateComment(e) {
        this.setState({
            comment: e.target.value,
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

        // Don't submit empty commentes
        // @TODO show an error in the UI
        if (!this.state.comment) {
            return;
        }

        this.props.onSubmit(this.state.comment);
        this.setState({
            comment: '',
        });
    }

    render() {
        return (
            <View style={[styles.mt2]}>
                <TextInput
                    ref={el => this.textInput = el}
                    multiline
                    textAlignVertical
                    numberOfLines={3}
                    onChange={this.updateComment}
                    onKeyPress={this.triggerSubmitShortcut}
                    style={[styles.textInput]}
                    value={this.state.comment}
                />
                <View style={[styles.mt1, styles.flexRow]}>
                    <Button title="Send" onPress={this.submitForm} />
                </View>
            </View>
        );
    }
}
ReportHistoryCompose.propTypes = propTypes;

export default ReportHistoryCompose;
