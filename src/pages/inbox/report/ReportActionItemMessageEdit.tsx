import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {MeasureInWindowOnSuccessCallback, TextInputKeyPressEvent, TextInputScrollEvent} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';
import type {Emoji} from '@assets/emojis/types';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {ComposerRef, TextSelection} from '@components/Composer/types';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollBlocker from '@hooks/useScrollBlocker';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearActive, isActive as isEmojiPickerActive} from '@libs/actions/EmojiPickerAction';
import {composerFocusKeepFocusOn} from '@libs/actions/InputFocus';
import {saveReportActionDraft} from '@libs/actions/Report';
import {isMobileChrome} from '@libs/Browser';
import {canSkipTriggerHotkeys, insertText} from '@libs/ComposerUtils';
import DomUtils from '@libs/DomUtils';
import {extractEmojis, getTextVSCursorOffset, insertTextVSBetweenDigitAndEmoji, replaceAndExtractEmojis} from '@libs/EmojiUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import type {Selection} from '@libs/focusComposerWithDelay/types';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import reportActionItemEventHandler from '@libs/ReportActionItemEventHandler';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
// eslint-disable-next-line no-restricted-imports
import findNodeHandle from '@src/utils/findNodeHandle';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import getCursorPosition from './ReportActionCompose/getCursorPosition';
import getScrollPosition from './ReportActionCompose/getScrollPosition';
import MessageEditCancelButton from './ReportActionCompose/MessageEditCancelButton';
import type {SuggestionsRef} from './ReportActionCompose/ReportActionCompose';
import SendOrSaveButton from './ReportActionCompose/SendOrSaveButton';
import Suggestions from './ReportActionCompose/Suggestions';
import useDebouncedCommentMaxLengthValidation from './ReportActionCompose/useDebouncedCommentMaxLengthValidation';
import useEditMessage from './ReportActionCompose/useEditMessage';
import {useReportActionActiveEdit} from './ReportActionEditMessageContext';
import shouldUseEmojiPickerSelection from './shouldUseEmojiPickerSelection';
import useDraftMessageVideoAttributeCache from './useDraftMessageVideoAttributeCache';

type ReportActionItemMessageEditProps = {
    /** All the data of the action */
    action: OnyxTypes.ReportAction;

    /** ReportID that holds the comment we're editing */
    reportID: string | undefined;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID: string;

    /** PolicyID of the policy the report belongs to */
    policyID?: string;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Whether or not the emoji picker is disabled */
    shouldDisableEmojiPicker?: boolean;

    /** Whether report is from group policy */
    isGroupPolicyReport: boolean;

    /** Reference to the outer element */
    ref?: React.Ref<ComposerRef | undefined>;
};

const shouldUseForcedSelectionRange = shouldUseEmojiPickerSelection();

const DEFAULT_MODAL_VALUE = {
    willAlertModalBecomeVisible: false,
    isVisible: false,
};

