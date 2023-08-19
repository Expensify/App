import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {View, LayoutAnimation, NativeModules, findNodeHandle} from 'react-native';
import {runOnJS} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import focusWithDelay from '../../../libs/focusWithDelay';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import Composer from '../../../components/Composer';
import ONYXKEYS from '../../../ONYXKEYS';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../components/AttachmentPicker';
import * as Report from '../../../libs/actions/Report';
import ReportTypingIndicator from './ReportTypingIndicator';
import AttachmentModal from '../../../components/AttachmentModal';
import compose from '../../../libs/compose';
import PopoverMenu from '../../../components/PopoverMenu';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import willBlurTextInputOnTapOutsideFunc from '../../../libs/willBlurTextInputOnTapOutside';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import CONST from '../../../CONST';
import reportActionPropTypes from './reportActionPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import participantPropTypes from '../../../components/participantPropTypes';
import ParticipantLocalTime from './ParticipantLocalTime';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import {withNetwork} from '../../../components/OnyxProvider';
import * as User from '../../../libs/actions/User';
import Tooltip from '../../../components/Tooltip';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import withNavigationFocus from '../../../components/withNavigationFocus';
import withNavigation from '../../../components/withNavigation';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import * as UserUtils from '../../../libs/UserUtils';
import ReportDropUI from './ReportDropUI';
import reportPropTypes from '../../reportPropTypes';
import EmojiSuggestions from '../../../components/EmojiSuggestions';
import MentionSuggestions from '../../../components/MentionSuggestions';
import withKeyboardState, {keyboardStatePropTypes} from '../../../components/withKeyboardState';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ComposerUtils from '../../../libs/ComposerUtils';
import * as Welcome from '../../../libs/actions/Welcome';
import Permissions from '../../../libs/Permissions';
import containerComposeStyles from '../../../styles/containerComposeStyles';
import * as Task from '../../../libs/actions/Task';
import * as Browser from '../../../libs/Browser';
import * as IOU from '../../../libs/actions/IOU';
import useArrowKeyFocusManager from '../../../hooks/useArrowKeyFocusManager';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import usePrevious from '../../../hooks/usePrevious';
import * as KeyDownListener from '../../../libs/KeyboardShortcut/KeyDownPressListener';
import * as EmojiPickerActions from '../../../libs/actions/EmojiPickerAction';
import withAnimatedRef from '../../../components/withAnimatedRef';
import updatePropsPaperWorklet from '../../../libs/updatePropsPaperWorklet';

const {RNTextInputReset} = NativeModules;

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** A method to call when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** The comment left by the user */
    comment: PropTypes.string,

    /** Number of lines for the comment */
    numberOfLines: PropTypes.number,

    /** The ID of the report actions will be created for */
    reportID: PropTypes.string.isRequired,

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates if there is a modal currently visible or not */
        isVisible: PropTypes.bool,
    }),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** The actions from the parent report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** Is composer screen focused */
    isFocused: PropTypes.bool.isRequired,

    /** Is composer full size */
    isComposerFullSize: PropTypes.bool,

    /** Whether user interactions should be disabled */
    disabled: PropTypes.bool,

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),

    /** Whether the composer input should be shown */
    shouldShowComposeInput: PropTypes.bool,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** animated ref from react-native-reanimated */
    animatedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]).isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
    ...keyboardStatePropTypes,
};

