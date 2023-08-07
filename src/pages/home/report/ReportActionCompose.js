import React from 'react';
import PropTypes from 'prop-types';
import {View, InteractionManager, LayoutAnimation, NativeModules, findNodeHandle} from 'react-native';
import {runOnJS} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
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
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import willBlurTextInputOnTapOutside from '../../../libs/willBlurTextInputOnTapOutside';
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
import ArrowKeyFocusManager from '../../../components/ArrowKeyFocusManager';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ComposerUtils from '../../../libs/ComposerUtils';
import * as Welcome from '../../../libs/actions/Welcome';
import Permissions from '../../../libs/Permissions';
import containerComposeStyles from '../../../styles/containerComposeStyles';
import * as Task from '../../../libs/actions/Task';
import * as Browser from '../../../libs/Browser';
import * as IOU from '../../../libs/actions/IOU';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import * as KeyDownListener from '../../../libs/KeyboardShortcut/KeyDownPressListener';
import * as EmojiPickerActions from '../../../libs/actions/EmojiPickerAction';
import withAnimatedRef from '../../../components/withAnimatedRef';
import updatePropsPaperWorklet from '../../../libs/updatePropsPaperWorklet';

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

const {RNTextInputReset} = NativeModules;
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

class ReportActionCompose extends React.Component {
    constructor(props) {
        super(props);
        this.calculateEmojiSuggestion = _.debounce(this.calculateEmojiSuggestion, 10, false);
        this.calculateMentionSuggestion = _.debounce(this.calculateMentionSuggestion, 10, false);
        this.updateComment = this.updateComment.bind(this);
        this.debouncedSaveReportComment = _.debounce(this.debouncedSaveReportComment.bind(this), 1000, false);
        this.debouncedBroadcastUserIsTyping = _.debounce(this.debouncedBroadcastUserIsTyping.bind(this), 100, true);
        this.triggerHotkeyActions = this.triggerHotkeyActions.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setIsFocused = this.setIsFocused.bind(this);
        this.setIsFullComposerAvailable = this.setIsFullComposerAvailable.bind(this);
        this.focus = this.focus.bind(this);
        this.replaceSelectionWithText = this.replaceSelectionWithText.bind(this);
        this.focusComposerOnKeyPress = this.focusComposerOnKeyPress.bind(this);
        this.checkComposerVisibility = this.checkComposerVisibility.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.isEmojiCode = this.isEmojiCode.bind(this);
        this.isMentionCode = this.isMentionCode.bind(this);
        this.setTextInputRef = this.setTextInputRef.bind(this);
        this.getInputPlaceholder = this.getInputPlaceholder.bind(this);
        this.getMoneyRequestOptions = this.getMoneyRequestOptions.bind(this);
        this.getTaskOption = this.getTaskOption.bind(this);
        this.addAttachment = this.addAttachment.bind(this);
        this.insertSelectedEmoji = this.insertSelectedEmoji.bind(this);
        this.insertSelectedMention = this.insertSelectedMention.bind(this);
        this.setExceededMaxCommentLength = this.setExceededMaxCommentLength.bind(this);
        this.updateNumberOfLines = this.updateNumberOfLines.bind(this);
        this.showPopoverMenu = this.showPopoverMenu.bind(this);
        this.debouncedUpdateFrequentlyUsedEmojis = _.debounce(this.debouncedUpdateFrequentlyUsedEmojis.bind(this), 1000, false);
        this.comment = props.comment;
        this.insertedEmojis = [];

        this.attachmentModalRef = React.createRef();

        // React Native will retain focus on an input for native devices but web/mWeb behave differently so we have some focus management
        // code that will refocus the compose input after a user closes a modal or some other actions, see usage of ReportActionComposeFocusManager
        this.willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutside();

        // We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
        // prevent auto focus on existing chat for mobile device
        this.shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

        this.shouldAutoFocus = !props.modal.isVisible && (this.shouldFocusInputOnScreenFocus || this.isEmptyChat()) && props.shouldShowComposeInput;

        // These variables are used to decide whether to block the suggestions list from showing to prevent flickering
        this.shouldBlockEmojiCalc = false;
        this.shouldBlockMentionCalc = false;

        // For mobile Safari, updating the selection prop on an unfocused input will cause it to automatically gain focus
        // and subsequent programmatic focus shifts (e.g., modal focus trap) to show the blue frame (:focus-visible style),
        // so we need to ensure that it is only updated after focus.
        const isMobileSafari = Browser.isMobileSafari();

        this.unsubscribeNavigationBlur = () => null;
        this.unsubscribeNavigationFocus = () => null;

        this.state = {
            isFocused: this.shouldFocusInputOnScreenFocus && !this.props.modal.isVisible && !this.props.modal.willAlertModalBecomeVisible && this.props.shouldShowComposeInput,
            isFullComposerAvailable: props.isComposerFullSize,
            textInputShouldClear: false,
            isCommentEmpty: props.comment.length === 0,
            isMenuVisible: false,
            selection: {
                start: isMobileSafari && !this.shouldAutoFocus ? 0 : props.comment.length,
                end: isMobileSafari && !this.shouldAutoFocus ? 0 : props.comment.length,
            },
            value: props.comment,

            // If we are on a small width device then don't show last 3 items from conciergePlaceholderOptions
            conciergePlaceholderRandomIndex: _.random(this.props.translate('reportActionCompose.conciergePlaceholderOptions').length - (this.props.isSmallScreenWidth ? 4 : 1)),
            composerHeight: 0,
            hasExceededMaxCommentLength: false,
            isAttachmentPreviewActive: false,
            ...this.getDefaultSuggestionsValues(),
        };

        this.actionButtonRef = React.createRef();
    }

