import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
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
import willBlurTextInputOnTapOutside from '../../../libs/willBlurTextInputOnTapOutside';
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
import * as EmojiUtils from '../../../libs/EmojiUtils';
import ReportDropUI from './ReportDropUI';
import DragAndDrop from '../../../components/DragAndDrop';
import reportPropTypes from '../../reportPropTypes';
import EmojiSuggestions from '../../../components/EmojiSuggestions';
import withKeyboardState, {keyboardStatePropTypes} from '../../../components/withKeyboardState';
import ArrowKeyFocusManager from '../../../components/ArrowKeyFocusManager';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';

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

    /** Whether user interactions should be disabled */
    // TODO: Should be isDisabled
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

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
    ...keyboardStatePropTypes,
};

const defaultProps = {
    betas: [],
    comment: '',
    numberOfLines: 1,
    modal: {},
    report: {},
    reportActions: [],
    blockedFromConcierge: {},
    personalDetails: {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    frequentlyUsedEmojis: [],
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

const ReportActionCompose = (props) => {
    // TODO: Pass to composer
    const composer = useRef();
    ReportActionComposeFocusManager.composerRef.current = composer;

    const [comment, setComment] = useState(props.comment);
    const [isCommentTooLong, setIsCommentTooLong] = useState(ReportUtils.getCommentLength(comment) > CONST.MAX_COMMENT_LENGTH);
    const [selection, setSelection] = useState({start: props.comment.length, end: props.comment.length});
    const [isFocused, setIsFocused] = useState(willBlurTextInputOnTapOutside() && !this.props.modal.isVisible && !this.props.modal.willAlertModalBecomeVisible);
    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(props.isComposerFullSize);
    const [shouldClearTextInput, setShouldClearTextInput] = useState(false);
    // TODO: more descriptive name?
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [suggestedEmojis, setSuggestedEmojis] = useState([]);
    const [highlightedEmojiIndex, setHighlightedEmojiIndex] = useState(0);
    // TODO: Maybe get rid of lastColonIndex
    const [lastColonIndex, setLastColonIndex] = useState(-1);
    const [shouldShowEmojiSuggestionMenu, setShouldShowEmojiSuggestionMenu] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // TODO: try to derive composerHeight from the ref rather than using state
    const [composerHeight, setComposerHeight] = useState(0);

    // TODO: Correctly initialize isEmojiPickerLarge
    const [isEmojiPickerLarge, setIsEmojiPickerLarge] = useState(false);

    const isCommentEmpty = /^(\s)*$/.test(comment);
    const chatIncludesConcierge = useMemo(() => ReportUtils.chatIncludesConcierge(props.report), [props.report.participants]);
    const isUserBlockedFromConcierge = useMemo(() => (
         User.isBlockedFromConcierge(props.blockedFromConcierge) && chatIncludesConcierge
    ), [props.blockedFromConcierge, chatIncludesConcierge]);
    const conciergePlaceHolderRandomIndex = useMemo(
        () => _.random(props.translate('reportActionCompose.conciergePlaceholderOptions').length - (props.isSmallScreenWidth ? 4 : 1)),
    [props.isSmallScreenWidth, props.translate]);

    let placeholder = props.translate('reportActionCompose.writeSomething');
    if (chatIncludesConcierge) {
        placeholder = isUserBlockedFromConcierge
            ? props.translate('reportActionCompose.blockedFromConcierge')
            : props.translate('reportActionCompose.conciergePlaceholderOptions')[conciergePlaceHolderRandomIndex];
    }

    /**
     * Focus the composer text input.
     * @param {Boolean} [shouldDelay=false]
     */
    const focus = useCallback((shouldDelay = false) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        InteractionManager.runAfterInteractions(() => {
            if (!composer.current) {
                return;
            }

            if (!shouldDelay) {
                composer.current.focus();
            } else {
                // Keyboard is not opened after Emoji Picker is closed
                // SetTimeout is used as a workaround
                // https://github.com/react-native-modal/react-native-modal/issues/114
                // We carefully chose a delay. 100ms is found enough for keyboard to open.
                setTimeout(() => composer.current.focus(), 100);
            }
        });
    }, [composer.current]);

    const debouncedSaveReportComment = useCallback(_.debounce((newComment) => {
        Report.saveReportComment(props.reportID, newComment || '')
    }, 1000), [props.reportID]);

    /**
     * @param {String} newComment
     * @param {Boolean} shouldDebounceSaveComment
     */
    const updateComment = useCallback((newComment, shouldDebounceSaveComment = false) => {
        const commentAfterReplacingEmojis = EmojiUtils.replaceEmojis(commentAfterReplacingEmojis, props.isSmallScreenWidth);
        setComment(prevComment => {
            if (newComment !== commentAfterReplacingEmojis) {
                setSelection((prevSelection) => {
                    const remainder = comment.slice(prevSelection.end).length;
                    return ({
                        start: commentAfterReplacingEmojis.length - remainder,
                        end: commentAfterReplacingEmojis.length - remainder,
                    });
                })
            }

            // Check if a draft has been created or deleted
            if (prevComment.length === 0 && commentAfterReplacingEmojis.length !== 0) {
                Report.setReportWithDraft(props.reportID, true);
            } else if (commentAfterReplacingEmojis.length === 0) {
                Report.setReportWithDraft(props.reportID, false);
            }

            if (shouldDebounceSaveComment) {
                debouncedSaveReportComment(commentAfterReplacingEmojis);
            } else {
                Report.saveReportComment(props.reportID, commentAfterReplacingEmojis || '');
            }

            if (commentAfterReplacingEmojis) {
                this.debouncedBroadcastUserIsTyping();
            }

            return commentAfterReplacingEmojis;
        });
    }, [props.reportID, props.isSmallScreenWidth]);

    /**
     * Replace the code of emoji and update selection
     * @param {Number} highlightedEmojiIndex
     */
    const insertSelectedEmoji = useCallback((highlightedEmojiIndex) => {
        const commentBeforeColon = comment.slice(0, lastColonIndex);
        const emojiObject = suggestedEmojis[highlightedEmojiIndex];
        const emojiCode = emojiObject.types && emojiObject.types[props.preferredSkinTone]
            ? emojiObject.types[props.preferredSkinTone]
            : emojiObject.code;
        const commentAfterColonWithEmojiNameRemoved = comment.slice(selection.end).replace(CONST.REGEX.EMOJI_REPLACER, CONST.SPACE);
        updateComment(`${commentBeforeColon}${emojiCode} ${commentAfterColonWithEmojiNameRemoved}`, true);
        const newCursorPosition = lastColonIndex + emojiCode.length + CONST.SPACE_LENGTH;
        setSelection({start: newCursorPosition, end: newCursorPosition});
        setSuggestedEmojis([]);
        EmojiUtils.addToFrequentlyUsedEmojis(props.frequentlyUsedEmojis, emojiObject);
    }, [lastColonIndex, suggestedEmojis, comment, props.preferredSkinTone, props.frequentlyUsedEmojis]);

    const resetSuggestedEmoji = useCallback(() => {
        setSuggestedEmojis([]);
        setShouldShowEmojiSuggestionMenu(false);
    }, []);

    /**
     * @returns {String}
     */
    const prepareCommentAndResetComposer = () => {
        const trimmedComment = comment.trim();

        // Don't submit empty comments or comments that exceed the character limit
        if (isCommentEmpty || ReportUtils.getCommentLength(trimmedComment) > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        updateComment('');
        setShouldClearTextInput(true);
        if (props.isComposerFullSize) {
            Report.setIsComposerFullSize(props.reportID, false);
        }
        setIsFullComposerAvailable(true);

        return trimmedComment;
    };


    const submitForm = useCallback((e = null) => {
        if (e) {
            e.preventDefault();
        }

        // Since we're submitting the form here which should clear the composer
        // We don't really care about saving the draft the user was typing
        // We need to make sure an empty draft gets saved instead
        // TODO: need to validate if this works as expected
        debouncedSaveReportComment.cancel();

        prepareCommentAndResetComposer();
        const newComment = prepareCommentAndResetComposer();
        if (!newComment) {
            return;
        }

        props.onSubmit(newComment);
    }, [debouncedSaveReportComment]);

    const triggerHotkeyActions = useCallback((e) => {
        // Do not trigger actions for mobileWeb or native clients that have the keyboard open because for those devices,
        // we want the return key to insert newlines rather than submit the form
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
            resetSuggestedEmoji();
            return;
        }

        if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
            e.preventDefault();
            submitForm();
        }

        if (e.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey && composer.current?.selectionStart === 0 && comment.length === 0 && !chatIncludesConcierge) {
            e.preventDefault();
            // TODO: improper sorting of reportActions here
            const lastReportAction = _.find(props.reportActions, action => ReportUtils.canEditReportAction(action));
            if (lastReportAction && lastReportAction !== -1) {
                Report.saveReportActionDraft(props.reportID, lastReportAction.reportActionID, _.last(lastReportAction.message).html);
            }
        }
    }, [
        props.isSmallScreenWidth,
        props.isKeyboardShown,
        suggestedEmojis,
        composer.current?.selectionStart,
        comment,
        chatIncludesConcierge,
        props.reportActions,
        props.reportID,
    ]);

    const calculateEmojiSuggestion = useCallback(() => {
        const leftString = comment.substring(0, selection.end);
        const colonIndex = leftString.lastIndexOf(':');

        // the larger composerHeight the less space for EmojiPicker, Pixel 2 has pretty small screen and this value equal 5.3
        const hasEnoughSpaceForLargeSuggestion = props.windowHeight / composerHeight >= 6.8;
        const isEmojiPickerLarge = !props.isSmallScreenWidth || hasEnoughSpaceForLargeSuggestion;

        LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

        const newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString);
        setSuggestedEmojis(newSuggestedEmojis);
        setShouldShowEmojiSuggestionMenu(!_.isEmpty(newSuggestedEmojis))
        setHighlightedEmojiIndex(0);
        setLastColonIndex(colonIndex);
        setIsEmojiPickerLarge(isEmojiPickerLarge);
    }, [comment, selection, composerHeight, props.windowHeight, props.isSmallScreenWidth]);

    const addEmojiToTextBox = useCallback((emoji) => {
        const emojiWithSpace = `${emoji} `;
        setSelection((prevSelection) => ({
            start: prevSelection.start + emojiWithSpace.length,
            end: prevSelection.end + emojiWithSpace.length,
        }));
        const newComment = comment.slice(0, selection.start)
            + emojiWithSpace
            + comment.slice(selection.end);
        updateComment(newComment);
    }, [comment, selection]);

    /**
     * Sync the comment state with props.comment. This can change when:
     *
     * - The report changes
     * - The comment is edited from another tab
     */
    useEffect(() => {
        updateComment(props.comment);
    }, [props.comment, props.reportID]);

    /**
     * Update the composer when the comment length is exceeded.
     * Shows red borders and prevents the comment from being sent.
     * Kept in separate state and debounced because ReportUtils.getCommentLength is an expensive calculation.
     */
    useEffect(_.debounce(
        () => setIsCommentTooLong(ReportUtils.getCommentLength(comment) > CONST.MAX_COMMENT_LENGTH),
        CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME
    ), [comment]);

    /**
     * Register a callback used outside of this component to give focus back to the compose input.
     * TODO: we should clean up this convoluted code and instead move focus management to something like ReportFooter.js or another higher up component
     */
    useEffect(() => {
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!willBlurTextInputOnTapOutside() || !props.isFocused) {
                return;
            }

            focus(false);
        });
        return () => ReportActionComposeFocusManager.clear();
    }, []);

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        return KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (!isFocused || comment.length === 0) {
                return;
            }

            updateComment('', true);
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);
    }, []);

    // TODO: This is kind of an anti-pattern. We should trigger this from wherever the navigation action happens
    //       Also, drawer is being ripped out soon so this should be fine for now
    const wasDrawerOpen = useRef(props.isDrawerOpen);
    useEffect(() => {
        const sidebarOpened = props.isDrawerOpen && !wasDrawerOpen;
        if (!sidebarOpened) {
            return;
        }
        toggleReportActionComposeView(true);
    }, [props.isDrawerOpen]);

    // We want to focus or refocus the input when a modal has been closed and the underlying screen is focused.
    // We avoid doing this on native platforms since the software keyboard popping open creates a jarring UX.
    // TODO: Should create usePrevious hook?
    const wasModalVisible = useRef(props.modal.isVisible);
    useEffect(() => {
        if (willBlurTextInputOnTapOutside() && props.isFocused && wasModalVisible && !props.modal.isVisible) {
            focus();
        }
    }, [props.isFocused, props.modal.isVisible]);

    const reportParticipants = useMemo(() => (
        _.without(lodashGet(props.report, 'participants', []), props.currentUserPersonalDetails.login)
    ), [props.report.participants, props.currentUserPersonalDetails.login]);

    const reportRecipient = useMemo(() => {
        const participantsWithoutExpensifyEmails = _.difference(reportParticipants, CONST.EXPENSIFY_EMAILS);
        return props.personalDetails[participantsWithoutExpensifyEmails[0]];
    }, [reportParticipants, props.personalDetails]);

    const shouldShowReportRecipientLocalTime = useMemo(() => (
        ReportUtils.canShowReportRecipientLocalTime(props.personalDetails, props.report)
        && !props.isComposerFullSize
    ), [reportRecipient, props.isComposerFullSize]);

    const moneyRequestMenuOptions = useMemo(() => {
        const options = {
            [CONST.IOU.IOU_TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: props.translate('iou.splitBill'),
                onSelected: () => Navigation.navigate(ROUTES.getIouSplitRoute(props.reportID)),
            },
            [CONST.IOU.IOU_TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: props.translate('iou.requestMoney'),
                onSelected: () => Navigation.navigate(ROUTES.getIouRequestRoute(props.reportID)),
            },
            [CONST.IOU.IOU_TYPE.SEND]: {
                icon: Expensicons.Send,
                text: props.translate('iou.sendMoney'),
                onSelected: () => Navigation.navigate(ROUTES.getIOUSendRoute(props.reportID)),
            },
        };
        return _.map(
            ReportUtils.getMoneyRequestOptions(props.report, reportParticipants, props.betas),
            option => options[option],
        );
    }, [props.reportID, reportParticipants, props.betas, props.translate]);

    const shouldUseFocusedColor = !isUserBlockedFromConcierge && !props.isDisabled && (isFocused || isDraggingOver);

    let maxLines = props.isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;
    if (props.isComposerFullSize) {
        maxLines = CONST.COMPOSER.MAX_LINES_FULL;
    }

    return (
        <View style={[
            shouldShowReportRecipientLocalTime && !lodashGet(props.network, 'isOffline') && styles.chatItemComposeWithFirstRow,
            props.isComposerFullSize && styles.chatItemFullComposeRow,
        ]}>
            {shouldShowReportRecipientLocalTime && <ParticipantLocalTime participant={reportParticipant} />}
            <View style={[
                shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                styles.flexRow,
                styles.chatItemComposeBox,
                isComposerFullSize && styles.chatItemFullComposeBox,
                isCommentTooLong && styles.borderColorDanger,
            ]}>
                <AttachmentModal
                    headerTitle={props.translate('reportActionCompose.sendAttachment')}
                    onConfirm={(file) => {
                        const trimmedComment = prepareCommentAndResetComposer();
                        Report.addAttachment(props.reportID, file, trimmedComment);
                        setShouldClearTextInput(false);
                    }}
                >
                    {({displayFileInModal}) => (
                        <>
                            <AttachmentPicker>
                                {({openPicker}) => (
                                    <>
                                        <View style={[
                                            styles.dFlex,
                                            styles.flexColumn,
                                            (isFullComposerAvailable || props.isComposerFullSize) ? styles.justifyContentBetween : styles.justifyContentEnd,
                                        ]}>
                                            {props.isComposerFullSize && (
                                                <Tooltip text={props.translate('reportActionCompose.collapse')}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.preventDefault();
                                                            Report.setIsComposerFullSize(props.reportID, false);
                                                            if (!shouldShowEmojiSuggestionMenu) {
                                                                return;
                                                            }
                                                            setShouldShowEmojiSuggestionMenu(false);
                                                        }}
                                                        onMouseDown={e => e.preventDefault()}
                                                        style={styles.composerSizeButton}
                                                        disabled={isUserBlockedFromConcierge || props.disabled}
                                                    >
                                                        <Icon src={Expensicons.Collapse} />
                                                    </TouchableOpacity>
                                                </Tooltip>
                                            )}
                                            {!props.isComposerFullSize && isFullComposerAvailable && (
                                                <Tooltip text={props.translate('reportActionCompose.expand')}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.preventDefault();
                                                            Report.setIsComposerFullSize(props.reportID, true);
                                                            if (!shouldShowEmojiSuggestionMenu) {
                                                                return;
                                                            }
                                                            setShouldShowEmojiSuggestionMenu(false);
                                                        }}

                                                        // Keep focus on the composer when Expand button is clicked.
                                                        onMouseDown={e => e.preventDefault()}
                                                        style={styles.composerSizeButton}
                                                        disabled={isUserBlockedFromConcierge || props.disabled}
                                                    >
                                                        <Icon src={Expensicons.Expand} />
                                                    </TouchableOpacity>
                                                </Tooltip>
                                            )}
                                            <Tooltip text={props.translate('reportActionCompose.addAction')}>
                                                <View style={styles.chatItemAttachBorder}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.preventDefault();
                                                            // TODO: validate that this works and ref is not needed
                                                            e.target.blur();
                                                            setIsMenuVisible(true);
                                                        }}
                                                        style={styles.composerSizeButton}
                                                        disabled={isUserBlockedFromConcierge || props.disabled}
                                                    >
                                                        <Icon src={Expensicons.Plus} />
                                                    </TouchableOpacity>
                                                </View>
                                            </Tooltip>
                                        </View>
                                        <PopoverMenu
                                            animationInTiming={CONST.ANIMATION_IN_TIMING}
                                            isVisible={isMenuVisible}
                                            onClose={() => setIsMenuVisible(false)}
                                            onItemSelected={() => setIsMenuVisible(false)}
                                            anchorPosition={styles.createMenuPositionReportActionCompose}
                                            menuItems={[
                                                ...moneyRequestMenuOptions,
                                                {
                                                    icon: Expensicons.Paperclip,
                                                    text: props.translate('reportActionCompose.addAttachment'),
                                                    onSelected: () => {
                                                        openPicker({
                                                            onPicked: displayFileInModal,
                                                        });
                                                    },
                                                }
                                            ]}
                                        />
                                    </>
                                )}
                            </AttachmentPicker>
                            <View style={[styles.textInputComposeSpacing]}>
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
                                        ref={composer}
                                        autoFocus={!this.props.modal.isVisible && (willBlurTextInputOnTapOutside() || _.size(props.reportActions) === 1)}
                                        multiline
                                        textAlignVertical="top"
                                        placeholder={placeholder}
                                        placeholderTextColor={themeColors.placeholderText}
                                        onChangeText={newComment => updateComment(newComment, true)}
                                        onKeyPress={triggerHotkeyActions}
                                        style={[styles.textInputCompose, props.isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                                        maxLines={maxLines}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => {
                                            setIsFocused(false)
                                            resetSuggestedEmoji();
                                        }}
                                        onPasteFile={displayFileInModal}
                                        shouldClear={shouldClearTextInput}
                                        onClear={() => setShouldClearTextInput(false)}
                                        isDisabled={(this.props.isDrawerOpen && this.props.isSmallScreenWidth) || isUserBlockedFromConcierge || props.disabled}
                                        selection={selection}
                                        onSelectionChange={(e) => {
                                            setSelection(e.nativeEvent.selection);
                                            calculateEmojiSuggestion();
                                        }}
                                        isFullComposerAvailable={isFullComposerAvailable}
                                        setIsFullComposerAvailable={setIsFullComposerAvailable}
                                        isComposerFullSize={props.isComposerFullSize}
                                        value={comment}
                                        numberOfLines={props.numberOfLines}
                                        onNumberOfLinesChange={(numberOfLines) => Report.saveReportCommentNumberOfLines(props.reportID, numberOfLines)}
                                        onLayout={(e) => {
                                            const actualComposerHeight = e.nativeEvent.layout.height;
                                            if (composerHeight === actualComposerHeight) {
                                                return;
                                            }
                                            setComposerHeight(actualComposerHeight);
                                        }}
                                        onScroll={() => {
                                            if (!shouldShowEmojiSuggestionMenu) {
                                                return;
                                            }
                                            setShouldShowEmojiSuggestionMenu(false)
                                        }}
                                    />
                                </DragAndDrop>
                            </View>
                        </>
                    )}
                </AttachmentModal>
                {DeviceCapabilities.canUseTouchScreen() && props.isMediumScreenWidth ? null : (
                    <EmojiPickerButton
                        isDisabled={isUserBlockedFromConcierge || props.disabled}
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
                            style={[
                                styles.chatItemSubmitButton,
                                (isCommentEmpty ? undefined : styles.buttonSuccess),
                            ]}
                            onPress={submitForm}
                            disabled={isCommentEmpty || isUserBlockedFromConcierge || props.disabled || isCommentTooLong}
                            hitSlop={{top: 3, right: 3, bottom: 3, left: 3}}
                        >
                            <Icon src={Expensicons.Send} fill={(isCommentEmpty || isCommentTooLong) ? themeColors.icon : themeColors.textLight} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>
            </View>
            <View style={[
                styles.flexRow,
                styles.justifyContentBetween,
                styles.alignItemsCenter,
                (!props.isSmallScreenWidth || !props.network.isOffline) && styles.chatItemComposeSecondaryRow,
            ]}>
                {!props.isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                <ReportTypingIndicator reportID={props.reportID} />
                <ExceededCommentLength comment={comment} onExceededMaxCommentLength={setIsCommentTooLong} />
            </View>
            {isDraggingOver && <ReportDropUI />}
            {!_.isEmpty(suggestedEmojis) && shouldShowEmojiSuggestionMenu && (
                <ArrowKeyFocusManager
                    focusedIndex={highlightedEmojiIndex}
                    onFocusedIndexChanged={setHighlightedEmojiIndex}
                    maxIndex={getMaxArrowIndex(suggestedEmojis.length, isEmojiPickerLarge)}
                    shouldExcludeTextAreaNodes={false}
                >
                    <EmojiSuggestions
                        onClose={() => setSuggestedEmojis([])}
                        highlightedEmojiIndex={highlightedEmojiIndex}
                        emojis={suggestedEmojis}
                        comment={comment}
                        updateComment={setComment}
                        colonIndex={lastColonIndex}
                        prefix={comment.slice(lastColonIndex + 1).split(' ')[0]}
                        onSelect={insertSelectedEmoji}
                        isComposerFullSize={props.isComposerFullSize}
                        // TODO: should subscribe to preferredSkinTone in EmojiSuggestions?
                        preferredSkinToneIndex={props.preferredSkinTone}
                        isEmojiPickerLarge={composerHeight}
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
