/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import React from 'react';
import {InteractionManager, Keyboard, Pressable, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import reportActionPropTypes from './reportActionPropTypes';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as StyleUtils from '../../../styles/StyleUtils';
import Composer from '../../../components/Composer';
import * as Report from '../../../libs/actions/Report';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import openReportActionComposeViewWhenClosingMessageEdit from '../../../libs/openReportActionComposeViewWhenClosingMessageEdit';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import compose from '../../../libs/compose';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Tooltip from '../../../components/Tooltip';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import getButtonState from '../../../libs/getButtonState';
import reportPropTypes from '../../reportPropTypes';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import CONST from '../../../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withKeyboardState, {keyboardStatePropTypes} from '../../../components/withKeyboardState';
import * as ComposerUtils from '../../../libs/ComposerUtils';

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
        this.saveButtonID = 'saveButton';
        this.cancelButtonID = 'cancelButton';
        this.emojiButtonID = 'emojiButton';
        this.messageEditInput = 'messageEditInput';

        let draftMessage;
        if (this.props.draftMessage === this.props.action.message[0].html) {
            // We only convert the report action message to markdown if the draft message is unchanged.
            const parser = new ExpensiMark();
            draftMessage = parser.htmlToMarkdown(this.props.draftMessage).trim();
        } else {
            // We need to decode saved draft message because it's escaped before saving.
            draftMessage = Str.htmlDecode(this.props.draftMessage);
        }

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
            // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
            this.debouncedSaveDraft(_.escape(newDraft));
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
            ReportActionContextMenu.showDeleteModal(this.props.reportID, this.props.action, false, this.deleteDraft, () =>
                InteractionManager.runAfterInteractions(() => this.textInput.focus()),
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
        this.setState((prevState) => ({
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
        if (!e || ComposerUtils.canSkipTriggerHotkeys(this.props.isSmallScreenWidth, this.props.isKeyboardShown)) {
            return;
        }
        if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
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
            <>
                <View style={[styles.chatItemMessage, styles.flexRow]}>
                    <View style={[styles.justifyContentEnd]}>
                        <Tooltip text={this.props.translate('common.cancel')}>
                            <Pressable
                                style={({hovered, pressed}) => [styles.chatItemSubmitButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                                nativeID={this.cancelButtonID}
                                onPress={this.deleteDraft}
                                hitSlop={{
                                    top: 3,
                                    right: 3,
                                    bottom: 3,
                                    left: 3,
                                }}
                            >
                                {({hovered, pressed}) => (
                                    <Icon
                                        src={Expensicons.Close}
                                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                    />
                                )}
                            </Pressable>
                        </Tooltip>
                    </View>
                    <View
                        style={[
                            this.state.isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                            styles.flexRow,
                            styles.flex1,
                            styles.chatItemComposeBox,
                            hasExceededMaxCommentLength && styles.borderColorDanger,
                        ]}
                    >
                        <View style={styles.textInputComposeSpacing}>
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
                                style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]}
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
                            />
                        </View>
                        <View style={styles.editChatItemEmojiWrapper}>
                            <EmojiPickerButton
                                isDisabled={this.props.shouldDisableEmojiPicker}
                                onModalHide={() => InteractionManager.runAfterInteractions(() => this.textInput.focus())}
                                onEmojiSelected={this.addEmojiToTextBox}
                                nativeID={this.emojiButtonID}
                            />
                        </View>

                        <View style={styles.alignSelfEnd}>
                            <Tooltip text={this.props.translate('common.saveChanges')}>
                                <TouchableOpacity
                                    style={[styles.chatItemSubmitButton, hasExceededMaxCommentLength ? {} : styles.buttonSuccess]}
                                    onPress={this.publishDraft}
                                    hitSlop={{
                                        top: 3,
                                        right: 3,
                                        bottom: 3,
                                        left: 3,
                                    }}
                                    nativeID={this.saveButtonID}
                                    disabled={hasExceededMaxCommentLength}
                                >
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={hasExceededMaxCommentLength ? themeColors.icon : themeColors.textLight}
                                    />
                                </TouchableOpacity>
                            </Tooltip>
                        </View>
                    </View>
                </View>
                <ExceededCommentLength
                    comment={this.state.draft}
                    onExceededMaxCommentLength={this.setExceededMaxCommentLength}
                />
            </>
        );
    }
}

ReportActionItemMessageEdit.propTypes = propTypes;
ReportActionItemMessageEdit.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withWindowDimensions,
    withKeyboardState,
)(
    React.forwardRef((props, ref) => (
        <ReportActionItemMessageEdit
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
