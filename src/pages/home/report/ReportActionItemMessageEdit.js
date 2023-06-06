/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import React, {useState, useRef, useMemo, useEffect, useCallback} from 'react';
// eslint-disable-next-line no-restricted-imports
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
import refPropTypes from '../../../components/refPropTypes';
import * as ComposerUtils from '../../../libs/ComposerUtils';
import * as ComposerActions from '../../../libs/actions/Composer';
import * as User from '../../../libs/actions/User';

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
    forwardedRef: refPropTypes,

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

function ReportActionItemMessageEdit(props) {
    const {action, draftMessage, forwardedRef, index, isKeyboardShown, isSmallScreenWidth, preferredSkinTone, reportID, shouldDisableEmojiPicker, translate} = props;

    const [draft, setDraft] = useState(() => {
        if (draftMessage === action.message[0].html) {
            // We only convert the report action message to markdown if the draft message is unchanged.
            const parser = new ExpensiMark();
            return parser.htmlToMarkdown(draftMessage).trim();
        }
        // We need to decode saved draft message because it's escaped before saving.
        return Str.htmlDecode(draftMessage);
    });
    const [selection, setSelection] = useState({start: 0, end: 0});
    const [isFocused, setIsFocused] = useState(false);
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);

    const textInputRef = useRef(null);

    // native ids
    const saveButtonID = 'saveButton';
    const cancelButtonID = 'cancelButton';
    const emojiButtonID = 'emojiButton';
    const messageEditInput = 'messageEditInput';

    useEffect(() => {
        // For mobile Safari, updating the selection prop on an unfocused input will cause it to automatically gain focus
        // and subsequent programmatic focus shifts (e.g., modal focus trap) to show the blue frame (:focus-visible style),
        // so we need to ensure that it is only updated after focus.
        setDraft((prevDraft) => {
            setSelection({
                start: prevDraft.length,
                end: prevDraft.length,
            });
            return prevDraft;
        });
    }, []);

    useEffect(
        () => () => {
            // Skip if this is not the focused message so the other edit composer stays focused.
            if (!isFocused) {
                return;
            }

            // Show the main composer when the focused message is deleted from another client
            // to prevent the main composer stays hidden until we swtich to another chat.
            ComposerActions.setShouldShowComposeInput(true);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- for willUnmount lifecycle
        [],
    );

    /**
     * Update Selection on change cursor position.
     *
     * @param {Event} e
     */
    const onSelectionChange = useCallback((e) => {
        setSelection(e.nativeEvent.selection);
    }, []);

    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     *
     * @param {Boolean} hasExceeded
     */
    const setExceededMaxCommentLength = useCallback((hasExceeded) => {
        setHasExceededMaxCommentLength(hasExceeded);
    }, []);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            _.debounce((newDraft) => {
                Report.saveReportActionDraft(reportID, action.reportActionID, newDraft);
            }, 1000),
        [reportID, action.reportActionID],
    );

    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} newDraftValue
     */
    const updateDraft = useCallback(
        (newDraftValue) => {
            const {text: newDraft = '', emojis = []} = EmojiUtils.replaceEmojis(newDraftValue, isSmallScreenWidth, preferredSkinTone);

            if (!_.isEmpty(emojis)) {
                User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(emojis));
            }
            if (newDraftValue !== newDraft) {
                setSelection((prevSelection) => {
                    const remainder = draft.slice(prevSelection.end).length;
                    return {
                        start: newDraft.length - remainder,
                        end: newDraft.length - remainder,
                    };
                });
            }
            setDraft(newDraft);

            // This component is rendered only when draft is set to a non-empty string. In order to prevent component
            // unmount when user deletes content of textarea, we set previous message instead of empty string.
            if (newDraft.trim().length > 0) {
                // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
                debouncedSaveDraft(_.escape(newDraft));
            } else {
                debouncedSaveDraft(action.message[0].html);
            }
        },
        [action.message, draft, debouncedSaveDraft, isSmallScreenWidth, preferredSkinTone],
    );

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    const deleteDraft = useCallback(() => {
        debouncedSaveDraft.cancel();
        Report.saveReportActionDraft(reportID, action.reportActionID, '');
        ComposerActions.setShouldShowComposeInput(true);
        ReportActionComposeFocusManager.focus();

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (index === 0) {
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                ReportScrollManager.scrollToIndex({animated: true, index}, false);
                keyboardDidHideListener.remove();
            });
        }
    }, [action.reportActionID, debouncedSaveDraft, index, reportID]);

    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    const publishDraft = useCallback(() => {
        // Do nothing if draft exceed the character limit
        if (ReportUtils.getCommentLength(draft) > CONST.MAX_COMMENT_LENGTH) {
            return;
        }

        // To prevent re-mount after user saves edit before debounce duration (example: within 1 second), we cancel
        // debounce here.
        debouncedSaveDraft.cancel();

        const trimmedNewDraft = draft.trim();

        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            ReportActionContextMenu.showDeleteModal(reportID, action, false, deleteDraft, () => InteractionManager.runAfterInteractions(() => textInputRef.current.focus()));
            return;
        }
        Report.editReportComment(reportID, action, trimmedNewDraft);
        deleteDraft();
    }, [action, debouncedSaveDraft, deleteDraft, draft, reportID]);

    /**
     * @param {String} emoji
     */
    const addEmojiToTextBox = useCallback(
        (emoji) => {
            setSelection((prevSelection) => ({
                start: prevSelection.start + emoji.length,
                end: prevSelection.start + emoji.length,
            }));
            updateDraft(ComposerUtils.insertText(draft, selection, emoji));
        },
        [draft, selection, updateDraft],
    );

    /**
     * Key event handlers that short cut to saving/canceling.
     *
     * @param {Event} e
     */
    const triggerSaveOrCancel = useCallback(
        (e) => {
            if (!e || ComposerUtils.canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown)) {
                return;
            }
            if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
                e.preventDefault();
                publishDraft();
            } else if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();
                deleteDraft();
            }
        },
        [deleteDraft, isKeyboardShown, isSmallScreenWidth, publishDraft],
    );

    return (
        <>
            <View style={[styles.chatItemMessage, styles.flexRow]}>
                <View style={[styles.justifyContentEnd]}>
                    <Tooltip text={translate('common.cancel')}>
                        <Pressable
                            style={({hovered, pressed}) => [styles.chatItemSubmitButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                            nativeID={cancelButtonID}
                            onPress={deleteDraft}
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
                        isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
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
                                textInputRef.current = el;
                                forwardedRef.current = el;
                            }}
                            nativeID={messageEditInput}
                            onChangeText={updateDraft} // Debounced saveDraftComment
                            onKeyPress={triggerSaveOrCancel}
                            value={draft}
                            maxLines={isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES} // This is the same that slack has
                            style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]}
                            onFocus={() => {
                                setIsFocused(true);
                                ReportScrollManager.scrollToIndex({animated: true, index}, true);
                                ComposerActions.setShouldShowComposeInput(false);
                            }}
                            onBlur={(event) => {
                                setIsFocused(false);
                                const relatedTargetId = lodashGet(event, 'nativeEvent.relatedTarget.id');

                                // Return to prevent re-render when save/cancel button is pressed which cancels the onPress event by re-rendering
                                if (_.contains([saveButtonID, cancelButtonID, emojiButtonID], relatedTargetId)) {
                                    return;
                                }

                                if (messageEditInput === relatedTargetId) {
                                    return;
                                }
                                openReportActionComposeViewWhenClosingMessageEdit();
                            }}
                            selection={selection}
                            onSelectionChange={onSelectionChange}
                        />
                    </View>
                    <View style={styles.editChatItemEmojiWrapper}>
                        <EmojiPickerButton
                            isDisabled={shouldDisableEmojiPicker}
                            onModalHide={() => InteractionManager.runAfterInteractions(() => textInputRef.current.focus())}
                            onEmojiSelected={addEmojiToTextBox}
                            nativeID={emojiButtonID}
                        />
                    </View>

                    <View style={styles.alignSelfEnd}>
                        <Tooltip text={translate('common.saveChanges')}>
                            <TouchableOpacity
                                style={[styles.chatItemSubmitButton, hasExceededMaxCommentLength ? {} : styles.buttonSuccess]}
                                onPress={publishDraft}
                                hitSlop={{
                                    top: 3,
                                    right: 3,
                                    bottom: 3,
                                    left: 3,
                                }}
                                nativeID={saveButtonID}
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
                comment={draft}
                onExceededMaxCommentLength={setExceededMaxCommentLength}
            />
        </>
    );
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
