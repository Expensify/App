import lodashDebounce from 'lodash/debounce';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {findNodeHandle, InteractionManager, Keyboard, View} from 'react-native';
import type {MeasureInWindowOnSuccessCallback, NativeSyntheticEvent, TextInput, TextInputFocusEventData, TextInputKeyPressEventData, TextInputScrollEventData} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import {useOnyx} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {TextSelection} from '@components/Composer/types';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ComposerUtils from '@libs/ComposerUtils';
import DomUtils from '@libs/DomUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import type {Selection} from '@libs/focusComposerWithDelay/types';
import focusEditAfterCancelDelete from '@libs/focusEditAfterCancelDelete';
import onyxSubscribe from '@libs/onyxSubscribe';
import Parser from '@libs/Parser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import reportActionItemEventHandler from '@libs/ReportActionItemEventHandler';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import setShouldShowComposeInputKeyboardAware from '@libs/setShouldShowComposeInputKeyboardAware';
import * as ComposerActions from '@userActions/Composer';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import * as InputFocus from '@userActions/InputFocus';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import getCursorPosition from './ReportActionCompose/getCursorPosition';
import getScrollPosition from './ReportActionCompose/getScrollPosition';
import type {SuggestionsRef} from './ReportActionCompose/ReportActionCompose';
import Suggestions from './ReportActionCompose/Suggestions';
import shouldUseEmojiPickerSelection from './shouldUseEmojiPickerSelection';

type ReportActionItemMessageEditProps = {
    /** All the data of the action */
    action: OnyxTypes.ReportAction;

    /** Draft message */
    draftMessage: string;

    /** ReportID that holds the comment we're editing */
    reportID: string;

    /** PolicyID of the policy the report belongs to */
    policyID?: string;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Whether or not the emoji picker is disabled */
    shouldDisableEmojiPicker?: boolean;

    /** Whether report is from group policy */
    isGroupPolicyReport: boolean;
};

const shouldUseForcedSelectionRange = shouldUseEmojiPickerSelection();

// video source -> video attributes
const draftMessageVideoAttributeCache = new Map<string, string>();

