import lodashGet from 'lodash/get';
import React from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import reportActionPropTypes from './reportActionPropTypes';
import styles from '../../../styles/styles';
import Composer from '../../../components/Composer';
import * as Report from '../../../libs/actions/Report';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import compose from '../../../libs/compose';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import VirtualKeyboard from '../../../libs/VirtualKeyboard';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import reportPropTypes from '../../reportPropTypes';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import CONST from '../../../CONST';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Draft message */
    draftMessage: PropTypes.string.isRequired,

    /** ReportID that holds the comment we're editing */
    reportID: PropTypes.string.isRequired,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,

    /** The report currently being looked at */
    // eslint-disable-next-line react/no-unused-prop-types
    report: reportPropTypes,

    // Whether or not the emoji picker is disabled
    shouldDisableEmojiPicker: PropTypes.bool,

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /** Localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    report: {},
    shouldDisableEmojiPicker: false,
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
        this.saveButtonID = 'saveButton';
        this.cancelButtonID = 'cancelButton';
        this.emojiButtonID = 'emojiButton';

        const parser = new ExpensiMark();
        const draftMessage = parser.htmlToMarkdown(this.props.draftMessage);

        this.state = {
            draft: draftMessage,
            selection: {
                start: draftMessage.length,
                end: draftMessage.length,
            },
            isFocused: false,
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
     * @param {String} draft
     */
    updateDraft(draft) {
        const newDraft = EmojiUtils.replaceEmojis(draft);
        this.setState((prevState) => {
            const newState = {draft: newDraft};
            if (draft !== newDraft) {
                const remainder = prevState.draft.slice(prevState.selection.end).length;
                newState.selection = {
                    start: newDraft.length - remainder,
                    end: newDraft.length - remainder,
                };
            }
            return newState;
        });

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

        // The listener below scrolls to the last comment once the keyboard is hidden to make sure the comment is not hidden and
        // does not go outside the viewable area in the scroll view. This only applies to the last/latest comment in the report.
        if (this.props.index === 0) {
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                ReportScrollManager.scrollToIndex({animated: true, index: this.props.index}, false);
                keyboardDidHideListener.remove();
            });
        }
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
        // Do nothing if draft exceed the character limit
        if (this.state.draft.length > CONST.MAX_COMMENT_LENGTH) {
            return;
        }

        // To prevent re-mount after user saves edit before debounce duration (example: within 1 second), we cancel
        // debounce here.
        this.debouncedSaveDraft.cancel();

        const trimmedNewDraft = this.state.draft.trim();

        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            ReportActionContextMenu.showDeleteModal(
                this.props.reportID,
                this.props.action,
                false,
                this.deleteDraft,
                () => InteractionManager.runAfterInteractions(() => this.textInput.focus()),
            );
            return;
        }
        Report.editReportComment(this.props.reportID, this.props.action, trimmedNewDraft);
        this.deleteDraft();
    }

    /**
     * @param {String} emoji
     */
    addEmojiToTextBox(emoji) {
        const emojiWithSpace = `${emoji} `;
        const newComment = this.state.draft.slice(0, this.state.selection.start)
            + emojiWithSpace + this.state.draft.slice(this.state.selection.end, this.state.draft.length);
        this.setState(prevState => ({
            selection: {
                start: prevState.selection.start + emojiWithSpace.length,
                end: prevState.selection.start + emojiWithSpace.length,
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
        if (!e || VirtualKeyboard.shouldAssumeIsOpen()) {
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.publishDraft();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.deleteDraft();
        }
    }

    render() {
        const hasExceededMaxCommentLength = this.state.draft.length > CONST.MAX_COMMENT_LENGTH;
        return (
            <View style={styles.chatItemMessage}>
                <View
                    style={[
                        styles.chatItemComposeBox,
                        styles.flexRow,
                        this.state.isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                        hasExceededMaxCommentLength && styles.borderColorDanger,
                    ]}
                >
                    <Composer
                        multiline
                        ref={(el) => {
                            this.textInput = el;
                            this.props.forwardedRef(el);
                        }}
                        onChangeText={this.updateDraft} // Debounced saveDraftComment
                        onKeyPress={this.triggerSaveOrCancel}
                        value={this.state.draft}
                        maxLines={16} // This is the same that slack has
                        style={[styles.textInputCompose, styles.flex4, styles.editInputComposeSpacing]}
                        onFocus={() => {
                            this.setState({isFocused: true});
                            ReportScrollManager.scrollToIndex({animated: true, index: this.props.index}, true);
                            toggleReportActionComposeView(false, VirtualKeyboard.shouldAssumeIsOpen());
                        }}
                        onBlur={(event) => {
                            // Return to prevent re-render when save/cancel button is pressed which cancels the onPress event by re-rendering
                            if (_.contains([this.saveButtonID, this.cancelButtonID, this.emojiButtonID], lodashGet(event, 'nativeEvent.relatedTarget.id'))) {
                                return;
                            }
                            this.setState({isFocused: false});
                            toggleReportActionComposeView(true, VirtualKeyboard.shouldAssumeIsOpen());
                        }}
                        selection={this.state.selection}
                        onSelectionChange={this.onSelectionChange}
                    />
                    <View style={styles.editChatItemEmojiWrapper}>
                        <EmojiPickerButton
                            isDisabled={this.props.shouldDisableEmojiPicker}
                            onModalHide={() => InteractionManager.runAfterInteractions(() => this.textInput.focus())}
                            onEmojiSelected={this.addEmojiToTextBox}
                            nativeID={this.emojiButtonID}
                        />
                    </View>

                </View>
                <View style={[styles.flexRow, styles.mt1]}>
                    <Button
                        small
                        style={[styles.mr2]}
                        nativeID={this.cancelButtonID}
                        onPress={this.deleteDraft}
                        text={this.props.translate('common.cancel')}
                    />
                    <Button
                        small
                        success
                        isDisabled={hasExceededMaxCommentLength}
                        nativeID={this.saveButtonID}
                        style={[styles.mr2]}
                        onPress={this.publishDraft}
                        text={this.props.translate('common.saveChanges')}
                    />
                    <ExceededCommentLength commentLength={this.state.draft.length} />
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
