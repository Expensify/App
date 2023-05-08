import React, {
    useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableOpacity,
    InteractionManager,
    LayoutAnimation,
} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
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
import withDrawerState from '../../../components/withDrawerState';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import willBlurTextInputOnTapOutsideFunc from '../../../libs/willBlurTextInputOnTapOutside';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import reportActionPropTypes from './reportActionPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
import participantPropTypes from '../../../components/participantPropTypes';
import ParticipantLocalTime from './ParticipantLocalTime';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import * as User from '../../../libs/actions/User';
import Tooltip from '../../../components/Tooltip';
import EmojiPickerButton from '../../../components/EmojiPicker/EmojiPickerButton';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import toggleReportActionComposeView from '../../../libs/toggleReportActionComposeView';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ExceededCommentLength from '../../../components/ExceededCommentLength';
import withNavigationFocus from '../../../components/withNavigationFocus';
import withNavigation from '../../../components/withNavigation';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import ReportDropUI from './ReportDropUI';
import DragAndDrop from '../../../components/DragAndDrop';
import reportPropTypes from '../../reportPropTypes';
import EmojiSuggestions from '../../../components/EmojiSuggestions';
import withKeyboardState, {keyboardStatePropTypes} from '../../../components/withKeyboardState';
import ArrowKeyFocusManager from '../../../components/ArrowKeyFocusManager';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import * as ComposerUtils from '../../../libs/ComposerUtils';
import * as Welcome from '../../../libs/actions/Welcome';
import Permissions from '../../../libs/Permissions';

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

    /** Is the report view covered by the drawer */
    isDrawerOpen: PropTypes.bool.isRequired,

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

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** User's frequently used emojis */
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.shape({
        code: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string),
    })),

    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

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
    blockedFromConcierge: {},
    personalDetails: {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    frequentlyUsedEmojis: [],
    isComposerFullSize: false,
    pendingAction: null,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

/**
  * Return the max available index for arrow manager.
 * @param {Number} numRows
 * @param {Boolean} isEmojiPickerLarge
 * @returns {Number}
 */
const getMaxArrowIndex = (numRows, isEmojiPickerLarge) => {
    // EmojiRowCount is number of emoji suggestions. For small screen we can fit 3 items and for large we show up to 5 items
    const emojiRowCount = isEmojiPickerLarge
        ? Math.max(numRows, CONST.EMOJI_SUGGESTER.MAX_AMOUNT_OF_ITEMS)
        : Math.max(numRows, CONST.EMOJI_SUGGESTER.MIN_AMOUNT_OF_ITEMS);

    // -1 because we start at 0
    return emojiRowCount - 1;
};

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

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
    const leftWords = str.slice(0, pos).split(CONST.REGEX.NEW_LINE_OR_WHITE_SPACE_OR_EMOJI);
    const leftWord = _.last(leftWords);
    return CONST.REGEX.HAS_COLON_ONLY_AT_THE_BEGINNING.test(leftWord) && leftWord.length > 2;
};
function ReportActionCompose(props) {
    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(willBlurTextInputOnTapOutside && !props.modal.isVisible && !props.modal.willAlertModalBecomeVisible);
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(props.isComposerFullSize);

    /**
     * Updates the should clear state of the composer
     */
    const [textInputShouldClear, setTextInputShouldClear] = useState(false);
    const [isCommentEmpty, setIsCommentEmpty] = useState(props.comment.length === 0);

    /**
     * Updates the visibility state of the menu
     */
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [selection, setSelection] = useState({start: props.comment.length, end: props.comment.length});
    const [maxLines, setMaxLines] = useState(props.isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES);
    const [value, setValue] = useState(props.comment);

    const [suggestedEmojis, setSuggestedEmojis] = useState([]);
    const [highlightedEmojiIndex, setHighlightedEmojiIndex] = useState(0);
    const [colonIndex, setColonIndex] = useState(-1);
    const [shouldShowSuggestionMenu, setShouldShowSuggestionMenu] = useState(false);
    const [shouldBlockEmojiCalc, setShouldBlockEmojiCalc] = useState(false);
    const [isEmojiPickerLarge, setIsEmojiPickerLarge] = useState(false);
    const [composerHeight, setComposerHeight] = useState(0);

    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     */
    const [hasExceededMaxCommentLength, setExceededMaxCommentLength] = useState(false);

    // TODO_S: double check useRefs
    const unsubscribeEscapeKey = useRef(null);
    const comment = useRef(props.comment);
    const textInput = useRef(null);
    const actionButton = useRef(null);
    const prevPropsRef = useRef();

    // If we are on a small width device then don't show last 3 items from conciergePlaceholderOptions
    const conciergePlaceholderRandomIndex = useMemo(
        () => _.random(props.translate('reportActionCompose.conciergePlaceholderOptions').length - (props.isSmallScreenWidth ? 4 : 1)),
        [props.isSmallScreenWidth, props.translate],
    );

    // Placeholder to display in the chat input.
    const inputPlaceholder = useMemo(() => {
        if (ReportUtils.chatIncludesConcierge(props.report)) {
            if (User.isBlockedFromConcierge(props.blockedFromConcierge)) {
                return props.translate('reportActionCompose.blockedFromConcierge');
            }

            return props.translate('reportActionCompose.conciergePlaceholderOptions')[conciergePlaceholderRandomIndex];
        }

        return props.translate('reportActionCompose.writeSomething');
    }, [props.translate, props.report, props.blockedFromConcierge, conciergePlaceholderRandomIndex]);

    /**
     * Focus the composer text input
     * @param {Boolean} [shouldDelay=false] Impose delay before focusing the composer
     * @memberof ReportActionCompose
     */
    const focus = useCallback((shouldDelay = false) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        InteractionManager.runAfterInteractions(() => {
            if (!textInput.current) {
                return;
            }

            if (!shouldDelay) {
                textInput.current.focus();
            } else {
                // Keyboard is not opened after Emoji Picker is closed
                // SetTimeout is used as a workaround
                // https://github.com/react-native-modal/react-native-modal/issues/114
                // We carefully choose a delay. 100ms is found enough for keyboard to open.
                setTimeout(() => textInput.current.focus(), 100);
            }
        });
    }, []);

    /**
     * Update the value of the comment in Onyx
     *
     * @param {String} comment
     * @param {Boolean} shouldDebounceSaveComment
     */
    const updateComment = useCallback((commentValue, shouldDebounceSaveComment) => {
        const newComment = EmojiUtils.replaceEmojis(commentValue, props.isSmallScreenWidth, props.preferredSkinTone);

        setIsCommentEmpty(!!newComment.match(/^(\s)*$/));
        setValue(newComment);
        if (commentValue !== newComment) {
            const remainder = value.slice(selection.end).length;
            setSelection({
                start: newComment.length - remainder,
                end: newComment.length - remainder,
            });
        }

        // Indicate that draft has been created.
        if (comment.current.length === 0 && newComment.length !== 0) {
            Report.setReportWithDraft(props.reportID, true);
        }

        // The draft has been deleted.
        if (newComment.length === 0) {
            Report.setReportWithDraft(props.reportID, false);
        }

        comment.current = newComment;
        if (shouldDebounceSaveComment) {
            debouncedSaveReportComment(props.reportID, newComment);
        } else {
            Report.saveReportComment(props.reportID, newComment || '');
        }
        if (newComment) {
            debouncedBroadcastUserIsTyping(props.reportID);
        }
    }, [props.isSmallScreenWidth, props.preferredSkinTone, props.reportID, selection.end, value]);

    /**
     * Set the maximum number of lines for the composer
     */
    const updateMaxLines = useCallback(() => {
        let maxLinesNumber = props.isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;
        if (props.isComposerFullSize) {
            maxLinesNumber = CONST.COMPOSER.MAX_LINES_FULL;
        }
        setMaxLines(maxLinesNumber);
    }, [props.isSmallScreenWidth, props.isComposerFullSize]);

    /**
     * Used to show Popover menu on Workspace chat at first sign-in
     * @returns {Boolean}
     */
    const showPopoverMenu = useCallback(() => {
        setMenuVisibility(true);
        return true;
    }, []);

    useEffect(() => {
        // This callback is used in the contextMenuActions to manage giving focus back to the compose input.
        // TODO: we should clean up this convoluted code and instead move focus management to something like ReportFooter.js or another higher up component
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!willBlurTextInputOnTapOutside || !props.isFocused) {
                return;
            }

            focus(false);
        });

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        unsubscribeEscapeKey.current = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (!isFocused || comment.current.length === 0) {
                return;
            }

            updateComment('', true);
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true, true);

        updateMaxLines();
        updateComment(comment.current);

        // Shows Popover Menu on Workspace Chat at first sign-in
        if (!props.disabled) {
            Welcome.show({
                routes: lodashGet(props.navigation.getState(), 'routes', []),
                showPopoverMenu,
            });
        }

        return () => {
            ReportActionComposeFocusManager.clear();

            if (unsubscribeEscapeKey) {
                unsubscribeEscapeKey.current();
            }
        };
    }, []);

    // TODO: still under discussion - might use another approach to migrate ComponentDidUpdate
    useEffect(() => {
        const prevProps = prevPropsRef.current;

        if (prevProps) {
            const sidebarOpened = !prevProps.isDrawerOpen && props.isDrawerOpen;
            if (sidebarOpened) {
                toggleReportActionComposeView(true);
            }

            // We want to focus or refocus the input when a modal has been closed and the underlying screen is focused.
            // We avoid doing this on native platforms since the software keyboard popping
            // open creates a jarring and broken UX.
            if (willBlurTextInputOnTapOutside && props.isFocused
          && prevProps && prevProps.modal.isVisible && !props.modal.isVisible) {
                focus();
            }

            if (props.isComposerFullSize !== prevProps.isComposerFullSize) {
                updateMaxLines();
            }

            // Value state does not have the same value as comment props when the comment gets changed from another tab.
            // In this case, we should synchronize the value between tabs.
            const shouldSyncComment = prevProps.comment !== props.comment && value !== props.comment;

            if (props.report.reportID === prevProps.report.reportID && !shouldSyncComment) {
                return;
            }

            updateComment(comment.current);
        }
        prevPropsRef.current = {
            isDrawerOpen: props.isDrawerOpen,
            isFocused: props.isFocused,
            modal: props.modal,
            isComposerFullSize: props.isComposerFullSize,
            comment: props.comment,
            report: props.report,
        };
    }, [props.isDrawerOpen, props.isFocused, props.modal, props.isComposerFullSize, props.comment, props.report, focus, updateMaxLines, value, updateComment]);

    /**
     * Clean data related to EmojiSuggestions
     */
    const resetSuggestedEmojis = useCallback(() => {
        setSuggestedEmojis([]);
        setHighlightedEmojiIndex(0);
        setColonIndex(-1);
        setShouldShowSuggestionMenu(false);
        setIsEmojiPickerLarge(true);
    }, []);

    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    const calculateEmojiSuggestion = useCallback(
        (selectionEnd) => {
            if (!value) {
                resetSuggestedEmojis();
                return;
            }
            if (shouldBlockEmojiCalc) {
                setShouldBlockEmojiCalc(false);
                return;
            }
            const leftString = value.substring(0, selectionEnd);
            const isCurrentlyShowingEmojiSuggestion = isEmojiCode(value, selectionEnd);
            const newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString);

            if (newSuggestedEmojis.length && isCurrentlyShowingEmojiSuggestion) {
                setSuggestedEmojis(newSuggestedEmojis);
                setShouldShowSuggestionMenu(!_.isEmpty(newSuggestedEmojis));
            } else {
                setSuggestedEmojis([]);
                setShouldShowSuggestionMenu(false);
            }

            LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

            // the larger composerHeight the less space for EmojiPicker, Pixel 2 has pretty small screen and this value equal 5.3
            const hasEnoughSpaceForLargeSuggestion = props.windowHeight / composerHeight >= 6.8;
            setIsEmojiPickerLarge(!props.isSmallScreenWidth || (props.isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion));
            setColonIndex(leftString.lastIndexOf(':'));
            setHighlightedEmojiIndex(0);
        }, [composerHeight, value, props.windowHeight, props.isSmallScreenWidth, resetSuggestedEmojis, shouldBlockEmojiCalc],
    );

    const onSelectionChange = useCallback((e) => {
        setSelection(e.nativeEvent.selection);

        /**
         * we pass here e.nativeEvent.selection.end directly to calculateEmojiSuggestion
         * because in other case calculateEmojiSuggestion will have an old calculation value
         * of suggestion instead of current one
         */
        calculateEmojiSuggestion(e.nativeEvent.selection.end);
    }, [calculateEmojiSuggestion]);

    /**
     * Set the TextInput Ref
     *
     * @param {Element} el
     * @memberof ReportActionCompose
     */
    const setTextInputRef = useCallback((el) => {
        ReportActionComposeFocusManager.composerRef.current = el;
        textInput.current = el;
    }, []);

    /**
     * Returns the list of IOU Options
     *
     * @param {Array} reportParticipants
     * @returns {Array<object>}
     */
    const getMoneyRequestOptions = useCallback((reportParticipants) => {
        const options = {
            [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: props.translate('iou.splitBill'),
                onSelected: () => Navigation.navigate(ROUTES.getIouSplitRoute(props.reportID)),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: props.translate('iou.requestMoney'),
                onSelected: () => Navigation.navigate(ROUTES.getIouRequestRoute(props.reportID)),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: {
                icon: Expensicons.Send,
                text: props.translate('iou.sendMoney'),
                onSelected: () => Navigation.navigate(ROUTES.getIOUSendRoute(props.reportID)),
            },
        };

        // TODO: check for props in dependency array
        return _.map(ReportUtils.getMoneyRequestOptions(props.report, reportParticipants, props.betas), option => options[option]);
    }, [props]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        if (shouldShowSuggestionMenu) {
            setShouldShowSuggestionMenu(false);
        }
    }, [shouldShowSuggestionMenu]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    const updateShouldBlockEmojiCalcToFalse = useCallback(() => {
        if (shouldBlockEmojiCalc) {
            setShouldBlockEmojiCalc(false);
        }
    }, [shouldBlockEmojiCalc]);

    /**
     * Determines if we can show the task option
     * @param {Array} reportParticipants
     * @returns {Boolean}
     */
    const getTaskOption = useCallback((reportParticipants) => {
        // We only prevent the task option from showing if it's a DM and the other user is an Expensify default email
        if (!Permissions.canUseTasks(props.betas) || (lodashGet(props.report, 'participants', []).length === 1 && _.some(reportParticipants, email => _.contains(
            CONST.EXPENSIFY_EMAILS,
            email,
        )))) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: props.translate('newTaskPage.assignTask'),
                onSelected: () => Navigation.navigate(ROUTES.getNewTaskRoute(props.reportID)),
            },
        ];

        // TODO: check for props in dependency array
    }, [props]);

    /**
     * Replace the code of emoji and update selection
     * @param {Number} highlightedEmojiIndex
     */
    const insertSelectedEmoji = useCallback((selectedEmoji) => {
        const commentBeforeColon = value.slice(0, colonIndex);
        const emojiObject = suggestedEmojis[selectedEmoji];
        const emojiCode = emojiObject.types && emojiObject.types[props.preferredSkinTone] ? emojiObject.types[props.preferredSkinTone] : emojiObject.code;
        const commentAfterColonWithEmojiNameRemoved = value.slice(selection.end).replace(CONST.REGEX.EMOJI_REPLACER, CONST.SPACE);

        // TODO: check if prevState.colonIndex to coloIndex works correct
        updateComment(`${commentBeforeColon}${emojiCode} ${commentAfterColonWithEmojiNameRemoved}`, true);
        setSelection({
            start: colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
            end: colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
        });
        setSuggestedEmojis([]);

        EmojiUtils.addToFrequentlyUsedEmojis(props.frequentlyUsedEmojis, emojiObject);
    }, [colonIndex, props.frequentlyUsedEmojis, suggestedEmojis, value, props.preferredSkinTone, selection, updateComment]);

    const isEmptyChat = useCallback(() => _.size(props.reportActions) === 1, [props.reportActions]);

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     */
    const addEmojiToTextBox = useCallback((emoji) => {
        setSelection({
            start: selection.start + emoji.length,
            end: selection.start + emoji.length,
        });

        updateComment(ComposerUtils.insertText(comment.current, selection, emoji));
    }, [selection, updateComment]);

    /**
     * Update the number of lines for a comment in Onyx
     * @param {Number} numberOfLines
     */
    const updateNumberOfLines = useCallback((numberOfLines) => {
        Report.saveReportCommentNumberOfLines(props.reportID, numberOfLines);
    }, [props.reportID]);

    /**
     * @returns {String}
     */
    const prepareCommentAndResetComposer = useCallback(() => {
        const trimmedComment = comment.current.trim();

        // Don't submit empty comments or comments that exceed the character limit
        if (isCommentEmpty || ReportUtils.getCommentLength(trimmedComment) > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        updateComment('');
        setTextInputShouldClear(true);
        if (props.isComposerFullSize) {
            Report.setIsComposerFullSize(props.reportID, false);
        }
        setIsFullComposerAvailable(false);
        return trimmedComment;
    }, [isCommentEmpty, props.reportID, updateComment, props.isComposerFullSize]);

    /**
     * Add a new comment to this chat
     *
     * @param {SyntheticEvent} [e]
     */
    const submitForm = useCallback((e) => {
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

        props.onSubmit(newComment);

        // TODO: check props dependency
    }, [prepareCommentAndResetComposer, props]);

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    const triggerHotkeyActions = useCallback((e) => {
        // Do not trigger actions for mobileWeb or native clients that have the keyboard open because for those devices, we want the return key to insert newlines rather than submit the form
        if (!e || props.isSmallScreenWidth || props.isKeyboardShown) {
            return;
        }

        if ((e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestedEmojis.length) {
            e.preventDefault();
            insertSelectedEmoji(highlightedEmojiIndex);
            return;
        }
        if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey && suggestedEmojis.length) {
            e.preventDefault();
            resetSuggestedEmojis();
            return;
        }

        // Submit the form when Enter is pressed
        if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
            e.preventDefault();
            submitForm();
        }

        // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty and Chronos is not in the participants
        if (
            e.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey && textInput.current.selectionStart === 0 && isCommentEmpty && !ReportUtils.chatIncludesChronos(props.report)
        ) {
            e.preventDefault();

            const lastReportAction = _.find(
                props.reportActions,
                action => ReportUtils.canEditReportAction(action),
            );

            if (lastReportAction !== -1 && lastReportAction) {
                Report.saveReportActionDraft(props.reportID, lastReportAction.reportActionID, _.last(lastReportAction.message).html);
            }
        }
    }, [isCommentEmpty, props.isSmallScreenWidth, props.report, props.reportActions, props.reportID, resetSuggestedEmojis,
        submitForm, suggestedEmojis.length, props.isKeyboardShown, highlightedEmojiIndex, insertSelectedEmoji]);

    /**
     * @param {Object} file
     */
    const addAttachment = useCallback((file) => {
        // Since we're submitting the form here which should clear the composer
        // We don't really care about saving the draft the user was typing
        // We need to make sure an empty draft gets saved instead
        debouncedSaveReportComment.cancel();
        const newComment = prepareCommentAndResetComposer();
        Report.addAttachment(props.reportID, file, newComment);
        setTextInputShouldClear(false);
    }, [props.reportID, prepareCommentAndResetComposer]);

    const reportParticipants = _.without(lodashGet(props.report, 'participants', []), props.currentUserPersonalDetails.login);
    const participantsWithoutExpensifyEmails = _.difference(reportParticipants, CONST.EXPENSIFY_EMAILS);
    const reportRecipient = props.personalDetails[participantsWithoutExpensifyEmails[0]];

    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(props.personalDetails, props.report)
            && !props.isComposerFullSize;

    // Prevents focusing and showing the keyboard while the drawer is covering the chat.
    const isComposeDisabled = props.isDrawerOpen && props.isSmallScreenWidth;
    const isBlockedFromConcierge = ReportUtils.chatIncludesConcierge(props.report) && User.isBlockedFromConcierge(props.blockedFromConcierge);

    const shouldUseFocusedColor = !isBlockedFromConcierge && !props.disabled && (isFocused || isDraggingOver);

    return (
        <View style={[
            shouldShowReportRecipientLocalTime && !lodashGet(props.network, 'isOffline') && styles.chatItemComposeWithFirstRow,
            props.isComposerFullSize && styles.chatItemFullComposeRow,
        ]}
        >
            <OfflineWithFeedback
                pendingAction={props.pendingAction}
                style={props.isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                contentContainerStyle={props.isComposerFullSize ? styles.flex1 : {}}
            >
                {shouldShowReportRecipientLocalTime && <ParticipantLocalTime participant={reportRecipient} />}
                <View style={[
                    shouldUseFocusedColor
                        ? styles.chatItemComposeBoxFocusedColor
                        : styles.chatItemComposeBoxColor,
                    styles.flexRow,
                    styles.chatItemComposeBox,
                    props.isComposerFullSize && styles.chatItemFullComposeBox,
                    hasExceededMaxCommentLength && styles.borderColorDanger,
                ]}
                >
                    <AttachmentModal
                        headerTitle={props.translate('reportActionCompose.sendAttachment')}
                        onConfirm={addAttachment}
                        onModalHide={updateShouldBlockEmojiCalcToFalse}
                    >
                        {({displayFileInModal}) => (
                            <>
                                <AttachmentPicker>
                                    {({openPicker}) => (
                                        <>
                                            <View style={[
                                                styles.dFlex, styles.flexColumn,
                                                (isFullComposerAvailable || props.isComposerFullSize) ? styles.justifyContentBetween : styles.justifyContentEnd,
                                            ]}
                                            >
                                                {props.isComposerFullSize && (
                                                <Tooltip text={props.translate('reportActionCompose.collapse')}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.preventDefault();
                                                            updateShouldShowSuggestionMenuToFalse();
                                                            Report.setIsComposerFullSize(props.reportID, false);
                                                        }}

                                                                // Keep focus on the composer when Collapse button is clicked.
                                                        onMouseDown={e => e.preventDefault()}
                                                        style={styles.composerSizeButton}
                                                        disabled={isBlockedFromConcierge || props.disabled}
                                                    >
                                                        <Icon src={Expensicons.Collapse} />
                                                    </TouchableOpacity>
                                                </Tooltip>

                                                )}
                                                {(!props.isComposerFullSize && isFullComposerAvailable) && (
                                                <Tooltip text={props.translate('reportActionCompose.expand')}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.preventDefault();
                                                            updateShouldShowSuggestionMenuToFalse();
                                                            Report.setIsComposerFullSize(props.reportID, true);
                                                        }}

                                                                // Keep focus on the composer when Expand button is clicked.
                                                        onMouseDown={e => e.preventDefault()}
                                                        style={styles.composerSizeButton}
                                                        disabled={isBlockedFromConcierge || props.disabled}
                                                    >
                                                        <Icon src={Expensicons.Expand} />
                                                    </TouchableOpacity>
                                                </Tooltip>
                                                )}
                                                <Tooltip text={props.translate('reportActionCompose.addAction')}>
                                                    <TouchableOpacity
                                                        ref={actionButton}
                                                        onPress={(e) => {
                                                            e.preventDefault();

                                                            // Drop focus to avoid blue focus ring.
                                                            actionButton.current.blur();
                                                            setMenuVisibility(true);
                                                        }}
                                                        style={styles.composerSizeButton}
                                                        disabled={isBlockedFromConcierge || props.disabled}
                                                    >
                                                        <Icon src={Expensicons.Plus} />
                                                    </TouchableOpacity>
                                                </Tooltip>
                                            </View>
                                            <PopoverMenu
                                                animationInTiming={CONST.ANIMATION_IN_TIMING}
                                                isVisible={isMenuVisible}
                                                onClose={() => setMenuVisibility(false)}
                                                onItemSelected={() => setMenuVisibility(false)}
                                                anchorPosition={styles.createMenuPositionReportActionCompose}
                                                menuItems={[...getMoneyRequestOptions(reportParticipants), ...getTaskOption(reportParticipants),
                                                    {
                                                        icon: Expensicons.Paperclip,
                                                        text: props.translate('reportActionCompose.addAttachment'),
                                                        onSelected: () => {
                                                            // Set a flag to block emoji calculation until we're finished using the file picker,
                                                            // which will stop any flickering as the file picker opens on non-native devices.
                                                            if (willBlurTextInputOnTapOutside) {
                                                                setShouldBlockEmojiCalc(true);
                                                            }

                                                            openPicker({
                                                                onPicked: displayFileInModal,
                                                            });
                                                        },
                                                    },
                                                ]}
                                            />
                                        </>
                                    )}
                                </AttachmentPicker>
                                <View style={[styles.textInputComposeSpacing, styles.textInputComposeBorder]}>
                                    <DragAndDrop
                                        dropZoneId={CONST.REPORT.DROP_NATIVE_ID}
                                        activeDropZoneId={CONST.REPORT.ACTIVE_DROP_NATIVE_ID}
                                        onDragEnter={() => setIsDraggingOver(true)}
                                        onDragLeave={() => setIsDraggingOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();

                                            const file = lodashGet(e, ['dataTransfer', 'files', 0]);

                                            displayFileInModal(file);

                                            setIsDraggingOver(false);
                                        }}
                                        disabled={props.disabled}
                                    >
                                        <Composer
                                            autoFocus={!props.modal.isVisible && (willBlurTextInputOnTapOutside || isEmptyChat())}
                                            multiline
                                            ref={setTextInputRef}
                                            textAlignVertical="top"
                                            placeholder={inputPlaceholder}
                                            placeholderTextColor={themeColors.placeholderText}
                                            onChangeText={commentValue => updateComment(commentValue, true)}
                                            onKeyPress={triggerHotkeyActions}
                                            style={[styles.textInputCompose, props.isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                                            maxLines={maxLines}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => {
                                                setIsFocused(false);
                                                resetSuggestedEmojis();
                                            }}
                                            onClick={updateShouldBlockEmojiCalcToFalse}
                                            onPasteFile={displayFileInModal}
                                            shouldClear={textInputShouldClear}
                                            onClear={() => setTextInputShouldClear(false)}
                                            isDisabled={isComposeDisabled || isBlockedFromConcierge || props.disabled}
                                            selection={selection}
                                            onSelectionChange={onSelectionChange}
                                            isFullComposerAvailable={isFullComposerAvailable}
                                            setIsFullComposerAvailable={setIsFullComposerAvailable}
                                            isComposerFullSize={props.isComposerFullSize}
                                            value={value}
                                            numberOfLines={props.numberOfLines}
                                            onNumberOfLinesChange={updateNumberOfLines}
                                            onLayout={(e) => {
                                                const composerLayoutHeight = e.nativeEvent.layout.height;
                                                if (composerHeight === composerLayoutHeight) {
                                                    return;
                                                }
                                                setComposerHeight(composerLayoutHeight);
                                            }}
                                            onScroll={() => updateShouldShowSuggestionMenuToFalse()}
                                        />
                                    </DragAndDrop>
                                </View>
                            </>
                        )}
                    </AttachmentModal>
                    {DeviceCapabilities.canUseTouchScreen() && props.isMediumScreenWidth ? null : (
                        <EmojiPickerButton
                            isDisabled={isBlockedFromConcierge || props.disabled}
                            onModalHide={() => focus(true)}
                            onEmojiSelected={addEmojiToTextBox}
                        />
                    )}
                    <View
                        style={[styles.justifyContentEnd]}

                            // Keep focus on the composer when Send message is clicked.
                        onMouseDown={e => e.preventDefault()}
                    >
                        <Tooltip text={props.translate('common.send')}>
                            <TouchableOpacity
                                style={[styles.chatItemSubmitButton,
                                    (isCommentEmpty || hasExceededMaxCommentLength) ? undefined : styles.buttonSuccess,
                                ]}
                                onPress={submitForm}
                                disabled={isCommentEmpty || isBlockedFromConcierge || props.disabled || hasExceededMaxCommentLength}
                                hitSlop={{
                                    top: 3, right: 3, bottom: 3, left: 3,
                                }}
                            >
                                <Icon src={Expensicons.Send} fill={(isCommentEmpty || hasExceededMaxCommentLength) ? themeColors.icon : themeColors.textLight} />
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                </View>
                <View style={[
                    styles.flexRow,
                    styles.justifyContentBetween,
                    styles.alignItemsCenter,
                    (!props.isSmallScreenWidth || (props.isSmallScreenWidth && !props.network.isOffline)) && styles.chatItemComposeSecondaryRow]}
                >
                    {!props.isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                    <ReportTypingIndicator reportID={props.reportID} />
                    <ExceededCommentLength comment={comment.current} onExceededMaxCommentLength={setExceededMaxCommentLength} />
                </View>
            </OfflineWithFeedback>
            {isDraggingOver && <ReportDropUI />}
            {!_.isEmpty(suggestedEmojis) && shouldShowSuggestionMenu && (
            <ArrowKeyFocusManager
                focusedIndex={highlightedEmojiIndex}
                maxIndex={getMaxArrowIndex(suggestedEmojis.length, isEmojiPickerLarge)}
                shouldExcludeTextAreaNodes={false}
                onFocusedIndexChanged={index => setHighlightedEmojiIndex(index)}
            >
                <EmojiSuggestions
                    onClose={() => setSuggestedEmojis([])}
                    highlightedEmojiIndex={highlightedEmojiIndex}
                    emojis={suggestedEmojis}
                    comment={value}
                    updateComment={newComment => setValue(newComment)}
                    colonIndex={colonIndex}
                    prefix={value.slice(colonIndex + 1, selection.start)}
                    onSelect={insertSelectedEmoji}
                    isComposerFullSize={props.isComposerFullSize}
                    preferredSkinToneIndex={props.preferredSkinTone}
                    isEmojiPickerLarge={isEmojiPickerLarge}
                    composerHeight={composerHeight}
                    shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                />
            </ArrowKeyFocusManager>
            )}
        </View>
    );
}

ReportActionCompose.propTypes = propTypes;
ReportActionCompose.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withDrawerState,
    withNavigation,
    withNavigationFocus,
    withLocalize,
    withNetwork(),
    withPersonalDetails(),
    withCurrentUserPersonalDetails,
    withKeyboardState,
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
        frequentlyUsedEmojis: {
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
        },
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
    }),
)(ReportActionCompose);