    componentDidMount() {
        this.unsubscribeNavigationBlur = this.props.navigation.addListener('blur', () => KeyDownListener.removeKeyDownPressListner(this.focusComposerOnKeyPress));
        this.unsubscribeNavigationFocus = this.props.navigation.addListener('focus', () => {
            KeyDownListener.addKeyDownPressListner(this.focusComposerOnKeyPress);
            this.setUpComposeFocusManager();
        });
        KeyDownListener.addKeyDownPressListner(this.focusComposerOnKeyPress);
        this.setUpComposeFocusManager();

        this.updateComment(this.comment);

        // Shows Popover Menu on Workspace Chat at first sign-in
        if (!this.props.disabled) {
            Welcome.show({
                routes: lodashGet(this.props.navigation.getState(), 'routes', []),
                showPopoverMenu: this.showPopoverMenu,
            });
        }

        if (this.props.comment.length !== 0) {
            Report.setReportWithDraft(this.props.reportID, true);
        }
    }

    componentDidUpdate(prevProps) {
        // We want to focus or refocus the input when a modal has been closed or the underlying screen is refocused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (this.willBlurTextInputOnTapOutside && !this.props.modal.isVisible && this.props.isFocused && (prevProps.modal.isVisible || !prevProps.isFocused)) {
            this.focus();
        }

        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        const shouldSyncComment = prevProps.comment !== this.props.comment && this.state.value !== this.props.comment;

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (this.props.preferredLocale === prevProps.preferredLocale && this.props.report.reportID === prevProps.report.reportID && !shouldSyncComment) {
            return;
        }

