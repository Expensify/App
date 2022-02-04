import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import reportActionPropTypes from './reportActionPropTypes';
import styles from '../../../styles/styles';
import TextInputFocusable from '../../../components/TextInputFocusable';
import * as Report from '../../../libs/actions/Report';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import compose from '../../../libs/compose';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import * as ReportUtils from '../../../libs/reportUtils';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Draft message */
    draftMessage: PropTypes.string.isRequired,

    /** ReportID that holds the comment we're editing */
    reportID: PropTypes.number.isRequired,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,

    /** The report currently being looked at */
    report: PropTypes.shape({

        /** participants associated with current report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),


    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /** Localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    report: {},
    blockedFromConcierge: {},

};

class ReportActionItemMessageEdit extends React.Component {
    constructor(props) {
        super(props);
        this.updateDraft = this.updateDraft.bind(this);
        this.deleteDraft = this.deleteDraft.bind(this);
        this.debouncedSaveDraft = _.debounce(this.debouncedSaveDraft.bind(this), 1000);
        this.publishDraft = this.publishDraft.bind(this);
        this.triggerSaveOrCancel = this.triggerSaveOrCancel.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.addEmojiToTextBox = this.addEmojiToTextBox.bind(this);

        const parser = new ExpensiMark();
        const draftMessage = parser.htmlToMarkdown(this.props.draftMessage);

        this.state = {
            draft: draftMessage,
            selection: {
                start: draftMessage.length,
                end: draftMessage.length,
            },
        };
    }

    /**
     * Update Selection on change cursor position.
     *
     * @param {Event} e
     */
    onSelectionChange(e) {
        this.setState({selection: e.nativeEvent.selection});
    }

    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} newDraft
     */
    updateDraft(newDraft) {
        this.textInput.setNativeProps({text: newDraft});
        this.setState({draft: newDraft});

        // This component is rendered only when draft is set to a non-empty string. In order to prevent component
        // unmount when user deletes content of textarea, we set previous message instead of empty string.
        if (newDraft.trim().length > 0) {
            this.debouncedSaveDraft(newDraft);
        } else {
            this.debouncedSaveDraft(this.props.action.message[0].html);
        }
    }

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    deleteDraft() {
        this.debouncedSaveDraft.cancel();
        Report.saveReportActionDraft(this.props.reportID, this.props.action.reportActionID, '');
        toggleReportActionComposeView(true, this.props.isSmallScreenWidth);
        ReportActionComposeFocusManager.focus();
    }

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */

    debouncedSaveDraft(newDraft) {
        Report.saveReportActionDraft(this.props.reportID, this.props.action.reportActionID, newDraft);
    }

    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    publishDraft() {
        // To prevent re-mount after user saves edit before debounce duration (example: within 1 second), we cancel
        // debounce here.
        this.debouncedSaveDraft.cancel();

        const trimmedNewDraft = this.state.draft.trim();
        Report.editReportComment(this.props.reportID, this.props.action, trimmedNewDraft);
        this.deleteDraft();
    }

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     */
    addEmojiToTextBox(emoji) {
        const newComment = this.state.draft.slice(0, this.state.selection.start)
            + emoji + this.state.draft.slice(this.state.selection.end, this.state.draft.length);
        this.setState(prevState => ({
            selection: {
                start: prevState.selection.start + emoji.length,
                end: prevState.selection.start + emoji.length,
            },
        }));
        this.updateDraft(newComment);
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
        const isBlockedFromConcierge = ReportUtils.isBlockedFromConciergeChat(this.props.report, this.props.blockedFromConcierge);
        const isArchivedChatRoom = ReportUtils.isArchivedRoom(this.props.report);

        return (
            <View style={styles.chatItemMessage}>
                <View style={[styles.chatItemComposeBox, styles.flexRow, styles.chatItemComposeBoxColor]}>
                    <TextInputFocusable
                        multiline
                        ref={(el) => {
                            this.textInput = el;
                            this.props.forwardedRef(el);
                        }}
                        onChangeText={this.updateDraft} // Debounced saveDraftComment
                        onKeyPress={this.triggerSaveOrCancel}
                        defaultValue={this.state.draft}
                        maxLines={16} // This is the same that slack has
                        style={[styles.textInputCompose, styles.flex4]}
                        onFocus={() => {
                            ReportScrollManager.scrollToIndex({animated: true, index: this.props.index}, true);
                            toggleReportActionComposeView(false);
                        }}
                        selection={this.state.selection}
                        onSelectionChange={this.onSelectionChange}
                    />
                    <EmojiPickerButton
                        isDisabled={isArchivedChatRoom || isBlockedFromConcierge}
                        onModalHide={() => this.textInput.focus()}
                        onEmojiSelected={this.addEmojiToTextBox}
                    />
                </View>
                <View style={[styles.flexRow, styles.mt1]}>
                    <Button
                        small
                        style={[styles.mr2]}
                        onPress={this.deleteDraft}
                        text={this.props.translate('common.cancel')}
                    />
                    <Button
                        small
                        success
                        style={[styles.mr2]}
                        onPress={this.publishDraft}
                        text={this.props.translate('common.saveChanges')}
                    />
                </View>
            </View>
        );
    }
}

ReportActionItemMessageEdit.propTypes = propTypes;
ReportActionItemMessageEdit.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withWindowDimensions,
)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <ReportActionItemMessageEdit {...props} forwardedRef={ref} />
)));