function ReportActionItemMessageEdit(
    {action, draftMessage, reportID, policyID, index, isGroupPolicyReport, shouldDisableEmojiPicker = false}: ReportActionItemMessageEditProps,
    forwardedRef: ForwardedRef<TextInput | HTMLTextAreaElement | undefined>,
) {
    const [preferredSkinTone] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE});
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const containerRef = useRef<View>(null);
    const reportScrollManager = useReportScrollManager();
    const {translate, preferredLocale} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const prevDraftMessage = usePrevious(draftMessage);
    const suggestionsRef = useRef<SuggestionsRef>(null);
    const mobileInputScrollPosition = useRef(0);
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);
    const isInitialMount = useRef(true);
    const emojisPresentBefore = useRef<Emoji[]>([]);
    const [draft, setDraft] = useState(() => {
        if (draftMessage) {
            emojisPresentBefore.current = EmojiUtils.extractEmojis(draftMessage);
        }
        return draftMessage;
    });
    const [selection, setSelection] = useState<TextSelection>({start: draft.length, end: draft.length, positionX: 0, positionY: 0});
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {hasExceededMaxCommentLength, validateCommentMaxLength} = useHandleExceedMaxCommentLength();
    const debouncedValidateCommentMaxLength = useMemo(() => lodashDebounce(validateCommentMaxLength, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME), [validateCommentMaxLength]);
    const [modal, setModal] = useState<OnyxTypes.Modal>({
        willAlertModalBecomeVisible: false,
        isVisible: false,
    });
    const [onyxFocused, setOnyxFocused] = useState<boolean>(false);

    const textInputRef = useRef<(HTMLTextAreaElement & TextInput) | null>(null);
    const isFocusedRef = useRef<boolean>(false);
    const draftRef = useRef(draft);
    const emojiPickerSelectionRef = useRef<Selection | undefined>(undefined);
    // The ref to check whether the comment saving is in progress
    const isCommentPendingSaved = useRef(false);

    useEffect(() => {
        draftMessageVideoAttributeCache.clear();

        const originalMessage = Parser.htmlToMarkdown(ReportActionsUtils.getReportActionHtml(action), {
            cacheVideoAttributes: (videoSource, attrs) => draftMessageVideoAttributeCache.set(videoSource, attrs),
        });
        if (ReportActionsUtils.isDeletedAction(action) || !!(action.message && draftMessage === originalMessage) || !!(prevDraftMessage === draftMessage || isCommentPendingSaved.current)) {
            return;
        }
        setDraft(draftMessage);
    }, [draftMessage, action, prevDraftMessage]);

    useEffect(() => {
        InputFocus.composerFocusKeepFocusOn(textInputRef.current as HTMLElement, isFocused, modal, onyxFocused);
    }, [isFocused, modal, onyxFocused]);

    useEffect(() => {
        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                if (modalArg === undefined) {
                    return;
                }
                setModal(modalArg);
            },
        });

        const unsubscribeOnyxFocused = onyxSubscribe({
            key: ONYXKEYS.INPUT_FOCUSED,
            callback: (modalArg) => {
                if (modalArg === undefined) {
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

    useEffect(
        // Remove focus callback on unmount to avoid stale callbacks
        () => {
            if (textInputRef.current) {
                ReportActionComposeFocusManager.editComposerRef.current = textInputRef.current;
            }
            return () => {
                if (ReportActionComposeFocusManager.editComposerRef.current !== textInputRef.current) {
                    return;
                }
                ReportActionComposeFocusManager.clear(true);
            };
        },
        [],
    );

    // We consider the report action active if it's focused, its emoji picker is open or its context menu is open
    const isActive = useCallback(
        () => isFocusedRef.current || EmojiPickerAction.isActive(action.reportActionID) || ReportActionContextMenu.isActiveReportAction(action.reportActionID),
        [action.reportActionID],
    );

    /**
     * Focus the composer text input
     * @param shouldDelay - Impose delay before focusing the composer
     */
    const focus = useCallback((shouldDelay = false, forcedSelectionRange?: Selection) => {
        focusComposerWithDelay(textInputRef.current)(shouldDelay, forcedSelectionRange);
    }, []);

    // Take over focus priority
    const setUpComposeFocusManager = useCallback(() => {
        ReportActionComposeFocusManager.onComposerFocus(() => {
            focus(true, emojiPickerSelectionRef.current ? {...emojiPickerSelectionRef.current} : undefined);
        }, true);
    }, [focus]);

    useEffect(
        () => {
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
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
                // to prevent the main composer stays hidden until we switch to another chat.
                setShouldShowComposeInputKeyboardAware(true);
            };
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- this cleanup needs to be called only on unmount
        [action.reportActionID],
    );

    // show the composer after editing is complete for devices that hide the composer during editing.
    useEffect(() => () => ComposerActions.setShouldShowComposeInput(true), []);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            // eslint-disable-next-line react-compiler/react-compiler
            lodashDebounce((newDraft: string) => {
                Report.saveReportActionDraft(reportID, action, newDraft);
                isCommentPendingSaved.current = false;
            }, 1000),
        [reportID, action],
    );

    useEffect(
        () => () => {
            debouncedSaveDraft.cancel();
            isCommentPendingSaved.current = false;
        },
        [debouncedSaveDraft],
    );

    /**
     * Update the value of the draft in Onyx
     *
     * @param {String} newDraftInput
     */
    const updateDraft = useCallback(
        (newDraftInput: string) => {
            const {text: newDraft, emojis, cursorPosition} = EmojiUtils.replaceAndExtractEmojis(newDraftInput, preferredSkinTone, preferredLocale);

            emojisPresentBefore.current = emojis;

            setDraft(newDraft);

            if (newDraftInput !== newDraft) {
                const position = Math.max((selection?.end ?? 0) + (newDraft.length - draftRef.current.length), cursorPosition ?? 0);
                setSelection({
                    start: position,
                    end: position,
                    positionX: 0,
                    positionY: 0,
                });
            }

            draftRef.current = newDraft;

            // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
            debouncedSaveDraft(newDraft);
            isCommentPendingSaved.current = true;
        },
        [debouncedSaveDraft, preferredSkinTone, preferredLocale, selection.end],
    );

    useEffect(() => {
        updateDraft(draft);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- run this only when language is changed
    }, [action.reportActionID, preferredLocale]);

    /**
     * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
     */
    const deleteDraft = useCallback(() => {
        Report.deleteReportActionDraft(reportID, action);

        if (isActive()) {
            ReportActionComposeFocusManager.clear(true);
            // Wait for report action compose re-mounting on mWeb
            InteractionManager.runAfterInteractions(() => ReportActionComposeFocusManager.focus());
        }

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (index === 0) {
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                reportScrollManager.scrollToIndex(index, false);
                keyboardDidHideListener.remove();
            });
        }
    }, [action, index, reportID, reportScrollManager, isActive]);

    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    const publishDraft = useCallback(() => {
        // Do nothing if draft exceed the character limit
        if (ReportUtils.getCommentLength(draft, {reportID}) > CONST.MAX_COMMENT_LENGTH) {
            return;
        }

        const trimmedNewDraft = draft.trim();

        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            textInputRef.current?.blur();
            ReportActionContextMenu.showDeleteModal(reportID, action, true, deleteDraft, () => focusEditAfterCancelDelete(textInputRef.current));
            return;
        }
        Report.editReportComment(reportID, action, trimmedNewDraft, Object.fromEntries(draftMessageVideoAttributeCache));
        deleteDraft();
    }, [action, deleteDraft, draft, reportID]);

    /**
     * @param emoji
     */
    const addEmojiToTextBox = (emoji: string) => {
        const newSelection = {
            start: selection.start + emoji.length + CONST.SPACE_LENGTH,
            end: selection.start + emoji.length + CONST.SPACE_LENGTH,
            positionX: 0,
            positionY: 0,
        };
        setSelection(newSelection);

        if (shouldUseForcedSelectionRange) {
            // On Android and Chrome mobile, focusing the input sets the cursor position back to the start.
            // To fix this, immediately set the selection again after focusing the input.
            emojiPickerSelectionRef.current = newSelection;
        }
        updateDraft(ComposerUtils.insertText(draft, selection, `${emoji} `));
    };

    const hideSuggestionMenu = useCallback(() => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, [suggestionsRef]);
    const onSaveScrollAndHideSuggestionMenu = useCallback(
        (e: NativeSyntheticEvent<TextInputScrollEventData>) => {
            mobileInputScrollPosition.current = e?.nativeEvent?.contentOffset?.y ?? 0;

            hideSuggestionMenu();
        },
        [hideSuggestionMenu],
    );

    /**
     * Key event handlers that short cut to saving/canceling.
     *
     * @param {Event} e
     */
    const triggerSaveOrCancel = useCallback(
        (e: NativeSyntheticEvent<TextInputKeyPressEventData> | KeyboardEvent) => {
            if (!e || ComposerUtils.canSkipTriggerHotkeys(shouldUseNarrowLayout, isKeyboardShown)) {
                return;
            }
            const keyEvent = e as KeyboardEvent;
            const isSuggestionsMenuVisible = suggestionsRef.current?.getIsSuggestionsMenuVisible();

            if (isSuggestionsMenuVisible) {
                suggestionsRef.current?.triggerHotkeyActions(keyEvent);
                return;
            }
            if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey && isSuggestionsMenuVisible) {
                e.preventDefault();
                hideSuggestionMenu();
                return;
            }
            if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !keyEvent.shiftKey) {
                e.preventDefault();
                publishDraft();
            } else if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();
                deleteDraft();
            }
        },
        [deleteDraft, hideSuggestionMenu, isKeyboardShown, shouldUseNarrowLayout, publishDraft],
    );

    const measureContainer = useCallback((callback: MeasureInWindowOnSuccessCallback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    }, []);

    const measureParentContainerAndReportCursor = useCallback(
        (callback: MeasureParentContainerAndCursorCallback) => {
            const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef});
            const {x: xPosition, y: yPosition} = getCursorPosition({positionOnMobile: cursorPositionValue.get(), positionOnWeb: selection});
            measureContainer((x, y, width, height) => {
                callback({
                    x,
                    y,
                    width,
                    height,
                    scrollValue,
                    cursorCoordinates: {x: xPosition, y: yPosition},
                });
            });
        },
        [cursorPositionValue, measureContainer, selection],
    );

    useEffect(() => {
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        tag.set(findNodeHandle(textInputRef.current) ?? -1);
    }, [tag]);
    useFocusedInputHandler(
        {
            onSelectionChange: (event) => {
                'worklet';

                if (event.target === tag.get()) {
                    cursorPositionValue.set({
                        x: event.selection.end.x,
                        y: event.selection.end.y,
                    });
                }
            },
        },
        [],
    );

    useEffect(() => {
        debouncedValidateCommentMaxLength(draft, {reportID});
    }, [draft, reportID, debouncedValidateCommentMaxLength]);

    useEffect(() => {
        // required for keeping last state of isFocused variable
        isFocusedRef.current = isFocused;

        if (!isFocused) {
            hideSuggestionMenu();
        }
    }, [isFocused, hideSuggestionMenu]);

    const closeButtonStyles = [styles.composerSizeButton, {marginVertical: styles.composerSizeButton.marginHorizontal}];

    return (
        <>
            <View
                style={[styles.chatItemMessage, styles.flexRow]}
                ref={containerRef}
            >
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
                                style={closeButtonStyles}
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
                            onChangeText={updateDraft} // Debounced saveDraftComment
                            onKeyPress={triggerSaveOrCancel}
                            value={draft}
                            maxLines={shouldUseNarrowLayout ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES} // This is the same that slack has
                            style={[styles.textInputCompose, styles.flex1, styles.bgTransparent]}
                            onFocus={() => {
                                setIsFocused(true);
                                if (textInputRef.current) {
                                    ReportActionComposeFocusManager.editComposerRef.current = textInputRef.current;
                                }
                                InteractionManager.runAfterInteractions(() => {
                                    requestAnimationFrame(() => {
                                        reportScrollManager.scrollToIndex(index, true);
                                    });
                                });
                                setShouldShowComposeInputKeyboardAware(false);
                                // The last composer that had focus should re-gain focus
                                setUpComposeFocusManager();

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
                                const relatedTargetId = event.nativeEvent?.relatedTarget?.id;
                                if (relatedTargetId === CONST.COMPOSER.NATIVE_ID || relatedTargetId === CONST.EMOJI_PICKER_BUTTON_NATIVE_ID || EmojiPickerAction.isEmojiPickerVisible()) {
                                    return;
                                }
                                setShouldShowComposeInputKeyboardAware(true);
                            }}
                            onLayout={reportActionItemEventHandler.handleComposerLayoutChange(reportScrollManager, index)}
                            selection={selection}
                            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                            isGroupPolicyReport={isGroupPolicyReport}
                            shouldCalculateCaretPosition
                            onScroll={onSaveScrollAndHideSuggestionMenu}
                        />
                    </View>

                    <Suggestions
                        ref={suggestionsRef}
                        // eslint-disable-next-line react-compiler/react-compiler
                        isComposerFocused={textInputRef.current?.isFocused()}
                        updateComment={updateDraft}
                        measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
                        isGroupPolicyReport={isGroupPolicyReport}
                        policyID={policyID}
                        value={draft}
                        selection={selection}
                        setSelection={setSelection}
                    />

                    <View style={styles.editChatItemEmojiWrapper}>
                        <EmojiPickerButton
                            isDisabled={shouldDisableEmojiPicker}
                            onModalHide={() => {
                                const activeElementId = DomUtils.getActiveElement()?.id;
                                if (activeElementId === CONST.COMPOSER.NATIVE_ID || activeElementId === CONST.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                                    return;
                                }
                                ReportActionComposeFocusManager.focus();
                            }}
                            onEmojiSelected={addEmojiToTextBox}
                            emojiPickerID={action.reportActionID}
                            onPress={setUpComposeFocusManager}
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