function ReportActionItemMessageEdit({action, reportID, originalReportID, policyID, index, isGroupPolicyReport, shouldDisableEmojiPicker = false, ref}: ReportActionItemMessageEditProps) {
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const containerRef = useRef<View>(null);
    const reportScrollManager = useReportScrollManager();
    const {translate, preferredLocale} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const suggestionsRef = useRef<SuggestionsRef>(null);
    const mobileInputScrollPosition = useRef(0);
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);
    const emojisPresentBefore = useRef<Emoji[]>([]);

    const {currentEditMessageSelection, setCurrentEditMessageSelection, editingMessage, setEditingMessage} = useReportActionActiveEdit();
    const [draft, setDraft] = useState(() => {
        if (editingMessage) {
            emojisPresentBefore.current = extractEmojis(editingMessage);
        }
        return editingMessage ?? '';
    });

    const defaultSelection = useMemo(() => ({start: draft.length, end: draft.length, positionX: 0, positionY: 0}), [draft.length]);
    const [selection, setSelectionState] = useState<TextSelection>(() => currentEditMessageSelection ?? defaultSelection);

    const setSelection = useCallback(
        (newSelection: TextSelection) => {
            setSelectionState(newSelection);
            setCurrentEditMessageSelection((prevSelection) => ({...prevSelection, ...newSelection}));
        },
        [setSelectionState, setCurrentEditMessageSelection],
    );

    useEffect(() => {
        setSelectionState(currentEditMessageSelection ?? defaultSelection);
    }, [currentEditMessageSelection, defaultSelection, draft.length, setSelection]);

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {debouncedCommentMaxLengthValidation, isExceedingMaxLength, exceededMaxLength} = useDebouncedCommentMaxLengthValidation({
        reportID,
        isEditing: true,
    });

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [modal = DEFAULT_MODAL_VALUE] = useOnyx(ONYXKEYS.MODAL);
    const [onyxInputFocused = false] = useOnyx(ONYXKEYS.INPUT_FOCUSED);

    const {isScrolling, startScrollBlock, endScrollBlock} = useScrollBlocker();

    const composerRef = useRef<ComposerRef | null>(null);
    const draftRef = useRef(draft);
    const emojiPickerSelectionRef = useRef<Selection | undefined>(undefined);
    // The ref to check whether the comment saving is in progress
    const isCommentPendingSaved = useRef(false);

    useDraftMessageVideoAttributeCache({
        draftMessage: editingMessage ?? '',
        isEditing: true,
        editingReportAction: action,
        updateDraftMessage: setDraft,
        isEditInProgressRef: isCommentPendingSaved,
    });

    useEffect(() => {
        composerFocusKeepFocusOn(composerRef.current as HTMLElement, isFocused, modal, onyxInputFocused);
    }, [isFocused, modal, onyxInputFocused]);

    useEffect(
        // Remove focus callback on unmount to avoid stale callbacks
        () => {
            if (composerRef.current) {
                ReportActionComposeFocusManager.editComposerRef.current = composerRef.current;
            }
            return () => {
                if (ReportActionComposeFocusManager.editComposerRef.current !== composerRef.current) {
                    return;
                }
                ReportActionComposeFocusManager.clear(true);
            };
        },
        [],
    );

    /**
     * Focus the composer text input
     * @param shouldDelay - Impose delay before focusing the composer
     */
    const focus = useCallback((shouldDelay = false, forcedSelectionRange?: Selection) => {
        focusComposerWithDelay(composerRef.current)(shouldDelay, forcedSelectionRange);
    }, []);

    // Take over focus priority
    const setUpComposeFocusManager = useCallback(() => {
        ReportActionComposeFocusManager.onComposerFocus(() => {
            focus(true, emojiPickerSelectionRef.current ? {...emojiPickerSelectionRef.current} : undefined);
            emojiPickerSelectionRef.current = undefined;
        }, true);
    }, [focus]);

    /**
     * Save the draft of the comment. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the comment and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSaveDraft = useMemo(
        () =>
            lodashDebounce((newDraft: string) => {
                saveReportActionDraft(reportID, action, newDraft);
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
            raiseIsScrollLayoutTriggered();
            const {text: emojiConvertedText, emojis, cursorPosition} = replaceAndExtractEmojis(newDraftInput, preferredSkinTone, preferredLocale);
            const newDraft = insertTextVSBetweenDigitAndEmoji(emojiConvertedText);
            const textVSOffset = getTextVSCursorOffset(emojiConvertedText, cursorPosition);

            emojisPresentBefore.current = emojis;

            setDraft(newDraft);

            if (newDraftInput !== newDraft) {
                const adjustedCursorPosition = cursorPosition !== undefined && cursorPosition !== null ? cursorPosition + textVSOffset : undefined;
                const position = Math.max((selection?.end ?? 0) + (newDraft.length - draftRef.current.length), adjustedCursorPosition ?? 0);
                setSelection({
                    start: position,
                    end: position,
                    positionX: 0,
                    positionY: 0,
                });
            }

            draftRef.current = newDraft;

            setEditingMessage(newDraft);

            // We want to escape the draft message to differentiate the HTML from the report action and the HTML the user drafted.
            debouncedSaveDraft(newDraft);
            isCommentPendingSaved.current = true;
        },
        [debouncedSaveDraft, preferredLocale, preferredSkinTone, raiseIsScrollLayoutTriggered, selection?.end, setEditingMessage, setSelection],
    );

    useEffect(() => {
        updateDraft(draft);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run this only when language is changed
    }, [action.reportActionID, preferredLocale]);

    const {publishDraft, deleteDraft} = useEditMessage({
        reportID,
        originalReportID,
        reportAction: action,
        shouldScrollToLastMessage: index === 0,
        isFocused,
        debouncedCommentMaxLengthValidation,
        composerRef,
    });

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
        updateDraft(insertText(draft, selection, `${emoji} `));
    };

    const hideSuggestionMenu = useCallback(() => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, [suggestionsRef]);
    const onSaveScrollAndHideSuggestionMenu = useCallback(
        (e: TextInputScrollEvent) => {
            if (isScrollLayoutTriggered.current) {
                return;
            }
            mobileInputScrollPosition.current = e?.nativeEvent?.contentOffset?.y ?? 0;

            hideSuggestionMenu();
        },
        [isScrollLayoutTriggered, hideSuggestionMenu],
    );

    /**
     * Key event handlers that short cut to saving/canceling.
     *
     * @param {Event} e
     */
    const triggerSaveOrCancel = useCallback(
        (e: TextInputKeyPressEvent | KeyboardEvent) => {
            if (!e || canSkipTriggerHotkeys(shouldUseNarrowLayout, isKeyboardShown)) {
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
                publishDraft(draft);
            } else if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();
                deleteDraft();
            }
        },
        [shouldUseNarrowLayout, isKeyboardShown, hideSuggestionMenu, publishDraft, draft, deleteDraft],
    );

    const measureContainer = useCallback((callback: MeasureInWindowOnSuccessCallback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    }, []);

    const measureParentContainerAndReportCursor = useCallback(
        (callback: MeasureParentContainerAndCursorCallback) => {
            const performMeasurement = () => {
                const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef: composerRef});
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
            };

            if (isScrolling) {
                return;
            }

            performMeasurement();
        },
        [cursorPositionValue, measureContainer, selection, isScrolling],
    );

    useEffect(() => {
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        tag.set(findNodeHandle(composerRef.current) ?? -1);
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
        debouncedCommentMaxLengthValidation(draft);
    }, [draft, debouncedCommentMaxLengthValidation]);

    useEffect(() => {
        if (isFocused) {
            return;
        }

        hideSuggestionMenu();
    }, [isFocused, hideSuggestionMenu]);

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
                        isExceedingMaxLength && styles.borderColorDanger,
                    ]}
                >
                    <MessageEditCancelButton
                        onCancel={deleteDraft}
                        style={[styles.justifyContentEnd, styles.mb1]}
                    />
                    <View style={[StyleUtils.getContainerComposeStyles(), styles.textInputComposeBorder]}>
                        <Composer
                            multiline
                            ref={(el) => {
                                composerRef.current = el;
                                if (typeof ref === 'function') {
                                    ref(el);
                                } else if (ref) {
                                    // eslint-disable-next-line no-param-reassign
                                    ref.current = el;
                                }
                            }}
                            autoFocus={!shouldUseNarrowLayout}
                            onChangeText={updateDraft} // Debounced saveDraftComment
                            onKeyPress={triggerSaveOrCancel}
                            value={draft}
                            maxLines={shouldUseNarrowLayout ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES} // This is the same that slack has
                            style={[styles.textInputCompose, styles.flex1, styles.bgTransparent, styles.textAlignLeft]}
                            onFocus={() => {
                                setIsFocused(true);
                                if (composerRef.current) {
                                    ReportActionComposeFocusManager.editComposerRef.current = composerRef.current;
                                }
                                startScrollBlock();
                                // eslint-disable-next-line @typescript-eslint/no-deprecated
                                InteractionManager.runAfterInteractions(() => {
                                    requestAnimationFrame(() => {
                                        reportScrollManager.scrollToIndex(index, true);
                                        endScrollBlock();
                                    });
                                });
                                if (isMobileChrome() && reportScrollManager.ref?.current) {
                                    reportScrollManager.ref.current.scrollToIndex({index, animated: false});
                                }
                                // The last composer that had focus should re-gain focus
                                // setUpComposeFocusManager();

                                // Clear active report action when another action gets focused
                                if (!isEmojiPickerActive(action.reportActionID)) {
                                    clearActive();
                                }
                                if (!ReportActionContextMenu.isActiveReportAction(action.reportActionID)) {
                                    ReportActionContextMenu.clearActiveReportAction();
                                }
                            }}
                            onBlur={() => setIsFocused(false)}
                            onLayout={(event) => {
                                if (!isFocused) {
                                    return;
                                }
                                reportActionItemEventHandler.handleComposerLayoutChange(reportScrollManager, index)(event);
                            }}
                            selection={selection}
                            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                            isGroupPolicyReport={isGroupPolicyReport}
                            shouldCalculateCaretPosition
                            onScroll={onSaveScrollAndHideSuggestionMenu}
                            testID={CONST.COMPOSER.NATIVE_ID}
                        />
                    </View>

                    <Suggestions
                        ref={suggestionsRef}
                        isComposerFocused={composerRef.current?.isFocused()}
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
                        <SendOrSaveButton
                            isDisabled={isExceedingMaxLength}
                            isEditing
                            onSendOrSave={() => publishDraft(draft)}
                            accessibilityLabel={translate('common.saveChanges')}
                            role={CONST.ROLE.BUTTON}
                            hoverDimmingValue={1}
                            pressDimmingValue={0.2}
                            onMouseDown={(e) => e.preventDefault()}
                        />
                    </View>
                </View>
            </View>
            {isExceedingMaxLength && !!exceededMaxLength && <ExceededCommentLength maxCommentLength={exceededMaxLength} />}
        </>
    );
}

export default ReportActionItemMessageEdit;
export type {ReportActionItemMessageEditProps};
