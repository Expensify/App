import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import lodashDebounce from 'lodash/debounce';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import type {NativeSyntheticEvent, TextInput, TextInputFocusEventData, TextInputKeyPressEventData} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import Composer from '@components/Composer';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as ComposerUtils from '@libs/ComposerUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import onyxSubscribe from '@libs/onyxSubscribe';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import setShouldShowComposeInputKeyboardAware from '@libs/setShouldShowComposeInputKeyboardAware';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import * as InputFocus from '@userActions/InputFocus';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';

type ReportActionItemMessageEditProps = {
    /** All the data of the action */
    action: OnyxTypes.ReportAction;

    /** Draft message */
    draftMessage: string;

    /** ReportID that holds the comment we're editing */
    reportID: string;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** The report currently being looked at */
    // eslint-disable-next-line react/no-unused-prop-types
    report?: OnyxTypes.Report;

    /** Whether or not the emoji picker is disabled */
    shouldDisableEmojiPicker?: boolean;

    /** Stores user's preferred skin tone */
    preferredSkinTone?: number;
};

// native ids
const emojiButtonID = 'emojiButton';
const messageEditInput = 'messageEditInput';

const isMobileSafari = Browser.isMobileSafari();

function ReportActionItemMessageEdit(
    {action, draftMessage, reportID, index, shouldDisableEmojiPicker = false, preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE}: ReportActionItemMessageEditProps,
    forwardedRef: ForwardedRef<TextInput & HTMLTextAreaElement>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const reportScrollManager = useReportScrollManager();
    const {translate, preferredLocale} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const {isSmallScreenWidth} = useWindowDimensions();

    const getInitialDraft = () => {
        if (draftMessage === action?.message?.[0].html) {
            // We only convert the report action message to markdown if the draft message is unchanged.
            const parser = new ExpensiMark();
            return parser.htmlToMarkdown(draftMessage).trim();
        }
        // We need to decode saved draft message because it's escaped before saving.
        return Str.htmlDecode(draftMessage);
    };

    const getInitialSelection = () => {
        if (isMobileSafari) {
            return {start: 0, end: 0};
        }

        const length = getInitialDraft().length;
        return {start: length, end: length};
    };
    const emojisPresentBefore = useRef<Emoji[]>([]);
    const [draft, setDraft] = useState(() => {
        const initialDraft = getInitialDraft();
        if (initialDraft) {
            emojisPresentBefore.current = EmojiUtils.extractEmojis(initialDraft);
        }
        return initialDraft;
    });
    const [selection, setSelection] = useState<{
        start: number;
        end: number;
    }>(getInitialSelection);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {hasExceededMaxCommentLength, validateCommentMaxLength} = useHandleExceedMaxCommentLength();
    const [modal, setModal] = useState<OnyxTypes.Modal>({
        willAlertModalBecomeVisible: false,
        isVisible: false,
    });
    const [onyxFocused, setOnyxFocused] = useState<boolean>(false);

    const textInputRef = useRef<(HTMLTextAreaElement & TextInput) | null>(null);
    const isFocusedRef = useRef<boolean>(false);
    const insertedEmojis = useRef<Emoji[]>([]);
    const draftRef = useRef(draft);

    useEffect(() => {
        if (ReportActionsUtils.isDeletedAction(action) || (action.message && draftMessage === action.message[0].html)) {
            return;
        }
        setDraft(Str.htmlDecode(draftMessage));
    }, [draftMessage, action]);

    useEffect(() => {
        // required for keeping last state of isFocused variable
        isFocusedRef.current = isFocused;
    }, [isFocused]);

    useEffect(() => {
        InputFocus.composerFocusKeepFocusOn(textInputRef.current as HTMLElement, isFocused, modal, onyxFocused);
    }, [isFocused, modal, onyxFocused]);

    useEffect(() => {
        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                if (modalArg === null) {
                    return;
                }
                setModal(modalArg);
            },
        });

        const unsubscribeOnyxFocused = onyxSubscribe({
            key: ONYXKEYS.INPUT_FOCUSED,
            callback: (modalArg) => {
                if (modalArg === null) {
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
        () => isFocusedRef.current || EmojiPickerAction.isActive(action.reportActionID) || ReportActionContextMenu.isActiveReportAction(action.reportActionID),
        [action.reportActionID],
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
            if (textInputRef.current) {
                textInputRef.current.scrollTop = textInputRef.current.scrollHeight;
            }
        }

        return () => {
            InputFocus.callback(() => setIsFocused(false));
            InputFocus.inputFocusChange(false);

            // Skip if the current report action is not active
            if (!isActive()) {
                return;
            }

            if (EmojiPickerAction.isActive(action.reportActionID)) {
                EmojiPickerAction.clearActive();
            }
            if (ReportActionContextMenu.isActiveReportAction(action.reportActionID)) {
                ReportActionContextMenu.clearActiveReportAction();
            }

            // Show the main composer when the focused message is deleted from another client
            // to prevent the main composer stays hidden until we swtich to another chat.
            setShouldShowComposeInputKeyboardAware(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this cleanup needs to be called only on unmount
    }, [action.reportActionID]);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            lodashDebounce((newDraft: string) => {
                Report.saveReportActionDraft(reportID, action, newDraft);
            }, 1000),
        [reportID, action],
    );

    /**
     * Update frequently used emojis list. We debounce this method in the constructor so that UpdateFrequentlyUsedEmojis
     * API is not called too often.
     */
    const debouncedUpdateFrequentlyUsedEmojis = useMemo(
        () =>
            lodashDebounce(() => {
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
        (newDraftInput: string) => {
            const {text: newDraft, emojis, cursorPosition} = EmojiUtils.replaceAndExtractEmojis(newDraftInput, preferredSkinTone, preferredLocale);

            if (emojis?.length > 0) {
                const newEmojis = EmojiUtils.getAddedEmojis(emojis, emojisPresentBefore.current);
                if (newEmojis?.length > 0) {
                    insertedEmojis.current = [...insertedEmojis.current, ...newEmojis];
                    debouncedUpdateFrequentlyUsedEmojis();
                }
            }
            emojisPresentBefore.current = emojis;

            setDraft(newDraft);

            if (newDraftInput !== newDraft) {
                const position = Math.max(selection.end + (newDraft.length - draftRef.current.length), cursorPosition ?? 0);
                setSelection({
                    start: position,
                    end: position,
                });
            }

            draftRef.current = newDraft;

            // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
            debouncedSaveDraft(newDraft);
        },
        [debouncedSaveDraft, debouncedUpdateFrequentlyUsedEmojis, preferredSkinTone, preferredLocale, selection.end],
    );

    useEffect(() => {
        updateDraft(draft);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run this only when language is changed
    }, [action.reportActionID, preferredLocale]);

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    const deleteDraft = useCallback(() => {
        debouncedSaveDraft.cancel();
        Report.deleteReportActionDraft(reportID, action);

        if (isActive()) {
            ReportActionComposeFocusManager.clear();
            ReportActionComposeFocusManager.focus();
        }

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (index === 0) {
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                reportScrollManager.scrollToIndex(index, false);
                keyboardDidHideListener.remove();
            });
        }
    }, [action, debouncedSaveDraft, index, reportID, reportScrollManager, isActive]);

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
            textInputRef.current?.blur();
            ReportActionContextMenu.showDeleteModal(
                reportID,
                action,
                true,
                deleteDraft,
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                () => InteractionManager.runAfterInteractions(() => textInputRef.current?.focus()),
            );
            return;
        }
        Report.editReportComment(reportID, action, trimmedNewDraft);
        deleteDraft();
    }, [action, debouncedSaveDraft, deleteDraft, draft, reportID]);

    /**
     * @param emoji
     */
    const addEmojiToTextBox = (emoji: string) => {
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
        (e: NativeSyntheticEvent<TextInputKeyPressEventData> | KeyboardEvent) => {
            if (!e || ComposerUtils.canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown)) {
                return;
            }
            const keyEvent = e as KeyboardEvent;
            if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !keyEvent.shiftKey) {
                e.preventDefault();
                publishDraft();
            } else if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();
                deleteDraft();
            }
        },
        [deleteDraft, isKeyboardShown, isSmallScreenWidth, publishDraft],
    );

    useEffect(() => {
        validateCommentMaxLength(draft);
    }, [draft, validateCommentMaxLength]);

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
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                                // disable dimming
                                hoverDimmingValue={1}
                                pressDimmingValue={1}
                                // Keep focus on the composer when cancel button is clicked.
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <Icon
                                    fill={theme.icon}
                                    src={Expensicons.Close}
                                />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                    <View style={[StyleUtils.getContainerComposeStyles(), styles.textInputComposeBorder]}>
                        <Composer
                            multiline
                            ref={(el: TextInput & HTMLTextAreaElement) => {
                                textInputRef.current = el;
                                if (typeof forwardedRef === 'function') {
                                    forwardedRef(el);
                                } else if (forwardedRef) {
                                    // eslint-disable-next-line no-param-reassign
                                    forwardedRef.current = el;
                                }
                            }}
                            id={messageEditInput}
                            onChangeText={updateDraft} // Debounced saveDraftComment
                            onKeyPress={triggerSaveOrCancel}
                            value={draft}
                            maxLines={isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES} // This is the same that slack has
                            style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]}
                            onFocus={() => {
                                setIsFocused(true);
                                reportScrollManager.scrollToIndex(index, true);
                                setShouldShowComposeInputKeyboardAware(false);

                                // Clear active report action when another action gets focused
                                if (!EmojiPickerAction.isActive(action.reportActionID)) {
                                    EmojiPickerAction.clearActive();
                                }
                                if (!ReportActionContextMenu.isActiveReportAction(action.reportActionID)) {
                                    ReportActionContextMenu.clearActiveReportAction();
                                }
                            }}
                            onBlur={(event: NativeSyntheticEvent<TextInputFocusEventData>) => {
                                setIsFocused(false);
                                // @ts-expect-error TODO: TextInputFocusEventData doesn't contain relatedTarget.
                                const relatedTargetId = event.nativeEvent?.relatedTarget?.id;
                                if (relatedTargetId && [messageEditInput, emojiButtonID].includes(relatedTargetId)) {
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
                            isDisabled={shouldDisableEmojiPicker}
                            onEmojiSelected={addEmojiToTextBox}
                            id={emojiButtonID}
                            emojiPickerID={action.reportActionID}
                        />
                    </View>

                    <View style={styles.alignSelfEnd}>
                        <Tooltip text={translate('common.saveChanges')}>
                            <PressableWithFeedback
                                style={[styles.chatItemSubmitButton, hasExceededMaxCommentLength ? {} : styles.buttonSuccess]}
                                onPress={publishDraft}
                                disabled={hasExceededMaxCommentLength}
                                role={CONST.ROLE.BUTTON}
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
            {hasExceededMaxCommentLength && <ExceededCommentLength />}
        </>
    );
}

ReportActionItemMessageEdit.displayName = 'ReportActionItemMessageEdit';

export default forwardRef(ReportActionItemMessageEdit);
