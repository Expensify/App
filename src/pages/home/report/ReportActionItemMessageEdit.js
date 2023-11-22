import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import _ from 'underscore';
import Composer from '@components/Composer';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import refPropTypes from '@components/refPropTypes';
import Tooltip from '@components/Tooltip';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as ComposerUtils from '@libs/ComposerUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import onyxSubscribe from '@libs/onyxSubscribe';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import setShouldShowComposeInputKeyboardAware from '@libs/setShouldShowComposeInputKeyboardAware';
import reportPropTypes from '@pages/reportPropTypes';
import containerComposeStyles from '@styles/containerComposeStyles';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import * as InputFocus from '@userActions/InputFocus';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import reportActionPropTypes from './reportActionPropTypes';

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

const isMobileSafari = Browser.isMobileSafari();

function ReportActionItemMessageEdit(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const reportScrollManager = useReportScrollManager();
    const {translate, preferredLocale} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const {isSmallScreenWidth} = useWindowDimensions();

    const getInitialDraft = () => {
        if (props.draftMessage === props.action.message[0].html) {
            // We only convert the report action message to markdown if the draft message is unchanged.
            const parser = new ExpensiMark();
            return parser.htmlToMarkdown(props.draftMessage).trim();
        }
        // We need to decode saved draft message because it's escaped before saving.
        return Str.htmlDecode(props.draftMessage);
    };

    const getInitialSelection = () => {
        if (isMobileSafari) {
            return {start: 0, end: 0};
        }

        const length = getInitialDraft().length;
        return {start: length, end: length};
    };
    const emojisPresentBefore = useRef([]);
    const [draft, setDraft] = useState(() => {
        const initialDraft = getInitialDraft();
        if (initialDraft) {
            emojisPresentBefore.current = EmojiUtils.extractEmojis(initialDraft);
        }
        return initialDraft;
    });
    const [selection, setSelection] = useState(getInitialSelection);
    const [isFocused, setIsFocused] = useState(false);
    const [hasExceededMaxCommentLength, setHasExceededMaxCommentLength] = useState(false);
    const [modal, setModal] = useState(false);
    const [onyxFocused, setOnyxFocused] = useState(false);

    const textInputRef = useRef(null);
    const isFocusedRef = useRef(false);
    const insertedEmojis = useRef([]);
    const draftRef = useRef(draft);

    useEffect(() => {
        if (ReportActionsUtils.isDeletedAction(props.action) || props.draftMessage === props.action.message[0].html) {
            return;
        }
        setDraft(Str.htmlDecode(props.draftMessage));
    }, [props.draftMessage, props.action]);

    useEffect(() => {
        // required for keeping last state of isFocused variable
        isFocusedRef.current = isFocused;
    }, [isFocused]);

    useEffect(() => {
        InputFocus.composerFocusKeepFocusOn(textInputRef.current, isFocused, modal, onyxFocused);
    }, [isFocused, modal, onyxFocused]);

    useEffect(() => {
        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                if (_.isNull(modalArg)) {
                    return;
                }
                setModal(modalArg);
            },
        });

        const unsubscribeOnyxFocused = onyxSubscribe({
            key: ONYXKEYS.INPUT_FOCUSED,
            callback: (modalArg) => {
                if (_.isNull(modalArg)) {
                    return;
                }
                setOnyxFocused(modalArg);
            },
        });
        return () => {
            unsubscribeOnyxModal();
            unsubscribeOnyxFocused();
        };
    }, []);

    // We consider the report action active if it's focused, its emoji picker is open or its context menu is open
    const isActive = useCallback(
        () => isFocusedRef.current || EmojiPickerAction.isActive(props.action.reportActionID) || ReportActionContextMenu.isActiveReportAction(props.action.reportActionID),
        [props.action.reportActionID],
    );

    useEffect(() => {
        // For mobile Safari, updating the selection prop on an unfocused input will cause it to automatically gain focus
        // and subsequent programmatic focus shifts (e.g., modal focus trap) to show the blue frame (:focus-visible style),
        // so we need to ensure that it is only updated after focus.
        if (isMobileSafari) {
            setDraft((prevDraft) => {
                setSelection({
                    start: prevDraft.length,
                    end: prevDraft.length,
                });
                return prevDraft;
            });

            // Scroll content of textInputRef to bottom
            textInputRef.current.scrollTop = textInputRef.current.scrollHeight;
        }

        return () => {
            // Skip if the current report action is not active
            if (!isActive()) {
                return;
            }

            if (EmojiPickerAction.isActive(props.action.reportActionID)) {
                EmojiPickerAction.clearActive();
            }
            if (ReportActionContextMenu.isActiveReportAction(props.action.reportActionID)) {
                ReportActionContextMenu.clearActiveReportAction();
            }

            // Show the main composer when the focused message is deleted from another client
            // to prevent the main composer stays hidden until we swtich to another chat.
            setShouldShowComposeInputKeyboardAware(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this cleanup needs to be called only on unmount
    }, [props.action.reportActionID]);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            _.debounce((newDraft) => {
                Report.saveReportActionDraft(props.reportID, props.action, newDraft);
            }, 1000),
        [props.reportID, props.action],
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
            const {text: newDraft, emojis, cursorPosition} = EmojiUtils.replaceAndExtractEmojis(newDraftInput, props.preferredSkinTone, preferredLocale);

            if (!_.isEmpty(emojis)) {
                const newEmojis = EmojiUtils.getAddedEmojis(emojis, emojisPresentBefore.current);
                if (!_.isEmpty(newEmojis)) {
                    insertedEmojis.current = [...insertedEmojis.current, ...newEmojis];
                    debouncedUpdateFrequentlyUsedEmojis();
                }
            }
            emojisPresentBefore.current = emojis;

            setDraft(newDraft);

            if (newDraftInput !== newDraft) {
                const position = Math.max(selection.end + (newDraft.length - draftRef.current.length), cursorPosition || 0);
                setSelection({
                    start: position,
                    end: position,
                });
            }

            draftRef.current = newDraft;

            // This component is rendered only when draft is set to a non-empty string. In order to prevent component
            // unmount when user deletes content of textarea, we set previous message instead of empty string.
            if (newDraft.trim().length > 0) {
                // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
                debouncedSaveDraft(_.escape(newDraft));
            } else {
                debouncedSaveDraft(props.action.message[0].html);
            }
        },
        [props.action.message, debouncedSaveDraft, debouncedUpdateFrequentlyUsedEmojis, props.preferredSkinTone, preferredLocale, selection.end],
    );

    useEffect(() => {
        updateDraft(draft);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run this only when language is changed
    }, [props.action.reportActionID, preferredLocale]);

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    const deleteDraft = useCallback(() => {
        InputFocus.callback(() => setIsFocused(false));
        InputFocus.inputFocusChange(false);
        debouncedSaveDraft.cancel();
        Report.saveReportActionDraft(props.reportID, props.action, '');

        if (isActive()) {
            ReportActionComposeFocusManager.clear();
            ReportActionComposeFocusManager.focus();
        }

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (props.index === 0) {
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                reportScrollManager.scrollToIndex(props.index, false);
                keyboardDidHideListener.remove();
            });
        }
    }, [props.action, debouncedSaveDraft, props.index, props.reportID, reportScrollManager, isActive]);

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
            textInputRef.current.blur();
            ReportActionContextMenu.showDeleteModal(props.reportID, props.action, true, deleteDraft, () => InteractionManager.runAfterInteractions(() => textInputRef.current.focus()));
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

    /**
     * Focus the composer text input
     */
    const focus = focusComposerWithDelay(textInputRef.current);

    return (
        <>
            <View style={[styles.chatItemMessage, styles.flexRow]}>
                <View
                    style={[
                        isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                        styles.flexRow,
                        styles.flex1,
                        styles.chatItemComposeBox,
                        hasExceededMaxCommentLength && styles.borderColorDanger,
                    ]}
                >
                    <View style={[styles.justifyContentEnd, styles.mb1]}>
                        <Tooltip text={translate('common.cancel')}>
                            <PressableWithFeedback
                                onPress={deleteDraft}
                                style={styles.composerSizeButton}
                                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                                // disable dimming
                                hoverDimmingValue={1}
                                pressDimmingValue={1}
                                // Keep focus on the composer when cancel button is clicked.
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <Icon src={Expensicons.Close} />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                    <View style={[containerComposeStyles, styles.textInputComposeBorder]}>
                        <Composer
                            multiline
                            ref={(el) => {
                                ReportActionComposeFocusManager.editComposerRef.current = el;
                                textInputRef.current = el;
                                // eslint-disable-next-line no-param-reassign
                                props.forwardedRef.current = el;
                            }}
                            id={messageEditInput}
                            onChangeText={updateDraft} // Debounced saveDraftComment
                            onKeyPress={triggerSaveOrCancel}
                            value={draft}
                            maxLines={isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES} // This is the same that slack has
                            style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]}
                            onFocus={() => {
                                setIsFocused(true);
                                reportScrollManager.scrollToIndex(props.index, true);
                                setShouldShowComposeInputKeyboardAware(false);

                                // Clear active report action when another action gets focused
                                if (!EmojiPickerAction.isActive(props.action.reportActionID)) {
                                    EmojiPickerAction.clearActive();
                                }
                                if (!ReportActionContextMenu.isActiveReportAction(props.action.reportActionID)) {
                                    ReportActionContextMenu.clearActiveReportAction();
                                }
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
                            onModalHide={() => focus(true)}
                            onEmojiSelected={addEmojiToTextBox}
                            id={emojiButtonID}
                            emojiPickerID={props.action.reportActionID}
                        />
                    </View>

                    <View style={styles.alignSelfEnd}>
                        <Tooltip text={translate('common.saveChanges')}>
                            <PressableWithFeedback
                                style={[styles.chatItemSubmitButton, hasExceededMaxCommentLength ? {} : styles.buttonSuccess]}
                                onPress={publishDraft}
                                disabled={hasExceededMaxCommentLength}
                                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                accessibilityLabel={translate('common.saveChanges')}
                                hoverDimmingValue={1}
                                pressDimmingValue={0.2}
                                // Keep focus on the composer when send button is clicked.
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={hasExceededMaxCommentLength ? theme.icon : theme.textLight}
                                />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                </View>
            </View>
            <ExceededCommentLength
                comment={draft}
                reportID={props.reportID}
                onExceededMaxCommentLength={(hasExceeded) => setHasExceededMaxCommentLength(hasExceeded)}
            />
        </>
    );
}

ReportActionItemMessageEdit.propTypes = propTypes;
ReportActionItemMessageEdit.defaultProps = defaultProps;
ReportActionItemMessageEdit.displayName = 'ReportActionItemMessageEdit';

const ReportActionItemMessageEditWithRef = React.forwardRef((props, ref) => (
    <ReportActionItemMessageEdit
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

ReportActionItemMessageEditWithRef.displayName = 'ReportActionItemMessageEditWithRef';

export default ReportActionItemMessageEditWithRef;
