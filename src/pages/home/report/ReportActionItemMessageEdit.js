import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import styles from '../../../styles/styles';
import TextInputFocusable from '../../../components/TextInputFocusable';
import {editReportComment, saveReportActionDraft} from '../../../libs/actions/Report';
import {scrollToIndex} from '../../../libs/ReportScrollManager';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Draft message
    draftMessage: PropTypes.string.isRequired,

    // ReportID that holds the comment we're editing
    reportID: PropTypes.number.isRequired,

    // Position index of the report action in the overall report FlatList view
    index: PropTypes.number.isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,
};

class ReportActionItemMessageEdit extends React.Component {
    constructor(props) {
        super(props);
        this.updateDraft = this.updateDraft.bind(this);
        this.deleteDraft = this.deleteDraft.bind(this);
        this.debouncedSaveDraft = _.debounce(this.debouncedSaveDraft.bind(this), 1000, true);
        this.publishDraft = this.publishDraft.bind(this);
        this.triggerSaveOrCancel = this.triggerSaveOrCancel.bind(this);

        this.state = {
            draft: this.props.draftMessage,
        };
    }

    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} newDraft
     */
    updateDraft(newDraft) {
        const trimmedNewDraft = newDraft.trim();
        this.setState({draft: trimmedNewDraft});
        this.debouncedSaveDraft(trimmedNewDraft);
    }

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    deleteDraft() {
        saveReportActionDraft(this.props.reportID, this.props.action.reportActionID, '');
        toggleReportActionComposeView(true, this.props.isSmallScreenWidth);
    }

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     */
    debouncedSaveDraft() {
        saveReportActionDraft(this.props.reportID, this.props.action.reportActionID, this.state.draft);
    }

    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    publishDraft() {
        editReportComment(this.props.reportID, this.props.action, this.state.draft);
        this.deleteDraft();
    }

    /**
     * Key event handlers that short cut to saving/canceling.
     *
     * @param {Event} e
     */
    triggerSaveOrCancel(e) {
        if (e && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.publishDraft();
        } else if (e && e.key === 'Escape') {
            e.preventDefault();
            this.deleteDraft();
        }
    }

    render() {
        return (
            <View style={styles.chatItemMessage}>
                <TextInputFocusable
                    multiline
                    onChangeText={this.updateDraft} // Debounced saveDraftComment
                    onKeyPress={this.triggerSaveOrCancel}
                    defaultValue={this.props.draftMessage}
                    maxLines={16} // This is the same that slack has
                    style={[styles.textInput, styles.flex0]}
                    onFocus={() => {
                        scrollToIndex({animated: true, index: this.props.index}, true);
                        toggleReportActionComposeView(false);
                    }}
                    autoFocus
                />
                <View style={[styles.flexRow, styles.mt1]}>
                    <Pressable style={[styles.button, styles.mr2]} onPress={this.deleteDraft}>
                        <Text style={styles.buttonText}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.buttonSuccess]} onPress={this.publishDraft}>
                        <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                            Save Changes
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }
}

ReportActionItemMessageEdit.propTypes = propTypes;
export default withWindowDimensions(ReportActionItemMessageEdit);
