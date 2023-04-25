/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import React from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {withOnyx} from 'react-native-onyx';
import reportActionPropTypes from './reportActionPropTypes';
import styles from '../../../styles/styles';
import Composer from '../../../components/Composer';
import * as Report from '../../../libs/actions/Report';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import openReportActionComposeViewWhenClosingMessageEdit from '../../../libs/openReportActionComposeViewWhenClosingMessageEdit';
import Button from '../../../components/Button';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import compose from '../../../libs/compose';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import reportPropTypes from '../../reportPropTypes';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import CONST from '../../../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withKeyboardState, {keyboardStatePropTypes} from '../../../components/withKeyboardState';
import ONYXKEYS from '../../../ONYXKEYS';
import * as ComposerUtils from '../../../libs/ComposerUtils';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Draft message */
    draftMessage: PropTypes.string.isRequired,

    /** Number of lines for the draft message */
    numberOfLines: PropTypes.number,

    /** ReportID that holds the comment we're editing */
    reportID: PropTypes.string.isRequired,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,

    /** The report currently being looked at */
    // eslint-disable-next-line react/no-unused-prop-types
    report: reportPropTypes,

    /** Whether or not the emoji picker is disabled */
    shouldDisableEmojiPicker: PropTypes.bool,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    ...keyboardStatePropTypes,
};

const defaultProps = {
    forwardedRef: () => {},
    report: {},
    shouldDisableEmojiPicker: false,
    numberOfLines: undefined,
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
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
        this.setExceededMaxCommentLength = this.setExceededMaxCommentLength.bind(this);
        this.updateNumberOfLines = this.updateNumberOfLines.bind(this);
        this.saveButtonID = 'saveButton';
        this.cancelButtonID = 'cancelButton';
        this.emojiButtonID = 'emojiButton';
        this.messageEditInput = 'messageEditInput';

        const parser = new ExpensiMark();
        const draftMessage = parser.htmlToMarkdown(this.props.draftMessage).trim();

        this.state = {
            draft: draftMessage,
            selection: {
                start: draftMessage.length,
                end: draftMessage.length,
            },
            isFocused: false,
            hasExceededMaxCommentLength: false,
        };
    }

    componentWillUnmount() {
        // Skip if this is not the focused message so the other edit composer stays focused.
        if (!this.state.isFocused) {
            return;
        }

        // Show the main composer when the focused message is deleted from another client
        // to prevent the main composer stays hidden until we swtich to another chat.
        toggleReportActionComposeView(true, this.props.isSmallScreenWidth);
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
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     *
     * @param {Boolean} hasExceededMaxCommentLength
     */
    setExceededMaxCommentLength(hasExceededMaxCommentLength) {
        this.setState({hasExceededMaxCommentLength});
    }

    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} draft
     */
    updateDraft(draft) {
        const newDraft = EmojiUtils.replaceEmojis(draft, this.props.isSmallScreenWidth, this.props.preferredSkinTone);
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
     * Update the number of lines for a draft in Onyx
     * @param {Number} numberOfLines
     */
    updateNumberOfLines(numberOfLines) {
        Report.saveReportActionDraftNumberOfLines(this.props.reportID, this.props.action.reportActionID, numberOfLines);
    }

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    deleteDraft() {
        this.debouncedSaveDraft.cancel();
        Report.saveReportActionDraft(this.props.reportID, this.props.action.reportActionID, '');
        toggleReportActionComposeView(true, this.props.isSmallScreenWidth);
        ReportActionComposeFocusManager.focus();

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
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
        if (ReportUtils.getCommentLength(this.state.draft) > CONST.MAX_COMMENT_LENGTH) {
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
        this.setState(prevState => ({
            selection: {
                start: prevState.selection.start + emoji.length,
                end: prevState.selection.start + emoji.length,
            },
        }));
        this.updateDraft(ComposerUtils.insertText(this.state.draft, this.state.selection, emoji));
    }

    /**
     * Key event handlers that short cut to saving/canceling.
     *
     * @param {Event} e
     */
    triggerSaveOrCancel(e) {
        // Do not trigger actions for mobileWeb or native clients that have the keyboard open because for those devices, we want the return key to insert newlines rather than submit the form
        if (!e || this.props.isSmallScreenWidth || this.props.isKeyboardShown) {
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
        const hasExceededMaxCommentLength = this.state.hasExceededMaxCommentLength;
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
                        nativeID={this.messageEditInput}
                        onChangeText={this.updateDraft} // Debounced saveDraftComment
                        onKeyPress={this.triggerSaveOrCancel}
                        value={this.state.draft}
                        maxLines={16} // This is the same that slack has
                        style={[styles.textInputCompose, styles.flex4, styles.editInputComposeSpacing]}
                        onFocus={() => {
                            this.setState({isFocused: true});
                            ReportScrollManager.scrollToIndex({animated: true, index: this.props.index}, true);
                            toggleReportActionComposeView(false, this.props.isSmallScreenWidth);
                        }}
                        onBlur={(event) => {
                            this.setState({isFocused: false});
                            const relatedTargetId = lodashGet(event, 'nativeEvent.relatedTarget.id');

                            // Return to prevent re-render when save/cancel button is pressed which cancels the onPress event by re-rendering
                            if (_.contains([this.saveButtonID, this.cancelButtonID, this.emojiButtonID], relatedTargetId)) {
                                return;
                            }

                            if (this.messageEditInput === relatedTargetId) {
                                return;
                            }
                            openReportActionComposeViewWhenClosingMessageEdit(this.props.isSmallScreenWidth);
                        }}
                        selection={this.state.selection}
                        onSelectionChange={this.onSelectionChange}
                        numberOfLines={this.props.numberOfLines}
                        onNumberOfLinesChange={this.updateNumberOfLines}
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
                    <ExceededCommentLength comment={this.state.draft} onExceededMaxCommentLength={this.setExceededMaxCommentLength} />
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
    withKeyboardState,
    withOnyx({
        numberOfLines: {
            key: ({reportID, action}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}_${action.reportActionID}`,
            initWithStoredValues: false,
        },
    }),
)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <ReportActionItemMessageEdit {...props} forwardedRef={ref} />
)));