        this.updateComment(this.props.comment);
    }

    componentWillUnmount() {
        ReportActionComposeFocusManager.clear();

        KeyDownListener.removeKeyDownPressListner(this.focusComposerOnKeyPress);
        this.unsubscribeNavigationBlur();
        this.unsubscribeNavigationFocus();
    }

    onSelectionChange(e) {
        LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
        this.setState({selection: e.nativeEvent.selection});
        if (!this.state.value || e.nativeEvent.selection.end < 1) {
            this.resetSuggestions();
            this.shouldBlockEmojiCalc = false;
            this.shouldBlockMentionCalc = false;
            return;
        }
        this.calculateEmojiSuggestion();
        this.calculateMentionSuggestion();
    }

    setUpComposeFocusManager() {
        // This callback is used in the contextMenuActions to manage giving focus back to the compose input.
        // TODO: we should clean up this convoluted code and instead move focus management to something like ReportFooter.js or another higher up component
        ReportActionComposeFocusManager.onComposerFocus(() => {
            if (!this.willBlurTextInputOnTapOutside || !this.props.isFocused) {
                return;
            }

            this.focus(false);
        });
    }

    getDefaultSuggestionsValues() {
        return {
            suggestedEmojis: [],
            suggestedMentions: [],
            highlightedEmojiIndex: 0,
            highlightedMentionIndex: 0,
            colonIndex: -1,
            atSignIndex: -1,
            shouldShowEmojiSuggestionMenu: false,
            shouldShowMentionSuggestionMenu: false,
            mentionPrefix: '',
            isAutoSuggestionPickerLarge: false,
        };
    }

    /**
     * Updates the Highlight state of the composer
     *
     * @param {Boolean} shouldHighlight
     */
    setIsFocused(shouldHighlight) {
        this.setState({isFocused: shouldHighlight});
    }

    setIsFullComposerAvailable(isFullComposerAvailable) {
        this.setState({isFullComposerAvailable});
    }

    /**
     * Updates the should clear state of the composer
     *
     * @param {Boolean} shouldClear
     */
    setTextInputShouldClear(shouldClear) {
        this.setState({textInputShouldClear: shouldClear});
    }

    /**
     * Updates the visibility state of the menu
     *
     * @param {Boolean} isMenuVisible
     */
    setMenuVisibility(isMenuVisible) {
        this.setState({isMenuVisible});
    }

    /**
     * Set the TextInput Ref
     *
     * @param {Element} el
     * @memberof ReportActionCompose
     */
    setTextInputRef(el) {
        ReportActionComposeFocusManager.composerRef.current = el;
        this.textInput = el;
        if (_.isFunction(this.props.animatedRef)) {
            this.props.animatedRef(el);
        }
    }

    /**
     * Get the placeholder to display in the chat input.
     *
     * @return {String}
     */
    getInputPlaceholder() {
        if (ReportUtils.chatIncludesConcierge(this.props.report)) {
            if (User.isBlockedFromConcierge(this.props.blockedFromConcierge)) {
                return this.props.translate('reportActionCompose.blockedFromConcierge');
            }

            return this.props.translate('reportActionCompose.conciergePlaceholderOptions')[this.state.conciergePlaceholderRandomIndex];
        }

        return this.props.translate('reportActionCompose.writeSomething');
    }

    /**
     * Returns the list of IOU Options
     *
     * @param {Array<Number>} reportParticipants
     * @returns {Array<object>}
     */
    getMoneyRequestOptions(reportParticipants) {
        const options = {
            [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: this.props.translate('iou.splitBill'),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: this.props.translate('iou.requestMoney'),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: {
                icon: Expensicons.Send,
                text: this.props.translate('iou.sendMoney'),
            },
        };
        return _.map(ReportUtils.getMoneyRequestOptions(this.props.report, reportParticipants, this.props.betas), (option) => ({
            ...options[option],
            onSelected: () => IOU.startMoneyRequest(option, this.props.report.reportID),
        }));
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

    // eslint-disable-next-line rulesdir/prefer-early-return
    setShouldShowSuggestionMenuToFalse() {
        if (this.state && this.state.shouldShowEmojiSuggestionMenu) {
            this.setState({shouldShowEmojiSuggestionMenu: false});
        }
        if (this.state && this.state.shouldShowMentionSuggestionMenu) {
            this.setState({shouldShowMentionSuggestionMenu: false});
        }
    }

    /**
     * Determines if we can show the task option
     * @param {Array} reportParticipants
     * @returns {Boolean}
     */
    getTaskOption() {
        // We only prevent the task option from showing if it's a DM and the other user is an Expensify default email
        if (!Permissions.canUseTasks(this.props.betas) || ReportUtils.isExpensifyOnlyParticipantInReport(this.props.report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: this.props.translate('newTaskPage.assignTask'),
                onSelected: () => Task.clearOutTaskInfoAndNavigate(this.props.reportID),
            },
        ];
    }

    /**
     * Build the suggestions for mentions
     * @param {Object} personalDetails
     * @param {String} [searchValue]
     * @returns {Object}
     */
    getMentionOptions(personalDetails, searchValue = '') {
        const suggestions = [];

        if (CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchValue.toLowerCase())) {
            suggestions.push({
                text: CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                alternateText: this.props.translate('mentionSuggestions.hereAlternateText'),
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
    }

    /**
     * Clean data related to EmojiSuggestions and MentionSuggestions
     */
    resetSuggestions() {
        this.setState({
            ...this.getDefaultSuggestionsValues(),
        });
    }

    /**
     * Calculates and cares about the content of an Emoji Suggester
     */
    calculateEmojiSuggestion() {
        if (this.shouldBlockEmojiCalc) {
            this.shouldBlockEmojiCalc = false;
            return;
        }

        const leftString = this.state.value.substring(0, this.state.selection.end);
        const colonIndex = leftString.lastIndexOf(':');
        const isCurrentlyShowingEmojiSuggestion = this.isEmojiCode(this.state.value, this.state.selection.end);

        // the larger composerHeight the less space for EmojiPicker, Pixel 2 has pretty small screen and this value equal 5.3
        const hasEnoughSpaceForLargeSuggestion = this.props.windowHeight / this.state.composerHeight >= 6.8;
        const isAutoSuggestionPickerLarge = !this.props.isSmallScreenWidth || (this.props.isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion);

        const nextState = {
            suggestedEmojis: [],
            highlightedEmojiIndex: 0,
            colonIndex,
            shouldShowEmojiSuggestionMenu: false,
            isAutoSuggestionPickerLarge,
        };
        const newSuggestedEmojis = EmojiUtils.suggestEmojis(leftString, this.props.preferredLocale);

        if (newSuggestedEmojis.length && isCurrentlyShowingEmojiSuggestion) {
            nextState.suggestedEmojis = newSuggestedEmojis;
            nextState.shouldShowEmojiSuggestionMenu = !_.isEmpty(newSuggestedEmojis);
        }

        this.setState(nextState);
    }

    calculateMentionSuggestion() {
        if (this.shouldBlockMentionCalc) {
            this.shouldBlockMentionCalc = false;
            return;
        }

        const valueAfterTheCursor = this.state.value.substring(this.state.selection.end);
        const indexOfFirstWhitespaceCharOrEmojiAfterTheCursor = valueAfterTheCursor.search(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);

        let indexOfLastNonWhitespaceCharAfterTheCursor;
        if (indexOfFirstWhitespaceCharOrEmojiAfterTheCursor === -1) {
            // we didn't find a whitespace/emoji after the cursor, so we will use the entire string
            indexOfLastNonWhitespaceCharAfterTheCursor = this.state.value.length;
        } else {
            indexOfLastNonWhitespaceCharAfterTheCursor = indexOfFirstWhitespaceCharOrEmojiAfterTheCursor + this.state.selection.end;
        }

        const leftString = this.state.value.substring(0, indexOfLastNonWhitespaceCharAfterTheCursor);
        const words = leftString.split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
        const lastWord = _.last(words);

        let atSignIndex;
        if (lastWord.startsWith('@')) {
            atSignIndex = leftString.lastIndexOf(lastWord);
        }

        const prefix = lastWord.substring(1);

        const nextState = {
            suggestedMentions: [],
            highlightedMentionIndex: 0,
            atSignIndex,
            mentionPrefix: prefix,
        };

        const isCursorBeforeTheMention = valueAfterTheCursor.startsWith(lastWord);

        if (!isCursorBeforeTheMention && this.isMentionCode(lastWord)) {
            const suggestions = this.getMentionOptions(this.props.personalDetails, prefix);
            nextState.suggestedMentions = suggestions;
            nextState.shouldShowMentionSuggestionMenu = !_.isEmpty(suggestions);
        }

        this.setState(nextState);
    }

    /**
     * Check if this piece of string looks like an emoji
     * @param {String} str
     * @param {Number} pos
     * @returns {Boolean}
     */
    isEmojiCode(str, pos) {
        const leftWords = str.slice(0, pos).split(CONST.REGEX.SPECIAL_CHAR_OR_EMOJI);
        const leftWord = _.last(leftWords);

        return CONST.REGEX.HAS_COLON_ONLY_AT_THE_BEGINNING.test(leftWord) && leftWord.length > 2;
    }

    /**
     * Check if this piece of string looks like a mention
     * @param {String} str
     * @returns {Boolean}
     */
    isMentionCode(str) {
        return CONST.REGEX.HAS_AT_MOST_TWO_AT_SIGNS.test(str);
    }

    /**
     * Trims first character of the string if it is a space
     * @param {String} str
     * @returns {String}
     */
    trimLeadingSpace(str) {
        return str.slice(0, 1) === ' ' ? str.slice(1) : str;
    }

    /**
     * Replace the code of emoji and update selection
     * @param {Number} highlightedEmojiIndex
     */
    insertSelectedEmoji(highlightedEmojiIndex) {
        const commentBeforeColon = this.state.value.slice(0, this.state.colonIndex);
        const emojiObject = this.state.suggestedEmojis[highlightedEmojiIndex];
        const emojiCode = emojiObject.types && emojiObject.types[this.props.preferredSkinTone] ? emojiObject.types[this.props.preferredSkinTone] : emojiObject.code;
        const commentAfterColonWithEmojiNameRemoved = this.state.value.slice(this.state.selection.end);

        this.updateComment(`${commentBeforeColon}${emojiCode} ${this.trimLeadingSpace(commentAfterColonWithEmojiNameRemoved)}`, true);
        // In some Android phones keyboard, the text to search for the emoji is not cleared
        // will be added after the user starts typing again on the keyboard. This package is
        // a workaround to reset the keyboard natively.
        if (RNTextInputReset) {
            RNTextInputReset.resetKeyboardInput(findNodeHandle(this.textInput));
        }
        this.setState((prevState) => ({
            selection: {
                start: prevState.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
                end: prevState.colonIndex + emojiCode.length + CONST.SPACE_LENGTH,
            },
            suggestedEmojis: [],
        }));
        this.insertedEmojis = [...this.insertedEmojis, emojiObject];
        this.debouncedUpdateFrequentlyUsedEmojis(emojiObject);
    }

    /**
     * Replace the code of mention and update selection
     * @param {Number} highlightedMentionIndex
     */
    insertSelectedMention(highlightedMentionIndex) {
        const commentBeforeAtSign = this.state.value.slice(0, this.state.atSignIndex);
        const mentionObject = this.state.suggestedMentions[highlightedMentionIndex];
        const mentionCode = mentionObject.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : `@${mentionObject.alternateText}`;
        const commentAfterAtSignWithMentionRemoved = this.state.value.slice(this.state.atSignIndex).replace(CONST.REGEX.MENTION_REPLACER, '');

        this.updateComment(`${commentBeforeAtSign}${mentionCode} ${this.trimLeadingSpace(commentAfterAtSignWithMentionRemoved)}`, true);
        this.setState((prevState) => ({
            selection: {
                start: prevState.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
                end: prevState.atSignIndex + mentionCode.length + CONST.SPACE_LENGTH,
            },
            suggestedMentions: [],
        }));
    }

    isEmptyChat() {
        return _.size(this.props.reportActions) === 1;
    }

    /**
     * Callback to add whatever text is chosen into the main input (used f.e as callback for the emoji picker)
     * @param {String} text
     * @param {Boolean} shouldAddTrailSpace
     */
    replaceSelectionWithText(text, shouldAddTrailSpace = true) {
        const updatedText = shouldAddTrailSpace ? `${text} ` : text;
        const selectionSpaceLength = shouldAddTrailSpace ? CONST.SPACE_LENGTH : 0;
        this.updateComment(ComposerUtils.insertText(this.comment, this.state.selection, updatedText));
        this.setState((prevState) => ({
            selection: {
                start: prevState.selection.start + text.length + selectionSpaceLength,
                end: prevState.selection.start + text.length + selectionSpaceLength,
            },
        }));
    }

    /**
     * Check if the composer is visible. Returns true if the composer is not covered up by emoji picker or menu. False otherwise.
     * @returns {Boolean}
     */
    checkComposerVisibility() {
        const isComposerCoveredUp = EmojiPickerActions.isEmojiPickerVisible() || this.state.isMenuVisible || this.props.modal.isVisible;
        return !isComposerCoveredUp;
    }

    focusComposerOnKeyPress(e) {
        const isComposerVisible = this.checkComposerVisibility();
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

        // if we're typing on another input/text area, do not focus
        if (['INPUT', 'TEXTAREA'].includes(e.target.nodeName)) {
            return;
        }

        this.focus();
        this.replaceSelectionWithText(e.key, false);
    }

    /**
     * Focus the composer text input
     * @param {Boolean} [shouldelay=false] Impose delay before focusing the composer
     * @memberof ReportActionCompose
     */
    focus(shouldelay = false) {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        InteractionManager.runAfterInteractions(() => {
            if (!this.textInput) {
                return;
            }

            if (!shouldelay) {
                this.textInput.focus();
            } else {
                // Keyboard is not opened after Emoji Picker is closed
                // SetTimeout is used as a workaround
                // https://github.com/react-native-modal/react-native-modal/issues/114
                // We carefully choose a delay. 100ms is found enough for keyboard to open.
                setTimeout(() => this.textInput.focus(), 100);
            }
        });
    }

    /**
     * Save our report comment in Onyx. We debounce this method in the constructor so that it's not called too often
     * to update Onyx and re-render this component.
     *
     * @param {String} comment
     */
    debouncedSaveReportComment(comment) {
        Report.saveReportComment(this.props.reportID, comment || '');
    }

    /**
     * Broadcast that the user is typing. We debounce this method in the constructor to limit how often we publish
     * client events.
     */
    debouncedBroadcastUserIsTyping() {
        Report.broadcastUserIsTyping(this.props.reportID);
    }

    /**
     * Update frequently used emojis list. We debounce this method in the constructor so that UpdateFrequentlyUsedEmojis
     * API is not called too often.
     */
    debouncedUpdateFrequentlyUsedEmojis() {
        User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(this.insertedEmojis));
        this.insertedEmojis = [];
    }

    /**
     * Update the value of the comment in Onyx
     *
     * @param {String} comment
     * @param {Boolean} shouldDebounceSaveComment
     */
    updateComment(comment, shouldDebounceSaveComment) {
        const {text: newComment = '', emojis = []} = EmojiUtils.replaceEmojis(comment, this.props.preferredSkinTone, this.props.preferredLocale);

        if (!_.isEmpty(emojis)) {
            this.insertedEmojis = [...this.insertedEmojis, ...emojis];
            this.debouncedUpdateFrequentlyUsedEmojis();
        }

        this.setState(() => {
            const newState = {
                isCommentEmpty: !!newComment.match(/^(\s)*$/),
                value: newComment,
            };
            if (comment !== newComment) {
                const remainder = ComposerUtils.getCommonSuffixLength(comment, newComment);
                newState.selection = {
                    start: newComment.length - remainder,
                    end: newComment.length - remainder,
                };
            }
            return newState;
        });

        // Indicate that draft has been created.
        if (this.comment.length === 0 && newComment.length !== 0) {
            Report.setReportWithDraft(this.props.reportID, true);
        }

        // The draft has been deleted.
        if (newComment.length === 0) {
            Report.setReportWithDraft(this.props.reportID, false);
        }

        this.comment = newComment;
        if (shouldDebounceSaveComment) {
            this.debouncedSaveReportComment(newComment);
        } else {
            Report.saveReportComment(this.props.reportID, newComment || '');
        }
        if (newComment) {
            this.debouncedBroadcastUserIsTyping();
        }
    }

    /**
     * Update the number of lines for a comment in Onyx
     * @param {Number} numberOfLines
     */
    updateNumberOfLines(numberOfLines) {
        Report.saveReportCommentNumberOfLines(this.props.reportID, numberOfLines);
    }

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    triggerHotkeyActions(e) {
        if (!e || ComposerUtils.canSkipTriggerHotkeys(this.props.isSmallScreenWidth, this.props.isKeyboardShown)) {
            return;
        }

        const suggestionsExist = this.state.suggestedEmojis.length > 0 || this.state.suggestedMentions.length > 0;

        if (((!e.shiftKey && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || e.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
            e.preventDefault();
            if (this.state.suggestedEmojis.length > 0) {
                this.insertSelectedEmoji(this.state.highlightedEmojiIndex);
            }
            if (this.state.suggestedMentions.length > 0) {
                this.insertSelectedMention(this.state.highlightedMentionIndex);
            }
            return;
        }

        if (e.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
            e.preventDefault();
            if (suggestionsExist) {
                this.resetSuggestions();
            }
            return;
        }

        // Submit the form when Enter is pressed
        if (e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !e.shiftKey) {
            e.preventDefault();
            this.submitForm();
        }

        // Trigger the edit box for last sent message if ArrowUp is pressed and the comment is empty and Chronos is not in the participants
        if (
            e.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey &&
            this.textInput.selectionStart === 0 &&
            this.state.value.length === 0 &&
            !ReportUtils.chatIncludesChronos(this.props.report)
        ) {
            e.preventDefault();

            const parentReportActionID = lodashGet(this.props.report, 'parentReportActionID', '');
            const parentReportAction = lodashGet(this.props.parentReportActions, [parentReportActionID], {});
            const lastReportAction = _.find([...this.props.reportActions, parentReportAction], (action) => ReportUtils.canEditReportAction(action));

            if (lastReportAction !== -1 && lastReportAction) {
                Report.saveReportActionDraft(this.props.reportID, lastReportAction.reportActionID, _.last(lastReportAction.message).html);
            }
        }
    }

    /**
     * @returns {String}
     */
    prepareCommentAndResetComposer() {
        const trimmedComment = this.comment.trim();
        const commentLength = ReportUtils.getCommentLength(trimmedComment);
        // Don't submit empty comments or comments that exceed the character limit
        if (!commentLength || commentLength > CONST.MAX_COMMENT_LENGTH) {
            return '';
        }

        this.updateComment('');
        this.setTextInputShouldClear(true);
        if (this.props.isComposerFullSize) {
            Report.setIsComposerFullSize(this.props.reportID, false);
        }
        this.setState({isFullComposerAvailable: false});

        return trimmedComment;
    }

    /**
     * @param {Object} file
     */
    addAttachment(file) {
        // Since we're submitting the form here which should clear the composer
        // We don't really care about saving the draft the user was typing
        // We need to make sure an empty draft gets saved instead
        this.debouncedSaveReportComment.cancel();
        const comment = this.prepareCommentAndResetComposer();
        Report.addAttachment(this.props.reportID, file, comment);
        this.setTextInputShouldClear(false);
    }

    /**
     * Add a new comment to this chat
     *
     * @param {SyntheticEvent} [e]
     */
    submitForm(e) {
        if (e) {
            e.preventDefault();
        }

        // Since we're submitting the form here which should clear the composer
        // We don't really care about saving the draft the user was typing
        // We need to make sure an empty draft gets saved instead
        this.debouncedSaveReportComment.cancel();

        const comment = this.prepareCommentAndResetComposer();
        if (!comment) {
            return;
        }

        this.props.onSubmit(comment);
    }

    /**
     * Used to show Popover menu on Workspace chat at first sign-in
     * @returns {Boolean}
     */
    showPopoverMenu() {
        this.setMenuVisibility(true);
        return true;
    }

    render() {
        const reportParticipants = _.without(lodashGet(this.props.report, 'participantAccountIDs', []), this.props.currentUserPersonalDetails.accountID);
        const participantsWithoutExpensifyAccountIDs = _.difference(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS);
        const reportRecipient = this.props.personalDetails[participantsWithoutExpensifyAccountIDs[0]];
        const shouldShowReportRecipientLocalTime =
            ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report, this.props.currentUserPersonalDetails.accountID) && !this.props.isComposerFullSize;

        // Prevents focusing and showing the keyboard while the drawer is covering the chat.
        const isBlockedFromConcierge = ReportUtils.chatIncludesConcierge(this.props.report) && User.isBlockedFromConcierge(this.props.blockedFromConcierge);
        const inputPlaceholder = this.getInputPlaceholder();
        const shouldUseFocusedColor = !isBlockedFromConcierge && !this.props.disabled && this.state.isFocused;
        const hasExceededMaxCommentLength = this.state.hasExceededMaxCommentLength;
        const isFullComposerAvailable = this.state.isFullComposerAvailable && !_.isEmpty(this.state.value);
        const hasReportRecipient = _.isObject(reportRecipient) && !_.isEmpty(reportRecipient);
        const maxComposerLines = this.props.isSmallScreenWidth ? CONST.COMPOSER.MAX_LINES_SMALL_SCREEN : CONST.COMPOSER.MAX_LINES;
        const submit = this.submitForm;
        const animatedRef = this.props.animatedRef;
        const setCommentEmpty = () => this.setState({isCommentEmpty: true});
        const Tap = Gesture.Tap()
            .enabled(!(this.state.isCommentEmpty || isBlockedFromConcierge || this.props.disabled || hasExceededMaxCommentLength))
            .onEnd(() => {
                'worklet';

                const viewTag = animatedRef();
                const viewName = 'RCTMultilineTextInputView';
                const updates = {text: ''};
                // we are setting the isCommentEmpty flag to true so the status of it will be in sync of the native text input state
                runOnJS(setCommentEmpty)();
                updatePropsPaperWorklet(viewTag, viewName, updates); // clears native text input on the UI thread
                runOnJS(submit)();
            });

        const menuItems = [
            ...this.getMoneyRequestOptions(reportParticipants),
            ...this.getTaskOption(reportParticipants),
            {
                icon: Expensicons.Paperclip,
                text: this.props.translate('reportActionCompose.addAttachment'),
                onSelected: () => {},
            },
        ];

        return (
            <View
                style={[
                    shouldShowReportRecipientLocalTime && !lodashGet(this.props.network, 'isOffline') && styles.chatItemComposeWithFirstRow,
                    this.props.isComposerFullSize && styles.chatItemFullComposeRow,
                ]}
            >
                <OfflineWithFeedback
                    pendingAction={this.props.pendingAction}
                    style={this.props.isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                    contentContainerStyle={this.props.isComposerFullSize ? styles.flex1 : {}}
                >
                    {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime participant={reportRecipient} />}
                    <View
                        style={[
                            shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                            styles.flexRow,
                            styles.chatItemComposeBox,
                            this.props.isComposerFullSize && styles.chatItemFullComposeBox,
                            hasExceededMaxCommentLength && styles.borderColorDanger,
                        ]}
                    >
                        <AttachmentModal
                            headerTitle={this.props.translate('reportActionCompose.sendAttachment')}
                            onConfirm={this.addAttachment}
                            onModalShow={() => this.setState({isAttachmentPreviewActive: true})}
                            onModalHide={() => {
                                this.shouldBlockEmojiCalc = false;
                                this.shouldBlockMentionCalc = false;
                                this.setState({isAttachmentPreviewActive: false});
                            }}
                        >
                            {({displayFileInModal}) => (
                                <>
                                    <AttachmentPicker>
                                        {({openPicker}) => (
                                            <>
                                                <View
                                                    style={[
                                                        styles.dFlex,
                                                        styles.flexColumn,
                                                        isFullComposerAvailable || this.props.isComposerFullSize ? styles.justifyContentBetween : styles.justifyContentCenter,
                                                    ]}
                                                >
                                                    {this.props.isComposerFullSize && (
                                                        <Tooltip text={this.props.translate('reportActionCompose.collapse')}>
                                                            <PressableWithFeedback
                                                                onPress={(e) => {
                                                                    e.preventDefault();
                                                                    this.setShouldShowSuggestionMenuToFalse();
                                                                    Report.setIsComposerFullSize(this.props.reportID, false);
                                                                }}
                                                                // Keep focus on the composer when Collapse button is clicked.
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                style={styles.composerSizeButton}
                                                                disabled={isBlockedFromConcierge || this.props.disabled}
                                                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                                accessibilityLabel={this.props.translate('reportActionCompose.collapse')}
                                                            >
                                                                <Icon src={Expensicons.Collapse} />
                                                            </PressableWithFeedback>
                                                        </Tooltip>
                                                    )}
                                                    {!this.props.isComposerFullSize && isFullComposerAvailable && (
                                                        <Tooltip text={this.props.translate('reportActionCompose.expand')}>
                                                            <PressableWithFeedback
                                                                onPress={(e) => {
                                                                    e.preventDefault();
                                                                    this.setShouldShowSuggestionMenuToFalse();
                                                                    Report.setIsComposerFullSize(this.props.reportID, true);
                                                                }}
                                                                // Keep focus on the composer when Expand button is clicked.
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                style={styles.composerSizeButton}
                                                                disabled={isBlockedFromConcierge || this.props.disabled}
                                                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                                accessibilityLabel={this.props.translate('reportActionCompose.expand')}
                                                            >
                                                                <Icon src={Expensicons.Expand} />
                                                            </PressableWithFeedback>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip text={this.props.translate('reportActionCompose.addAction')}>
                                                        <PressableWithFeedback
                                                            ref={this.actionButtonRef}
                                                            onPress={(e) => {
                                                                e.preventDefault();

                                                                // Drop focus to avoid blue focus ring.
                                                                this.actionButtonRef.current.blur();
                                                                this.setMenuVisibility(!this.state.isMenuVisible);
                                                            }}
                                                            style={styles.composerSizeButton}
                                                            disabled={isBlockedFromConcierge || this.props.disabled}
                                                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                            accessibilityLabel={this.props.translate('reportActionCompose.addAction')}
                                                        >
                                                            <Icon src={Expensicons.Plus} />
                                                        </PressableWithFeedback>
                                                    </Tooltip>
                                                </View>
                                                <PopoverMenu
                                                    animationInTiming={CONST.ANIMATION_IN_TIMING}
                                                    isVisible={this.state.isMenuVisible}
                                                    onClose={() => this.setMenuVisibility(false)}
                                                    onItemSelected={(item, index) => {
                                                        this.setMenuVisibility(false);

                                                        // In order for the file picker to open dynamically, the click
                                                        // function must be called from within a event handler that was initiated
                                                        // by the user.
                                                        if (index === menuItems.length - 1) {
                                                            // Set a flag to block suggestion calculation until we're finished using the file picker,
                                                            // which will stop any flickering as the file picker opens on non-native devices.
                                                            if (this.willBlurTextInputOnTapOutside) {
                                                                this.shouldBlockEmojiCalc = true;
                                                                this.shouldBlockMentionCalc = true;
                                                            }
                                                            openPicker({
                                                                onPicked: displayFileInModal,
                                                            });
                                                        }
                                                    }}
                                                    anchorPosition={styles.createMenuPositionReportActionCompose(this.props.windowHeight)}
                                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
                                                    menuItems={[
                                                        ...this.getMoneyRequestOptions(reportParticipants),
                                                        ...this.getTaskOption(),
                                                        {
                                                            icon: Expensicons.Paperclip,
                                                            text: this.props.translate('reportActionCompose.addAttachment'),
                                                            onSelected: () => {
                                                                // Set a flag to block suggestion calculation until we're finished using the file picker,
                                                                // which will stop any flickering as the file picker opens on non-native devices.
                                                                if (this.willBlurTextInputOnTapOutside) {
                                                                    this.shouldBlockEmojiCalc = true;
                                                                    this.shouldBlockMentionCalc = true;
                                                                }

                                                                openPicker({
                                                                    onPicked: displayFileInModal,
                                                                });
                                                            },
                                                        },
                                                    ]}
                                                    withoutOverlay
                                                    anchorRef={this.actionButtonRef}
                                                />
                                            </>
                                        )}
                                    </AttachmentPicker>
                                    <View style={[containerComposeStyles, styles.textInputComposeBorder]}>
                                        <Composer
                                            checkComposerVisibility={() => this.checkComposerVisibility()}
                                            autoFocus={this.shouldAutoFocus}
                                            multiline
                                            ref={this.setTextInputRef}
                                            textAlignVertical="top"
                                            placeholder={inputPlaceholder}
                                            placeholderTextColor={themeColors.placeholderText}
                                            onChangeText={(comment) => this.updateComment(comment, true)}
                                            onKeyPress={this.triggerHotkeyActions}
                                            style={[styles.textInputCompose, this.props.isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                                            maxLines={maxComposerLines}
                                            onFocus={() => this.setIsFocused(true)}
                                            onBlur={() => {
                                                this.setIsFocused(false);
                                                this.resetSuggestions();
                                            }}
                                            onClick={() => {
                                                this.shouldBlockEmojiCalc = false;
                                                this.shouldBlockMentionCalc = false;
                                            }}
                                            onPasteFile={displayFileInModal}
                                            shouldClear={this.state.textInputShouldClear}
                                            onClear={() => this.setTextInputShouldClear(false)}
                                            isDisabled={isBlockedFromConcierge || this.props.disabled}
                                            selection={this.state.selection}
                                            onSelectionChange={this.onSelectionChange}
                                            isFullComposerAvailable={isFullComposerAvailable}
                                            setIsFullComposerAvailable={this.setIsFullComposerAvailable}
                                            isComposerFullSize={this.props.isComposerFullSize}
                                            value={this.state.value}
                                            numberOfLines={this.props.numberOfLines}
                                            onNumberOfLinesChange={this.updateNumberOfLines}
                                            shouldCalculateCaretPosition
                                            onLayout={(e) => {
                                                const composerHeight = e.nativeEvent.layout.height;
                                                if (this.state.composerHeight === composerHeight) {
                                                    return;
                                                }
                                                this.setState({composerHeight});
                                            }}
                                            onScroll={() => this.setShouldShowSuggestionMenuToFalse()}
                                        />
                                    </View>
                                    <ReportDropUI
                                        onDrop={(e) => {
                                            if (this.state.isAttachmentPreviewActive) {
                                                return;
                                            }
                                            const data = lodashGet(e, ['dataTransfer', 'items', 0]);
                                            displayFileInModal(data);
                                        }}
                                    />
                                </>
                            )}
                        </AttachmentModal>
                        {DeviceCapabilities.canUseTouchScreen() && this.props.isMediumScreenWidth ? null : (
                            <EmojiPickerButton
                                isDisabled={isBlockedFromConcierge || this.props.disabled}
                                onModalHide={() => {
                                    this.focus(true);
                                }}
                                onEmojiSelected={this.replaceSelectionWithText}
                            />
                        )}
                        <View
                            style={[styles.justifyContentEnd]}
                            // Keep focus on the composer when Send message is clicked.
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <GestureDetector gesture={Tap}>
                                <Tooltip text={this.props.translate('common.send')}>
                                    <PressableWithFeedback
                                        style={({pressed, isDisabled}) => [
                                            styles.chatItemSubmitButton,
                                            this.state.isCommentEmpty || hasExceededMaxCommentLength || pressed || isDisabled ? undefined : styles.buttonSuccess,
                                        ]}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                        accessibilityLabel={this.props.translate('common.send')}
                                    >
                                        {({pressed}) => (
                                            <Icon
                                                src={Expensicons.Send}
                                                fill={this.state.isCommentEmpty || hasExceededMaxCommentLength || pressed ? themeColors.icon : themeColors.textLight}
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
                            (!this.props.isSmallScreenWidth || (this.props.isSmallScreenWidth && !this.props.network.isOffline)) && styles.chatItemComposeSecondaryRow,
                        ]}
                    >
                        {!this.props.isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                        <ReportTypingIndicator reportID={this.props.reportID} />
                        <ExceededCommentLength
                            comment={this.comment}
                            onExceededMaxCommentLength={this.setExceededMaxCommentLength}
                        />
                    </View>
                </OfflineWithFeedback>
                {!_.isEmpty(this.state.suggestedEmojis) && this.state.shouldShowEmojiSuggestionMenu && (
                    <ArrowKeyFocusManager
                        focusedIndex={this.state.highlightedEmojiIndex}
                        maxIndex={getMaxArrowIndex(this.state.suggestedEmojis.length, this.state.isAutoSuggestionPickerLarge)}
                        shouldExcludeTextAreaNodes={false}
                        onFocusedIndexChanged={(index) => this.setState({highlightedEmojiIndex: index})}
                    >
                        <EmojiSuggestions
                            onClose={() => this.setState({suggestedEmojis: []})}
                            highlightedEmojiIndex={this.state.highlightedEmojiIndex}
                            emojis={this.state.suggestedEmojis}
                            comment={this.state.value}
                            updateComment={(newComment) => this.setState({value: newComment})}
                            colonIndex={this.state.colonIndex}
                            prefix={this.state.value.slice(this.state.colonIndex + 1, this.state.selection.start)}
                            onSelect={this.insertSelectedEmoji}
                            isComposerFullSize={this.props.isComposerFullSize}
                            preferredSkinToneIndex={this.props.preferredSkinTone}
                            isEmojiPickerLarge={this.state.isAutoSuggestionPickerLarge}
                            composerHeight={this.state.composerHeight}
                            shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                        />
                    </ArrowKeyFocusManager>
                )}
                {!_.isEmpty(this.state.suggestedMentions) && this.state.shouldShowMentionSuggestionMenu && (
                    <ArrowKeyFocusManager
                        focusedIndex={this.state.highlightedMentionIndex}
                        maxIndex={getMaxArrowIndex(this.state.suggestedMentions.length, this.state.isAutoSuggestionPickerLarge)}
                        shouldExcludeTextAreaNodes={false}
                        onFocusedIndexChanged={(index) => this.setState({highlightedMentionIndex: index})}
                    >
                        <MentionSuggestions
                            onClose={() => this.setState({suggestedMentions: []})}
                            highlightedMentionIndex={this.state.highlightedMentionIndex}
                            mentions={this.state.suggestedMentions}
                            comment={this.state.value}
                            updateComment={(newComment) => this.setState({value: newComment})}
                            colonIndex={this.state.colonIndex}
                            prefix={this.state.mentionPrefix}
                            onSelect={this.insertSelectedMention}
                            isComposerFullSize={this.props.isComposerFullSize}
                            isMentionPickerLarge={this.state.isAutoSuggestionPickerLarge}
                            composerHeight={this.state.composerHeight}
                            shouldIncludeReportRecipientLocalTimeHeight={shouldShowReportRecipientLocalTime}
                        />
                    </ArrowKeyFocusManager>
                )}
            </View>
        );
    }
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