const defaultProps = {
    betas: [],
    comment: '',
    numberOfLines: undefined,
    modal: {},
    report: {},
    reportActions: [],
    parentReportActions: {},
    blockedFromConcierge: {},
    personalDetails: {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    isComposerFullSize: false,
    pendingAction: null,
    shouldShowComposeInput: true,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const defaultSuggestionsValues = {
    suggestedEmojis: [],
    suggestedMentions: [],
    colonIndex: -1,
    atSignIndex: -1,
    shouldShowEmojiSuggestionMenu: false,
    shouldShowMentionSuggestionMenu: false,
    mentionPrefix: '',
    isAutoSuggestionPickerLarge: false,
};

/**
 * Return the max available index for arrow manager.
 * @param {Number} numRows
 * @param {Boolean} isAutoSuggestionPickerLarge
 * @returns {Number}
 */
const getMaxArrowIndex = (numRows, isAutoSuggestionPickerLarge) => {
    // rowCount is number of emoji/mention suggestions. For small screen we can fit 3 items
    // and for large we show up to 20 items for mentions/emojis
    const rowCount = isAutoSuggestionPickerLarge
        ? Math.min(numRows, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS)
        : Math.min(numRows, CONST.AUTO_COMPLETE_SUGGESTER.MIN_AMOUNT_OF_SUGGESTIONS);

    // -1 because we start at 0
    return rowCount - 1;
};

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

/**
 * Save draft report comment. Debounced to happen at most once per second.
 * @param {String} reportID
 * @param {String} comment
 */
const debouncedSaveReportComment = _.debounce((reportID, comment) => {
    Report.saveReportComment(reportID, comment || '');
}, 1000);

/**
 * Broadcast that the user is typing. Debounced to limit how often we publish client events.
 * @param {String} reportID
 */
const debouncedBroadcastUserIsTyping = _.debounce((reportID) => {
    Report.broadcastUserIsTyping(reportID);
}, 100);

/**
 * Check if this piece of string looks like an emoji
 * @param {String} str
 * @param {Number} pos
 * @returns {Boolean}
 */
const isEmojiCode = (str, pos) => {
    const leftWords = str.slice(0, pos).split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
    const leftWord = _.last(leftWords);
    return CONST.REGEX.HAS_COLON_ONLY_AT_THE_BEGINNING.test(leftWord) && leftWord.length > 2;
};

/**
 * Check if this piece of string looks like a mention
 * @param {String} str
 * @returns {Boolean}
 */
const isMentionCode = (str) => CONST.REGEX.HAS_AT_MOST_TWO_AT_SIGNS.test(str);

/**
 * Trims first character of the string if it is a space
 * @param {String} str
 * @returns {String}
 */
const trimLeadingSpace = (str) => (str.slice(0, 1) === ' ' ? str.slice(1) : str);

// For mobile Safari, updating the selection prop on an unfocused input will cause it to automatically gain focus
// and subsequent programmatic focus shifts (e.g., modal focus trap) to show the blue frame (:focus-visible style),
// so we need to ensure that it is only updated after focus.
const isMobileSafari = Browser.isMobileSafari();

function ReportActionCompose({
    animatedRef,
    betas,
    blockedFromConcierge,
    comment,
    currentUserPersonalDetails,
    disabled,
    isComposerFullSize,
    isFocused: isFocusedProp,
    isKeyboardShown,
    isMediumScreenWidth,
    isSmallScreenWidth,
    modal,
    navigation,
    network,
    numberOfLines,
    onSubmit,
    parentReportActions,
    pendingAction,
    personalDetails,
    preferredLocale,
    preferredSkinTone,
    report,
    reportActions,
    reportID,
    shouldShowComposeInput,
    translate,
    windowHeight,
}) {
    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(shouldFocusInputOnScreenFocus && !modal.isVisible && !modal.willAlertModalBecomeVisible && shouldShowComposeInput);
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);

    const isEmptyChat = useMemo(() => _.size(reportActions) === 1, [reportActions]);

    const shouldAutoFocus = !modal.isVisible && (shouldFocusInputOnScreenFocus || isEmptyChat) && shouldShowComposeInput;

    // These variables are used to decide whether to block the suggestions list from showing to prevent flickering
    const shouldBlockEmojiCalc = useRef(false);
    const shouldBlockMentionCalc = useRef(false);

    /**
     * Updates the should clear state of the composer
     */
    const [textInputShouldClear, setTextInputShouldClear] = useState(false);
    const [isCommentEmpty, setIsCommentEmpty] = useState(comment.length === 0);

    /**
     * Updates the visibility state of the menu
     */
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const [selection, setSelection] = useState({
        start: isMobileSafari && !shouldAutoFocus ? 0 : comment.length,
        end: isMobileSafari && !shouldAutoFocus ? 0 : comment.length,
    });
    const [value, setValue] = useState(comment);

    const [composerHeight, setComposerHeight] = useState(0);
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    // TODO: rewrite suggestion logic to some hook or state machine or util or something to not make it depend on ReportActionComposer
    const [suggestionValues, setSuggestionValues] = useState(defaultSuggestionsValues);

    const isEmojiSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedEmojis) && suggestionValues.shouldShowEmojiSuggestionMenu;
    const isMentionSuggestionsMenuVisible = !_.isEmpty(suggestionValues.suggestedMentions) && suggestionValues.shouldShowMentionSuggestionMenu;

    const [highlightedEmojiIndex, setHighlightedEmojiIndex] = useArrowKeyFocusManager({
        isActive: isEmojiSuggestionsMenuVisible,
        maxIndex: getMaxArrowIndex(suggestionValues.suggestedEmojis.length, suggestionValues.isAutoSuggestionPickerLarge),
        shouldExcludeTextAreaNodes: false,
    });
    const [highlightedMentionIndex, setHighlightedMentionIndex] = useArrowKeyFocusManager({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: getMaxArrowIndex(suggestionValues.suggestedMentions.length, suggestionValues.isAutoSuggestionPickerLarge),
        shouldExcludeTextAreaNodes: false,
    });

    const insertedEmojisRef = useRef([]);

    /**
     * Update frequently used emojis list. We debounce this method in the constructor so that UpdateFrequentlyUsedEmojis
     * API is not called too often.
     */
    const debouncedUpdateFrequentlyUsedEmojis = useCallback(() => {
        User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(insertedEmojisRef.current));
        insertedEmojisRef.current = [];
    }, []);

    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     */
    const [hasExceededMaxCommentLength, setExceededMaxCommentLength] = useState(false);

    const commentRef = useRef(comment);
    const textInputRef = useRef(null);
    const actionButtonRef = useRef(null);

    const reportParticipants = useMemo(() => _.without(lodashGet(report, 'participantAccountIDs', []), currentUserPersonalDetails.accountID), [currentUserPersonalDetails.accountID, report]);
    const participantsWithoutExpensifyAccountIDs = useMemo(() => _.difference(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS), [reportParticipants]);

    const shouldShowReportRecipientLocalTime = useMemo(
        () => ReportUtils.canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize,
        [personalDetails, report, currentUserPersonalDetails.accountID, isComposerFullSize],
    );

    const isBlockedFromConcierge = useMemo(() => ReportUtils.chatIncludesConcierge(report) && User.isBlockedFromConcierge(blockedFromConcierge), [report, blockedFromConcierge]);

    // If we are on a small width device then don't show last 3 items from conciergePlaceholderOptions
    const conciergePlaceholderRandomIndex = useMemo(
        () => _.random(translate('reportActionCompose.conciergePlaceholderOptions').length - (isSmallScreenWidth ? 4 : 1)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // Placeholder to display in the chat input.
    const inputPlaceholder = useMemo(() => {
        if (ReportUtils.chatIncludesConcierge(report)) {
            if (User.isBlockedFromConcierge(blockedFromConcierge)) {
                return translate('reportActionCompose.blockedFromConcierge');
            }

            return translate('reportActionCompose.conciergePlaceholderOptions')[conciergePlaceholderRandomIndex];
        }

        return translate('reportActionCompose.writeSomething');
    }, [report, blockedFromConcierge, translate, conciergePlaceholderRandomIndex]);

    /**
     * Focus the composer text input
     * @param {Boolean} [shouldDelay=false] Impose delay before focusing the composer
     * @memberof ReportActionCompose
     */
    const focus = useCallback((shouldDelay) => {
        focusWithDelay(textInputRef.current)(shouldDelay);
    }, []);

    /**
     * Update the value of the comment in Onyx
     *
     * @param {String} comment
     * @param {Boolean} shouldDebounceSaveComment
     */
    const updateComment = useCallback(
        (commentValue, shouldDebounceSaveComment) => {
            const {text: newComment = '', emojis = []} = EmojiUtils.replaceEmojis(commentValue, preferredSkinTone, preferredLocale);

            if (!_.isEmpty(emojis)) {
                insertedEmojisRef.current = [...insertedEmojisRef.current, ...emojis];
                debouncedUpdateFrequentlyUsedEmojis();
            }

            setIsCommentEmpty(!!newComment.match(/^(\s)*$/));
            setValue(newComment);
            if (commentValue !== newComment) {
                const remainder = ComposerUtils.getCommonSuffixLength(commentRef.current, newComment);
                setSelection({
                    start: newComment.length - remainder,
                    end: newComment.length - remainder,
                });
            }

            // Indicate that draft has been created.
            if (commentRef.current.length === 0 && newComment.length !== 0) {
                Report.setReportWithDraft(reportID, true);
            }

            // The draft has been deleted.
            if (newComment.length === 0) {
                Report.setReportWithDraft(reportID, false);
            }

            commentRef.current = newComment;
            if (shouldDebounceSaveComment) {
                debouncedSaveReportComment(reportID, newComment);
            } else {
                Report.saveReportComment(reportID, newComment || '');
            }
            if (newComment) {
                debouncedBroadcastUserIsTyping(reportID);
            }
        },
        [debouncedUpdateFrequentlyUsedEmojis, preferredLocale, preferredSkinTone, reportID],
    );

    /**
     * Used to show Popover menu on Workspace chat at first sign-in
     * @returns {Boolean}
     */
    const showPopoverMenu = useCallback(() => {
        setMenuVisibility(true);
        return true;
    }, []);

    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     * @param {String} text
     * @param {Boolean} shouldAddTrailSpace
     */
    const replaceSelectionWithText = useCallback(
        (text, shouldAddTrailSpace = true) => {
            const updatedText = shouldAddTrailSpace ? `${text} ` : text;
            const selectionSpaceLength = shouldAddTrailSpace ? CONST.SPACE_LENGTH : 0;
            updateComment(ComposerUtils.insertText(commentRef.current, selection, updatedText));
            setSelection((prevSelection) => ({
                start: prevSelection.start + text.length + selectionSpaceLength,
                end: prevSelection.start + text.length + selectionSpaceLength,
            }));
        },
        [selection, updateComment],
    );

    /**
     * Check if the composer is visible. Returns true if the composer is not covered up by emoji picker or menu. False otherwise.
     * @returns {Boolean}
     */
    const checkComposerVisibility = useCallback(() => {
        const isComposerCoveredUp = EmojiPickerActions.isEmojiPickerVisible() || isMenuVisible || modal.isVisible;
        return !isComposerCoveredUp;
    }, [isMenuVisible, modal.isVisible]);

    const focusComposerOnKeyPress = useCallback(
        (e) => {
            const isComposerVisible = checkComposerVisibility();
            if (!isComposerVisible) {
                return;
            }

            // If the key pressed is non-character keys like Enter, Shift, ... do not focus
            if (e.key.length > 1) {
                return;
            }

            // If a key is pressed in combination with Meta, Control or Alt do not focus
            if (e.metaKey || e.ctrlKey || e.altKey) {
                return;
            }

            // If the space key is pressed, do not focus
            if (e.code === 'Space') {
                return;
            }

            // if we're typing on another input/text area, do not focus
            if (['INPUT', 'TEXTAREA'].includes(e.target.nodeName)) {
                return;
            }

            focus();
            replaceSelectionWithText(e.key, false);
        },
        [checkComposerVisibility, focus, replaceSelectionWithText],
    );

    /**
     * Clean data related to EmojiSuggestions
     */
    const resetSuggestions = useCallback(() => {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);

    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    const calculateEmojiSuggestion = useCallback(
        (selectionEnd) => {
            if (shouldBlockEmojiCalc.current || !value) {
                shouldBlockEmojiCalc.current = false;
                resetSuggestions();
                return;
            }
            const leftString = value.substring(0, selectionEnd);
            const colonIndex = leftString.lastIndexOf(':');
            const isCurrentlyShowingEmojiSuggestion = isEmojiCode(value, selectionEnd);

            // the larger composerHeight the less space for EmojiPicker, Pixel 2 has pretty small screen and this value equal 5.3
            const hasEnoughSpaceForLargeSuggestion = windowHeight / composerHeight >= 6.8;
            const isAutoSuggestionPickerLarge = !isSmallScreenWidth || (isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion);

            const nextState = {
                suggestedEmojis: [],
                colonIndex,
                shouldShowEmojiSuggestionMenu: false,
                isAutoSuggestionPickerLarge,
            };
            const newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString, preferredLocale);

            if (newSuggestedEmojis.length && isCurrentlyShowingEmojiSuggestion) {
                nextState.suggestedEmojis = newSuggestedEmojis;
                nextState.shouldShowEmojiSuggestionMenu = !_.isEmpty(newSuggestedEmojis);
            }

            setSuggestionValues((prevState) => ({...prevState, ...nextState}));
            setHighlightedEmojiIndex(0);
        },
        [value, windowHeight, composerHeight, isSmallScreenWidth, preferredLocale, setHighlightedEmojiIndex, resetSuggestions],
    );

    const getMentionOptions = useCallback(
        (searchValue = '') => {
            const suggestions = [];

            if (CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchValue.toLowerCase())) {
                suggestions.push({
                    text: CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                    alternateText: translate('mentionSuggestions.hereAlternateText'),
                    icons: [
                        {
                            source: Expensicons.Megaphone,
                            type: 'avatar',
                        },
                    ],
                });
            }

            const filteredPersonalDetails = _.filter(_.values(personalDetails), (detail) => {
                // If we don't have user's primary login, that member is not known to the current user and hence we do not allow them to be mentioned
                if (!detail.login) {
                    return false;
                }
                if (searchValue && !`${detail.displayName} ${detail.login}`.toLowerCase().includes(searchValue.toLowerCase())) {
                    return false;
                }
                return true;
            });

            const sortedPersonalDetails = _.sortBy(filteredPersonalDetails, (detail) => detail.displayName || detail.login);
            _.each(_.first(sortedPersonalDetails, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS - suggestions.length), (detail) => {
                suggestions.push({
                    text: detail.displayName,
                    alternateText: detail.login,
                    icons: [
                        {
                            name: detail.login,
                            source: UserUtils.getAvatar(detail.avatar, detail.accountID),
                            type: 'avatar',
                        },
                    ],
                });
            });

            return suggestions;
        },
        [personalDetails, translate],
    );

    const calculateMentionSuggestion = useCallback(
        (selectionEnd) => {
            if (shouldBlockMentionCalc.current || selection.end < 1) {
                shouldBlockMentionCalc.current = false;
                resetSuggestions();
                return;
            }

            const valueAfterTheCursor = value.substring(selectionEnd);
            const indexOfFirstWhitespaceCharOrEmojiAfterTheCursor = valueAfterTheCursor.search(CONST.REGEX.NEW_LINE_OR_WHITE_SPACE_OR_EMOJI);

            let indexOfLastNonWhitespaceCharAfterTheCursor;
            if (indexOfFirstWhitespaceCharOrEmojiAfterTheCursor === -1) {
                // we didn't find a whitespace/emoji after the cursor, so we will use the entire string
                indexOfLastNonWhitespaceCharAfterTheCursor = value.length;
            } else {
                indexOfLastNonWhitespaceCharAfterTheCursor = indexOfFirstWhitespaceCharOrEmojiAfterTheCursor + selectionEnd;
            }

            const leftString = value.substring(0, indexOfLastNonWhitespaceCharAfterTheCursor);
            const words = leftString.split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
            const lastWord = _.last(words);

            let atSignIndex;
            if (lastWord.startsWith('@')) {
                atSignIndex = leftString.lastIndexOf(lastWord);
            }

            const prefix = lastWord.substring(1);

            const nextState = {
                suggestedMentions: [],
                atSignIndex,
                mentionPrefix: prefix,
            };

            const isCursorBeforeTheMention = valueAfterTheCursor.startsWith(lastWord);

            if (!isCursorBeforeTheMention && isMentionCode(lastWord)) {
                const suggestions = getMentionOptions(prefix);
                nextState.suggestedMentions = suggestions;
                nextState.shouldShowMentionSuggestionMenu = !_.isEmpty(suggestions);
            }

            setSuggestionValues((prevState) => ({
                ...prevState,
                ...nextState,
            }));
            setHighlightedMentionIndex(0);
        },
        [getMentionOptions, setHighlightedMentionIndex, value, selection, resetSuggestions],
    );

    const onSelectionChange = useCallback(
        (e) => {
            LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
            setSelection(e.nativeEvent.selection);

            /**
             * we pass here e.nativeEvent.selection.end directly to calculateEmojiSuggestion
             * because in other case calculateEmojiSuggestion will have an old calculation value
             * of suggestion instead of current one
             */
            calculateEmojiSuggestion(e.nativeEvent.selection.end);
            calculateMentionSuggestion(e.nativeEvent.selection.end);
        },
        [calculateEmojiSuggestion, calculateMentionSuggestion],
    );

    const setUpComposeFocusManager = useCallback(() => {
        // This callback is used in the contextMenuActions to manage giving focus back to the compose input.
        // TODO: we should clean up this convoluted code and instead move focus management to something like ReportFooter.js or another higher up component
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!willBlurTextInputOnTapOutside || !isFocusedProp) {
                return;
            }

            focus(false);
        });
    }, [focus, isFocusedProp]);

    /**
     * Set the TextInput Ref
     *
     * @param {Element} el
     * @memberof ReportActionCompose
     */
    const setTextInputRef = useCallback(
        (el) => {
            ReportActionComposeFocusManager.composerRef.current = el;
            textInputRef.current = el;
            if (_.isFunction(animatedRef)) {
                animatedRef(el);
            }
        },
        [animatedRef],
    );

    /**
     * Returns the list of IOU Options
     * @returns {Array<object>}
     */
    const moneyRequestOptions = useMemo(() => {
        const options = {
            [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: translate('iou.splitBill'),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: translate('iou.requestMoney'),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: {
                icon: Expensicons.Send,
                text: translate('iou.sendMoney'),
            },
        };

        return _.map(ReportUtils.getMoneyRequestOptions(report, reportParticipants, betas), (option) => ({
            ...options[option],
            onSelected: () => IOU.startMoneyRequest(option, report.reportID),
        }));
    }, [betas, report, reportParticipants, translate]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        if (suggestionValues.shouldShowEmojiSuggestionMenu) {
            setSuggestionValues((prevState) => ({...prevState, shouldShowEmojiSuggestionMenu: false}));
        }
        if (suggestionValues.shouldShowMentionSuggestionMenu) {
            setSuggestionValues((prevState) => ({...prevState, shouldShowMentionSuggestionMenu: false}));
        }
    }, [suggestionValues.shouldShowEmojiSuggestionMenu, suggestionValues.shouldShowMentionSuggestionMenu]);

    /**
     * Determines if we can show the task option
     * @returns {Boolean}
     */
    const taskOption = useMemo(() => {
        // We only prevent the task option from showing if it's a DM and the other user is an Expensify default email
        if (!Permissions.canUseTasks(betas) || ReportUtils.isExpensifyOnlyParticipantInReport(report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: translate('newTaskPage.assignTask'),
                onSelected: () => Task.clearOutTaskInfoAndNavigate(reportID),
            },
        ];
    }, [betas, report, reportID, translate]);

    /**
     * Replace the code of emoji and update selection
     * @param {Number} selectedEmoji
     */
    const insertSelectedEmoji = useCallback(
        (highlightedEmojiIndexInner) => {
            const commentBeforeColon = value.slice(0, suggestionValues.colonIndex);
            const emojiObject = suggestionValues.suggestedEmojis[highlightedEmojiIndexInner];
            const emojiCode = emojiObject.types && emojiObject.types[preferredSkinTone] ? emojiObject.types[preferredSkinTone] : emojiObject.code;
            const commentAfterColonWithEmojiNameRemoved = value.slice(selection.end);

            updateComment(`${commentBeforeColon}${emojiCode} ${trimLeadingSpace(commentAfterColonWithEmojiNameRemoved)}`, true);

            // In some Android phones keyboard, the text to search for the emoji is not cleared
            // will be added after the user starts typing again on the keyboard. This package is
            // a workaround to reset the keyboard natively.
            if (RNTextInputReset) {
                RNTextInputReset.resetKeyboardInput(findNodeHandle(textInputRef.current));
            }

            setSelection({
                start: suggestionValues.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
                end: suggestionValues.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({...prevState, suggestedEmojis: []}));

            insertedEmojisRef.current = [...insertedEmojisRef.current, emojiObject];
            debouncedUpdateFrequentlyUsedEmojis(emojiObject);
        },
        [debouncedUpdateFrequentlyUsedEmojis, preferredSkinTone, selection.end, suggestionValues.colonIndex, suggestionValues.suggestedEmojis, updateComment, value],
    );

    /**
     * Replace the code of mention and update selection
     * @param {Number} highlightedMentionIndex
     */
    const insertSelectedMention = useCallback(
        (highlightedMentionIndexInner) => {
            const commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
            const mentionObject = suggestionValues.suggestedMentions[highlightedMentionIndexInner];
            const mentionCode = mentionObject.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : `@${mentionObject.alternateText}`;
            const commentAfterAtSignWithMentionRemoved = value.slice(suggestionValues.atSignIndex).replace(CONST.REGEX.MENTION_REPLACER, '');

            updateComment(`${commentBeforeAtSign}${mentionCode} ${trimLeadingSpace(commentAfterAtSignWithMentionRemoved)}`, true);
            setSelection({
                start: suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
                end: suggestionValues.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
            });
            setSuggestionValues((prevState) => ({
                ...prevState,
                suggestedMentions: [],
            }));
        },
        [suggestionValues, value, updateComment],
    );

    /**
     * Update the number of lines for a comment in Onyx
     * @param {Number} numberOfLines
     */
    const updateNumberOfLines = useCallback(
        (newNumberOfLines) => {
            Report.saveReportCommentNumberOfLines(reportID, newNumberOfLines);
        },
        [reportID],
    );

    /**
     * @returns {String}
     */
    const prepareCommentAndResetComposer = useCallback(() => {
        const trimmedComment = commentRef.current.trim();
        const commentLength = ReportUtils.getCommentLength(trimmedComment);

        // Don't submit empty comments or comments that exceed the character limit
        if (!commentLength || commentLength > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        updateComment('');
        setTextInputShouldClear(true);
        if (isComposerFullSize) {
            Report.setIsComposerFullSize(reportID, false);
        }
        setIsFullComposerAvailable(false);
        return trimmedComment;
    }, [reportID, updateComment, isComposerFullSize]);

    /**
     * Add a new comment to this chat
     *
     * @param {SyntheticEvent} [e]
     */
    const submitForm = useCallback(
        (e) => {
            if (e) {
                e.preventDefault();
            }

            // Since we're submitting the form here which should clear the composer
            // We don't really care about saving the draft the user was typing
            // We need to make sure an empty draft gets saved instead
            debouncedSaveReportComment.cancel();

            const newComment = prepareCommentAndResetComposer();
            if (!newComment) {
                return;
            }

            onSubmit(newComment);
        },
        [onSubmit, prepareCommentAndResetComposer],
    );

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    const triggerHotkeyActions = useCallback(
        (e) => {
            if (!e || ComposerUtils.canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown)) {
                return;
            }

            const suggestionsExist = suggestionValues.suggestedEmojis.length > 0 || suggestionValues.suggestedMentions.length > 0;

            if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
                e.preventDefault();
                if (suggestionValues.suggestedEmojis.length > 0) {
                    insertSelectedEmoji(highlightedEmojiIndex);
                }
                if (suggestionValues.suggestedMentions.length > 0) {
                    insertSelectedMention(highlightedMentionIndex);
                }
                return;
            }

            if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                e.preventDefault();

                if (suggestionsExist) {
                    resetSuggestions();
                }

                return;
            }

            // Submit the form when Enter is pressed
            if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
                e.preventDefault();
                submitForm();
            }

            // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty and Chronos is not in the participants
            if (e.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey && textInputRef.current.selectionStart === 0 && value.length === 0 && !ReportUtils.chatIncludesChronos(report)) {
                e.preventDefault();

                const parentReportActionID = lodashGet(report, 'parentReportActionID', '');
                const parentReportAction = lodashGet(parentReportActions, [parentReportActionID], {});
                const lastReportAction = _.find([...reportActions, parentReportAction], (action) => ReportUtils.canEditReportAction(action));

                if (lastReportAction !== -1 && lastReportAction) {
                    Report.saveReportActionDraft(reportID, lastReportAction, _.last(lastReportAction.message).html);
                }
            }
        },
        [
            highlightedEmojiIndex,
            highlightedMentionIndex,
            insertSelectedEmoji,
            insertSelectedMention,
            isKeyboardShown,
            isSmallScreenWidth,
            parentReportActions,
            report,
            reportActions,
            reportID,
            resetSuggestions,
            submitForm,
            suggestionValues.suggestedEmojis.length,
            suggestionValues.suggestedMentions.length,
            value.length,
        ],
    );

    /**
     * @param {Object} file
     */
    const addAttachment = useCallback(
        (file) => {
            // Since we're submitting the form here which should clear the composer
            // We don't really care about saving the draft the user was typing
            // We need to make sure an empty draft gets saved instead
            debouncedSaveReportComment.cancel();
            const newComment = prepareCommentAndResetComposer();
            Report.addAttachment(reportID, file, newComment);
            setTextInputShouldClear(false);
        },
        [reportID, prepareCommentAndResetComposer],
    );

    /**
     * Event handler to update the state after the attachment preview is closed.
     */
    const onAttachmentPreviewClose = useCallback(() => {
        shouldBlockEmojiCalc.current = false;
        shouldBlockMentionCalc.current = false;
        setIsAttachmentPreviewActive(false);
    }, []);

    useEffect(() => {
        const unsubscribeNavigationBlur = navigation.addListener('blur', () => KeyDownListener.removeKeyDownPressListner(focusComposerOnKeyPress));
        const unsubscribeNavigationFocus = navigation.addListener('focus', () => {
            KeyDownListener.addKeyDownPressListner(focusComposerOnKeyPress);
            setUpComposeFocusManager();
        });
        KeyDownListener.addKeyDownPressListner(focusComposerOnKeyPress);

        setUpComposeFocusManager();

        updateComment(commentRef.current);

        // Shows Popover Menu on Workspace Chat at first sign-in
        if (!disabled) {
            Welcome.show({
                routes: lodashGet(navigation.getState(), 'routes', []),
                showPopoverMenu,
            });
        }

        if (comment.length !== 0) {
            Report.setReportWithDraft(reportID, true);
        }

        return () => {
            ReportActionComposeFocusManager.clear();

            KeyDownListener.removeKeyDownPressListner(focusComposerOnKeyPress);
            unsubscribeNavigationBlur();
            unsubscribeNavigationFocus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const prevIsModalVisible = usePrevious(modal.isVisible);
    const prevIsFocused = usePrevious(isFocusedProp);
    useEffect(() => {
        // We want to focus or refocus the input when a modal has been closed or the underlying screen is refocused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (!(willBlurTextInputOnTapOutside && !modal.isVisible && isFocusedProp && (prevIsModalVisible || !prevIsFocused))) {
            return;
        }

        focus();
    }, [focus, prevIsFocused, prevIsModalVisible, isFocusedProp, modal.isVisible]);

    const prevCommentProp = usePrevious(comment);
    const prevPreferredLocale = usePrevious(preferredLocale);
    const prevReportId = usePrevious(report.reportID);
    useEffect(() => {
        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        const shouldSyncComment = prevCommentProp !== comment && value !== comment;

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (preferredLocale === prevPreferredLocale && report.reportID === prevReportId && !shouldSyncComment) {
            return;
        }

        updateComment(comment);
    }, [prevCommentProp, prevPreferredLocale, prevReportId, comment, preferredLocale, report.reportID, updateComment, value]);

    const reportRecipient = personalDetails[participantsWithoutExpensifyAccountIDs[0]];
    const shouldUseFocusedColor = !isBlockedFromConcierge && !disabled && isFocused;
    const isFullSizeComposerAvailable = isFullComposerAvailable && !_.isEmpty(value);
    const hasReportRecipient = _.isObject(reportRecipient) && !_.isEmpty(reportRecipient);
    const maxComposerLines = isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;

    const Tap = Gesture.Tap()
        .enabled(!(isCommentEmpty || isBlockedFromConcierge || disabled || hasExceededMaxCommentLength))
        .onEnd(() => {
            'worklet';

            const viewTag = animatedRef();
            const viewName = 'RCTMultilineTextInputView';
            const updates = {text: ''};
            // we are setting the isCommentEmpty flag to true so the status of it will be in sync of the native text input state
            runOnJS(setIsCommentEmpty)(true);
            updatePropsPaperWorklet(viewTag, viewName, updates); // clears native text input on the UI thread
            runOnJS(submitForm)();
        });

    return (
        <View style={[shouldShowReportRecipientLocalTime && !lodashGet(network, 'isOffline') && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <OfflineWithFeedback
                pendingAction={pendingAction}
                style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
            >
                {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime participant={reportRecipient} />}
                <View
                    style={[
                        shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                        styles.flexRow,
                        styles.chatItemComposeBox,
                        isComposerFullSize && styles.chatItemFullComposeBox,
                        hasExceededMaxCommentLength && styles.borderColorDanger,
                    ]}
                >
                    <AttachmentModal
                        headerTitle={translate('reportActionCompose.sendAttachment')}
                        onConfirm={addAttachment}
                        onModalShow={() => setIsAttachmentPreviewActive(true)}
                        onModalHide={onAttachmentPreviewClose}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPicker>
                                    {({openPicker}) => {
                                        const triggerAttachmentPicker = () => {
                                            // Set a flag to block suggestion calculation until we're finished using the file picker,
                                            // which will stop any flickering as the file picker opens on non-native devices.
                                            if (willBlurTextInputOnTapOutsideFunc) {
                                                shouldBlockEmojiCalc.current = true;
                                                shouldBlockMentionCalc.current = true;
                                            }
                                            openPicker({
                                                onPicked: displayFileInModal,
                                            });
                                        };
                                        const menuItems = [
                                            ...moneyRequestOptions,
                                            ...taskOption,
                                            {
                                                icon: Expensicons.Paperclip,
                                                text: translate('reportActionCompose.addAttachment'),
                                                onSelected: () => {
                                                    if (Browser.isSafari()) {
                                                        return;
                                                    }
                                                    triggerAttachmentPicker();
                                                },
                                            },
                                        ];
                                        return (
                                            <>
                                                <View
                                                    style={[
                                                        styles.dFlex,
                                                        styles.flexColumn,
                                                        isFullSizeComposerAvailable || isComposerFullSize ? styles.justifyContentBetween : styles.justifyContentCenter,
                                                    ]}
                                                >
                                                    {isComposerFullSize && (
                                                        <Tooltip text={translate('reportActionCompose.collapse')}>
                                                            <PressableWithFeedback
                                                                onPress={(e) => {
                                                                    e.preventDefault();
                                                                    updateShouldShowSuggestionMenuToFalse();
                                                                    Report.setIsComposerFullSize(reportID, false);
                                                                }}
                                                                // Keep focus on the composer when Collapse button is clicked.
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                style={styles.composerSizeButton}
                                                                disabled={isBlockedFromConcierge || disabled}
                                                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                                accessibilityLabel={translate('reportActionCompose.collapse')}
                                                            >
                                                                <Icon src={Expensicons.Collapse} />
                                                            </PressableWithFeedback>
                                                        </Tooltip>
                                                    )}
                                                    {!isComposerFullSize && isFullSizeComposerAvailable && (
                                                        <Tooltip text={translate('reportActionCompose.expand')}>
                                                            <PressableWithFeedback
                                                                onPress={(e) => {
                                                                    e.preventDefault();
                                                                    updateShouldShowSuggestionMenuToFalse();
                                                                    Report.setIsComposerFullSize(reportID, true);
                                                                }}
                                                                // Keep focus on the composer when Expand button is clicked.
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                style={styles.composerSizeButton}
                                                                disabled={isBlockedFromConcierge || disabled}
                                                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                                accessibilityLabel={translate('reportActionCompose.expand')}
                                                            >
                                                                <Icon src={Expensicons.Expand} />
                                                            </PressableWithFeedback>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip text={translate('reportActionCompose.addAction')}>
                                                        <PressableWithFeedback
                                                            ref={actionButtonRef}
                                                            onPress={(e) => {
                                                                e.preventDefault();

                                                                // Drop focus to avoid blue focus ring.
                                                                actionButtonRef.current.blur();
                                                                setMenuVisibility(!isMenuVisible);
                                                            }}
                                                            style={styles.composerSizeButton}
                                                            disabled={isBlockedFromConcierge || disabled}
                                                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                            accessibilityLabel={translate('reportActionCompose.addAction')}
                                                        >
                                                            <Icon src={Expensicons.Plus} />
                                                        </PressableWithFeedback>
                                                    </Tooltip>
                                                </View>
                                                <PopoverMenu
                                                    animationInTiming={CONST.ANIMATION_IN_TIMING}
                                                    isVisible={isMenuVisible}
                                                    onClose={() => setMenuVisibility(false)}
                                                    onItemSelected={(item, index) => {
                                                        setMenuVisibility(false);

                                                        // In order for the file picker to open dynamically, the click
                                                        // function must be called from within a event handler that was initiated
                                                        // by the user on Safari.
                                                        if (index === menuItems.length - 1 && Browser.isSafari()) {
                                                            triggerAttachmentPicker();
                                                        }
                                                    }}
                                                    anchorPosition={styles.createMenuPositionReportActionCompose(windowHeight)}
                                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
                                                    menuItems={menuItems}
                                                    withoutOverlay
                                                    anchorRef={actionButtonRef}
                                                />
                                            </>
                                        );
                                    }}
                                </AttachmentPicker>
                                <View style={[containerComposeStyles, styles.textInputComposeBorder]}>
                                    <Composer
                                        checkComposerVisibility={checkComposerVisibility}
                                        autoFocus={shouldAutoFocus}
                                        multiline
                                        ref={setTextInputRef}
                                        textAlignVertical="top"
                                        placeholder={inputPlaceholder}
                                        placeholderTextColor={themeColors.placeholderText}
                                        onChangeText={(commentValue) => updateComment(commentValue, true)}
                                        onKeyPress={triggerHotkeyActions}
                                        style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                                        maxLines={maxComposerLines}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => {
                                            setIsFocused(false);
                                            resetSuggestions();
                                        }}
                                        onClick={() => {
                                            shouldBlockEmojiCalc.current = false;
                                            shouldBlockMentionCalc.current = false;
                                        }}
                                        onPasteFile={displayFileInModal}
                                        shouldClear={textInputShouldClear}
                                        onClear={() => setTextInputShouldClear(false)}
                                        isDisabled={isBlockedFromConcierge || disabled}
                                        selection={selection}
                                        onSelectionChange={onSelectionChange}
                                        isFullComposerAvailable={isFullSizeComposerAvailable}
                                        setIsFullComposerAvailable={setIsFullComposerAvailable}
                                        isComposerFullSize={isComposerFullSize}
                                        value={value}
                                        numberOfLines={numberOfLines}
                                        onNumberOfLinesChange={updateNumberOfLines}
                                        shouldCalculateCaretPosition
                                        onLayout={(e) => {
                                            const composerLayoutHeight = e.nativeEvent.layout.height;
                                            if (composerHeight === composerLayoutHeight) {
                                                return;
                                            }
                                            setComposerHeight(composerLayoutHeight);
                                        }}
                                        onScroll={() => updateShouldShowSuggestionMenuToFalse()}
                                    />
                                </View>
                                <ReportDropUI
                                    onDrop={(e) => {
                                        if (isAttachmentPreviewActive) {
                                            return;
                                        }
                                        const data = lodashGet(e, ['dataTransfer', 'items', 0]);
                                        displayFileInModal(data);
                                    }}
                                />
                            </>
                        )}
                    </AttachmentModal>
                    {DeviceCapabilities.canUseTouchScreen() && isMediumScreenWidth ? null : (
                        <EmojiPickerButton
                            isDisabled={isBlockedFromConcierge || disabled}
                            onModalHide={() => focus(true)}
                            onEmojiSelected={replaceSelectionWithText}
                        />
                    )}
                    <View
                        style={[styles.justifyContentEnd]}
                        // Keep focus on the composer when Send message is clicked.
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <GestureDetector gesture={Tap}>
                            <Tooltip text={translate('common.send')}>
                                <PressableWithFeedback
                                    style={({pressed, isDisabled}) => [
                                        styles.chatItemSubmitButton,
                                        isCommentEmpty || hasExceededMaxCommentLength || pressed || isDisabled ? undefined : styles.buttonSuccess,
                                        isCommentEmpty || isBlockedFromConcierge || disabled || hasExceededMaxCommentLength ? styles.cursorDisabled : undefined,
                                    ]}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                    accessibilityLabel={translate('common.send')}
                                >
                                    {({pressed}) => (
                                        <Icon
                                            src={Expensicons.Send}
                                            fill={isCommentEmpty || hasExceededMaxCommentLength || pressed ? themeColors.icon : themeColors.textLight}
                                        />
                                    )}
                                </PressableWithFeedback>
                            </Tooltip>
                        </GestureDetector>
                    </View>
                </View>
                <View
                    style={[
                        styles.flexRow,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                        (!isSmallScreenWidth || (isSmallScreenWidth && !network.isOffline)) && styles.chatItemComposeSecondaryRow,
                    ]}
                >
                    {!isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                    <ReportTypingIndicator reportID={reportID} />
                    <ExceededCommentLength
                        comment={commentRef.current}
                        onExceededMaxCommentLength={setExceededMaxCommentLength}
                    />
                </View>
            </OfflineWithFeedback>
            {isEmojiSuggestionsMenuVisible && (
                <EmojiSuggestions
                    onClose={() => setSuggestionValues((prevState) => ({...prevState, suggestedEmojis: []}))}
                    highlightedEmojiIndex={highlightedEmojiIndex}
                    emojis={suggestionValues.suggestedEmojis}
                    comment={value}
                    updateComment={(newComment) => setValue(newComment)}
                    colonIndex={suggestionValues.colonIndex}
                    prefix={value.slice(suggestionValues.colonIndex + 1, selection.start)}
                    onSelect={insertSelectedEmoji}
                    isComposerFullSize={isComposerFullSize}
                    preferredSkinToneIndex={preferredSkinTone}
                    isEmojiPickerLarge={suggestionValues.isAutoSuggestionPickerLarge}
                    composerHeight={composerHeight}
                    shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                />
            )}
            {isMentionSuggestionsMenuVisible && (
                <MentionSuggestions
                    onClose={() => setSuggestionValues((prevState) => ({...prevState, suggestedMentions: []}))}
                    highlightedMentionIndex={highlightedMentionIndex}
                    mentions={suggestionValues.suggestedMentions}
                    comment={value}
                    updateComment={(newComment) => setValue(newComment)}
                    colonIndex={suggestionValues.colonIndex}
                    prefix={suggestionValues.mentionPrefix}
                    onSelect={insertSelectedMention}
                    isComposerFullSize={isComposerFullSize}
                    isMentionPickerLarge={suggestionValues.isAutoSuggestionPickerLarge}
                    composerHeight={composerHeight}
                    shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                />
            )}
        </View>
    );
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withNavigation,
    withNavigationFocus,
    withLocalize,
    withNetwork(),
    withCurrentUserPersonalDetails,
    withKeyboardState,
    withAnimatedRef,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        comment: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        },
        numberOfLines: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}`,
        },
        modal: {
            key: ONYXKEYS.MODAL,
        },
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            selector: EmojiUtils.getPreferredSkinToneIndex,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        shouldShowComposeInput: {
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            canEvict: false,
        },
    }),
)(ReportActionCompose);
