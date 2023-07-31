import lodashGet from 'lodash/get';
import React, {useState, useRef, useMemo, useEffect, useCallback} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import reportActionPropTypes from './reportActionPropTypes';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as StyleUtils from '../../../styles/StyleUtils';
import containerComposeStyles from '../../../styles/containerComposeStyles';
import Composer from '../../../components/Composer';
import * as Report from '../../../libs/actions/Report';
import setShouldShowComposeInputKeyboardAware from '../../../libs/setShouldShowComposeInputKeyboardAware';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Tooltip from '../../../components/Tooltip';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import reportPropTypes from '../../reportPropTypes';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import CONST from '../../../CONST';
import refPropTypes from '../../../components/refPropTypes';
import * as ComposerUtils from '../../../libs/ComposerUtils';
import * as ComposerActions from '../../../libs/actions/Composer';
import * as User from '../../../libs/actions/User';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import getButtonState from '../../../libs/getButtonState';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import useLocalize from '../../../hooks/useLocalize';
import useKeyboardState from '../../../hooks/useKeyboardState';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import useReportScrollManager from '../../../hooks/useReportScrollManager';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';

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
};

const defaultProps = {
    forwardedRef: () => {},
    report: {},
    shouldDisableEmojiPicker: false,
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
};

// native ids
const emojiButtonID = 'emojiButton';
const messageEditInput = 'messageEditInput';

function ReportActionItemMessageEdit(props) {
    const reportScrollManager = useReportScrollManager();
    const {translate} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [draft, setDraft] = useState(() => {
        if (props.draftMessage === props.action.message[0].html) {
            // We only convert the report action message to markdown if the draft message is unchanged.
            const parser = new ExpensiMark();
            return parser.htmlToMarkdown(props.draftMessage).trim();
        }
        // We need to decode saved draft message because it's escaped before saving.
        return Str.htmlDecode(props.draftMessage);
    });
    const [selection, setSelection] = useState({start: 0, end: 0});
    const [isFocused, setIsFocused] = useState(false);
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);

    const textInputRef = useRef(null);
    const isFocusedRef = useRef(false);
    const insertedEmojis = useRef([]);

    useEffect(() => {
        // required for keeping last state of isFocused variable
        isFocusedRef.current = isFocused;
    }, [isFocused]);

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

        return () => {
            // Skip if this is not the focused message so the other edit composer stays focused.
            // In small screen devices, when EmojiPicker is shown, the current edit message will lose focus, we need to check this case as well.
            if (!isFocusedRef.current && !EmojiPickerAction.isActiveReportAction(props.action.reportActionID)) {
                return;
            }

            // Show the main composer when the focused message is deleted from another client
            // to prevent the main composer stays hidden until we swtich to another chat.
            ComposerActions.setShouldShowComposeInput(true);
        };
    }, [props.action.reportActionID]);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            _.debounce((newDraft) => {
                Report.saveReportActionDraft(props.reportID, props.action.reportActionID, newDraft);
            }, 1000),
        [props.reportID, props.action.reportActionID],
    );

    /**
     * Update frequently used emojis list. We debounce this method in the constructor so that UpdateFrequentlyUsedEmojis
     * API is not called too often.
     */
    const debouncedUpdateFrequentlyUsedEmojis = useMemo(
        () =>
            _.debounce(() => {
                User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(insertedEmojis.current));
                insertedEmojis.current = [];
            }, 1000),
        [],
    );

    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} newDraftInput
     */
    const updateDraft = useCallback(
        (newDraftInput) => {
            const {text: newDraft = '', emojis = []} = EmojiUtils.replaceEmojis(newDraftInput, props.preferredSkinTone, props.preferredLocale);

            if (!_.isEmpty(emojis)) {
                insertedEmojis.current = [...insertedEmojis.current, ...emojis];
                debouncedUpdateFrequentlyUsedEmojis();
            }
            setDraft((prevDraft) => {
                if (newDraftInput !== newDraft) {
                    setSelection((prevSelection) => {
                        const remainder = prevDraft.slice(prevSelection.end).length;
                        return {
                            start: newDraft.length - remainder,
                            end: newDraft.length - remainder,
                        };
                    });
                }
                return newDraft;
            });

            // This component is rendered only when draft is set to a non-empty string. In order to prevent component
            // unmount when user deletes content of textarea, we set previous message instead of empty string.
            if (newDraft.trim().length > 0) {
                // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
                debouncedSaveDraft(_.escape(newDraft));
            } else {
                debouncedSaveDraft(props.action.message[0].html);
            }
        },
        [props.action.message, debouncedSaveDraft, debouncedUpdateFrequentlyUsedEmojis, props.preferredSkinTone, props.preferredLocale],
    );

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    const deleteDraft = useCallback(() => {
        debouncedSaveDraft.cancel();
        Report.saveReportActionDraft(props.reportID, props.action.reportActionID, '');
        if (isFocusedRef.current) {
            ComposerActions.setShouldShowComposeInput(true);
            ReportActionComposeFocusManager.focus();
        }

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (props.index === 0) {
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                reportScrollManager.scrollToIndex({animated: true, index: props.index}, false);
                keyboardDidHideListener.remove();
            });
        }
    }, [props.action.reportActionID, debouncedSaveDraft, props.index, props.reportID, reportScrollManager]);

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
            ReportActionContextMenu.showDeleteModal(props.reportID, props.action, false, deleteDraft, () => InteractionManager.runAfterInteractions(() => textInputRef.current.focus()));
            return;
        }
        Report.editReportComment(props.reportID, props.action, trimmedNewDraft);
        deleteDraft();
    }, [props.action, debouncedSaveDraft, deleteDraft, draft, props.reportID]);

    /**
     * @param {String} emoji
     */
    const addEmojiToTextBox = (emoji) => {
        setSelection((prevSelection) => ({
            start: prevSelection.start + emoji.length + CONST.SPACE_LENGTH,
            end: prevSelection.start + emoji.length + CONST.SPACE_LENGTH,
        }));
        updateDraft(ComposerUtils.insertText(draft, selection, `${emoji} `));
    };

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
                        <PressableWithFeedback
                            onPress={deleteDraft}
                            style={styles.chatItemSubmitButton}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            accessibilityLabel={translate('common.close')}
                            // disable dimming
                            hoverDimmingValue={1}
                            pressDimmingValue={1}
                            hoverStyle={StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.ACTIVE)}
                            pressStyle={StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)}
                            // Keep focus on the composer when cancel button is clicked.
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {({hovered, pressed}) => (
                                <Icon
                                    src={Expensicons.Close}
                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                />
                            )}
                        </PressableWithFeedback>
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
                    <View style={containerComposeStyles}>
                        <Composer
                            multiline
                            ref={(el) => {
                                textInputRef.current = el;
                                // eslint-disable-next-line no-param-reassign
                                props.forwardedRef.current = el;
                            }}
                            nativeID={messageEditInput}
                            onChangeText={updateDraft} // Debounced saveDraftComment
                            onKeyPress={triggerSaveOrCancel}
                            value={draft}
                            maxLines={isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES} // This is the same that slack has
                            style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]}
                            onFocus={() => {
                                setIsFocused(true);
                                reportScrollManager.scrollToIndex({animated: true, index: props.index}, true);
                                setShouldShowComposeInputKeyboardAware(false);
                            }}
                            onBlur={(event) => {
                                setIsFocused(false);
                                const relatedTargetId = lodashGet(event, 'nativeEvent.relatedTarget.id');
                                if (_.contains([messageEditInput, emojiButtonID], relatedTargetId)) {
                                    return;
                                }
                                setShouldShowComposeInputKeyboardAware(true);
                            }}
                            selection={selection}
                            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                        />
                    </View>
                    <View style={styles.editChatItemEmojiWrapper}>
                        <EmojiPickerButton
                            isDisabled={props.shouldDisableEmojiPicker}
                            onModalHide={() => InteractionManager.runAfterInteractions(() => textInputRef.current.focus())}
                            onEmojiSelected={addEmojiToTextBox}
                            reportAction={props.action}
                            nativeID={emojiButtonID}
                        />
                    </View>

                    <View style={styles.alignSelfEnd}>
                        <Tooltip text={translate('common.saveChanges')}>
                            <PressableWithFeedback
                                style={[styles.chatItemSubmitButton, hasExceededMaxCommentLength ? {} : styles.buttonSuccess]}
                                onPress={publishDraft}
                                disabled={hasExceededMaxCommentLength}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                accessibilityLabel={translate('common.saveChanges')}
                                hoverDimmingValue={1}
                                pressDimmingValue={0.2}
                                // Keep focus on the composer when save button is clicked.
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={hasExceededMaxCommentLength ? themeColors.icon : themeColors.textLight}
                                />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                </View>
            </View>
            <ExceededCommentLength
                comment={draft}
                onExceededMaxCommentLength={(hasExceeded) => setHasExceededMaxCommentLength(hasExceeded)}
            />
        </>
    );
}

ReportActionItemMessageEdit.propTypes = propTypes;
ReportActionItemMessageEdit.defaultProps = defaultProps;
ReportActionItemMessageEdit.displayName = 'ReportActionItemMessageEdit';

export default withLocalize(
    React.forwardRef((props, ref) => (
        <ReportActionItemMessageEdit
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
