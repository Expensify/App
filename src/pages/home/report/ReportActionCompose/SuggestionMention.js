"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareUserInList = compareUserInList;
var expensify_common_1 = require("expensify-common");
var mapValues_1 = require("lodash/mapValues");
var sortBy_1 = require("lodash/sortBy");
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var MentionSuggestions_1 = require("@components/MentionSuggestions");
var OnyxProvider_1 = require("@components/OnyxProvider");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useCurrentReportID_1 = require("@hooks/useCurrentReportID");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebounce_1 = require("@hooks/useDebounce");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var LoginUtils_1 = require("@libs/LoginUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyEmployeeListUtils_1 = require("@libs/PolicyEmployeeListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var SuggestionUtils_1 = require("@libs/SuggestionUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Check if this piece of string looks like a mention
 */
var isMentionCode = function (str) { return CONST_1.default.REGEX.HAS_AT_MOST_TWO_AT_SIGNS.test(str); };
var defaultSuggestionsValues = {
    suggestedMentions: [],
    atSignIndex: -1,
    shouldShowSuggestionMenu: false,
    mentionPrefix: '',
    prefixType: '',
};
function getDisplayName(details) {
    var _a;
    var displayNameFromAccountID = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: details.accountID });
    if (!displayNameFromAccountID) {
        return ((_a = details.login) === null || _a === void 0 ? void 0 : _a.length) ? details.login : '';
    }
    return displayNameFromAccountID;
}
/**
 * Comparison function to sort users. It compares weights, display names, and accountIDs in that order
 */
function compareUserInList(first, second) {
    if (first.weight !== second.weight) {
        return first.weight - second.weight;
    }
    var displayNameLoginOrder = (0, LocaleCompare_1.default)(getDisplayName(first), getDisplayName(second));
    if (displayNameLoginOrder !== 0) {
        return displayNameLoginOrder;
    }
    return first.accountID - second.accountID;
}
function SuggestionMention(_a, ref) {
    var value = _a.value, selection = _a.selection, setSelection = _a.setSelection, updateComment = _a.updateComment, isAutoSuggestionPickerLarge = _a.isAutoSuggestionPickerLarge, measureParentContainerAndReportCursor = _a.measureParentContainerAndReportCursor, isComposerFocused = _a.isComposerFocused, isGroupPolicyReport = _a.isGroupPolicyReport, policyID = _a.policyID;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, formatPhoneNumber = _b.formatPhoneNumber;
    var _c = (0, react_1.useState)(defaultSuggestionsValues), suggestionValues = _c[0], setSuggestionValues = _c[1];
    var suggestionValuesRef = (0, react_1.useRef)(suggestionValues);
    // eslint-disable-next-line react-compiler/react-compiler
    suggestionValuesRef.current = suggestionValues;
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var isMentionSuggestionsMenuVisible = !!suggestionValues.suggestedMentions.length && suggestionValues.shouldShowSuggestionMenu;
    var currentReportID = (0, useCurrentReportID_1.default)();
    var currentReport = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentReportID === null || currentReportID === void 0 ? void 0 : currentReportID.currentReportID)];
    // Smaller weight means higher order in suggestion list
    var getPersonalDetailsWeight = (0, react_1.useCallback)(function (detail, policyEmployeeAccountIDs) {
        if ((0, ReportUtils_1.isReportParticipant)(detail.accountID, currentReport)) {
            return 0;
        }
        if (policyEmployeeAccountIDs.includes(detail.accountID)) {
            return 1;
        }
        return 2;
    }, [currentReport]);
    var weightedPersonalDetails = (0, react_1.useMemo)(function () {
        var policyEmployeeAccountIDs = (0, PolicyEmployeeListUtils_1.default)(policyID);
        if (!(0, ReportUtils_1.isGroupChat)(currentReport) && !(0, ReportUtils_1.doesReportBelongToWorkspace)(currentReport, policyEmployeeAccountIDs, policyID)) {
            return personalDetails;
        }
        return (0, mapValues_1.default)(personalDetails, function (detail) {
            return detail
                ? __assign(__assign({}, detail), { weight: getPersonalDetailsWeight(detail, policyEmployeeAccountIDs) }) : null;
        });
    }, [policyID, currentReport, personalDetails, getPersonalDetailsWeight]);
    var _d = (0, useArrowKeyFocusManager_1.default)({
        isActive: isMentionSuggestionsMenuVisible,
        maxIndex: suggestionValues.suggestedMentions.length - 1,
        shouldExcludeTextAreaNodes: false,
    }), highlightedMentionIndex = _d[0], setHighlightedMentionIndex = _d[1];
    // Used to store the selection index of the last inserted mention
    var suggestionInsertionIndexRef = (0, react_1.useRef)(null);
    // Used to detect if the selection has changed since the last suggestion insertion
    // If so, we reset the suggestionInsertionIndexRef
    // eslint-disable-next-line react-compiler/react-compiler
    var hasSelectionChanged = !(selection.end === selection.start && selection.start === suggestionInsertionIndexRef.current);
    if (hasSelectionChanged) {
        // eslint-disable-next-line react-compiler/react-compiler
        suggestionInsertionIndexRef.current = null;
    }
    // Used to decide whether to block the suggestions list from showing to prevent flickering
    var shouldBlockCalc = (0, react_1.useRef)(false);
    /**
     * Search for reports suggestions in server.
     *
     * The function is debounced to not perform requests on every keystroke.
     */
    var debouncedSearchInServer = (0, useDebounce_1.default)((0, react_1.useCallback)(function () {
        var foundSuggestionsCount = suggestionValues.suggestedMentions.length;
        if (suggestionValues.prefixType === '#' && foundSuggestionsCount < 5 && isGroupPolicyReport) {
            (0, Report_1.searchInServer)(suggestionValues.mentionPrefix, policyID);
        }
    }, [suggestionValues.suggestedMentions.length, suggestionValues.prefixType, suggestionValues.mentionPrefix, policyID, isGroupPolicyReport]), CONST_1.default.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
    var formatLoginPrivateDomain = (0, react_1.useCallback)(function (displayText, userLogin) {
        var _a;
        if (displayText === void 0) { displayText = ''; }
        if (userLogin === void 0) { userLogin = ''; }
        if (userLogin !== displayText) {
            return displayText;
        }
        // If the emails are not in the same private domain, we also return the displayText
        if (!(0, LoginUtils_1.areEmailsFromSamePrivateDomain)(displayText, (_a = currentUserPersonalDetails.login) !== null && _a !== void 0 ? _a : '')) {
            return expensify_common_1.Str.removeSMSDomain(displayText);
        }
        // Otherwise, the emails must be of the same private domain, so we should remove the domain part
        return displayText.split('@').at(0);
    }, [currentUserPersonalDetails.login]);
    var getMentionCode = (0, react_1.useCallback)(function (mention, mentionType) {
        var _a;
        if (mentionType === '#') {
            // room mention case
            return (_a = mention.handle) !== null && _a !== void 0 ? _a : '';
        }
        return mention.text === CONST_1.default.AUTO_COMPLETE_SUGGESTER.HERE_TEXT ? CONST_1.default.AUTO_COMPLETE_SUGGESTER.HERE_TEXT : "@".concat(formatLoginPrivateDomain(mention.handle, mention.handle));
    }, [formatLoginPrivateDomain]);
    function getOriginalMentionText(inputValue, atSignIndex, whiteSpacesLength) {
        if (whiteSpacesLength === void 0) { whiteSpacesLength = 0; }
        var rest = inputValue.slice(atSignIndex);
        // If the search string contains spaces, it's not a simple login/email mention.
        // In that case, we need to replace all the words the user typed that are part of the mention.
        // For example, if `rest` is "@Adam Chr and" and "@Adam Chris" is a valid mention,
        // then `whiteSpacesLength` will be 1, and we should return "@Adam Chr".
        // The length of this substring will then be used to replace the user's input with the full mention.
        if (whiteSpacesLength) {
            var str = rest.split(' ', whiteSpacesLength + 1).join(' ');
            return rest.slice(0, str.length);
        }
        var breakerIndex = rest.search(CONST_1.default.REGEX.MENTION_BREAKER);
        return breakerIndex === -1 ? rest : rest.slice(0, breakerIndex);
    }
    /**
     * Replace the code of mention and update selection
     */
    var insertSelectedMention = (0, react_1.useCallback)(function (highlightedMentionIndexInner) {
        var commentBeforeAtSign = value.slice(0, suggestionValues.atSignIndex);
        var mentionObject = suggestionValues.suggestedMentions.at(highlightedMentionIndexInner);
        if (!mentionObject || highlightedMentionIndexInner === -1) {
            return;
        }
        var mentionCode = getMentionCode(mentionObject, suggestionValues.prefixType);
        var originalMention = getOriginalMentionText(value, suggestionValues.atSignIndex, StringUtils_1.default.countWhiteSpaces(suggestionValues.mentionPrefix));
        var commentAfterMention = value.slice(suggestionValues.atSignIndex + Math.max(originalMention.length, suggestionValues.mentionPrefix.length + suggestionValues.prefixType.length));
        updateComment("".concat(commentBeforeAtSign).concat(mentionCode, " ").concat((0, SuggestionUtils_1.trimLeadingSpace)(commentAfterMention)), true);
        var selectionPosition = suggestionValues.atSignIndex + mentionCode.length + CONST_1.default.SPACE_LENGTH;
        setSelection({
            start: selectionPosition,
            end: selectionPosition,
        });
        suggestionInsertionIndexRef.current = selectionPosition;
        setSuggestionValues(function (prevState) { return (__assign(__assign({}, prevState), { suggestedMentions: [], shouldShowSuggestionMenu: false })); });
    }, [value, suggestionValues.atSignIndex, suggestionValues.suggestedMentions, suggestionValues.prefixType, getMentionCode, updateComment, setSelection, suggestionValues.mentionPrefix]);
    /**
     * Clean data related to suggestions
     */
    var resetSuggestions = (0, react_1.useCallback)(function () {
        setSuggestionValues(defaultSuggestionsValues);
    }, []);
    /**
     * Listens for keyboard shortcuts and applies the action
     */
    var triggerHotkeyActions = (0, react_1.useCallback)(function (event) {
        var suggestionsExist = suggestionValues.suggestedMentions.length > 0;
        if (((!event.shiftKey && event.key === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) || event.key === CONST_1.default.KEYBOARD_SHORTCUTS.TAB.shortcutKey) && suggestionsExist) {
            event.preventDefault();
            if (suggestionValues.suggestedMentions.length > 0) {
                insertSelectedMention(highlightedMentionIndex);
                return true;
            }
        }
        if (event.key === CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
            event.preventDefault();
            if (suggestionsExist) {
                resetSuggestions();
            }
            return true;
        }
    }, [highlightedMentionIndex, insertSelectedMention, resetSuggestions, suggestionValues.suggestedMentions.length]);
    var getUserMentionOptions = (0, react_1.useCallback)(function (personalDetailsParam, searchValue) {
        if (searchValue === void 0) { searchValue = ''; }
        var suggestions = [];
        if (CONST_1.default.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchValue.toLowerCase())) {
            suggestions.push({
                text: CONST_1.default.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                alternateText: translate('mentionSuggestions.hereAlternateText'),
                icons: [
                    {
                        source: Expensicons.Megaphone,
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                    },
                ],
            });
        }
        // Create a set to track logins that have already been seen
        var seenLogins = new Set();
        var filteredPersonalDetails = Object.values(personalDetailsParam !== null && personalDetailsParam !== void 0 ? personalDetailsParam : {}).filter(function (detail) {
            // If we don't have user's primary login, that member is not known to the current user and hence we do not allow them to be mentioned
            if (!(detail === null || detail === void 0 ? void 0 : detail.login) || detail.isOptimisticPersonalDetail) {
                return false;
            }
            // We don't want to mention system emails like notifications@expensify.com
            if (CONST_1.default.RESTRICTED_EMAILS.includes(detail.login) || CONST_1.default.RESTRICTED_ACCOUNT_IDS.includes(detail.accountID)) {
                return false;
            }
            var displayName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(detail);
            var displayText = displayName === formatPhoneNumber(detail.login) ? displayName : "".concat(displayName, " ").concat(detail.login);
            if (searchValue && !displayText.toLowerCase().includes(searchValue.toLowerCase())) {
                return false;
            }
            // Given the mention is inserted by user, we don't want to show the mention options unless the
            // selection index changes. In that case, suggestionInsertionIndexRef.current will be null.
            // See https://github.com/Expensify/App/issues/38358 for more context
            if (suggestionInsertionIndexRef.current) {
                return false;
            }
            // on staging server, in specific cases (see issue) BE returns duplicated personalDetails
            // entries with the same `login` which we need to filter out
            if (seenLogins.has(detail.login)) {
                return false;
            }
            seenLogins.add(detail.login);
            return true;
        });
        // At this point we are sure that the details are not null, since empty user details have been filtered in the previous step
        var sortedPersonalDetails = filteredPersonalDetails.sort(compareUserInList);
        sortedPersonalDetails.slice(0, CONST_1.default.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS - suggestions.length).forEach(function (detail) {
            var _a;
            suggestions.push({
                text: formatLoginPrivateDomain((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(detail), detail === null || detail === void 0 ? void 0 : detail.login),
                alternateText: "@".concat(formatLoginPrivateDomain(detail === null || detail === void 0 ? void 0 : detail.login, detail === null || detail === void 0 ? void 0 : detail.login)),
                handle: detail === null || detail === void 0 ? void 0 : detail.login,
                icons: [
                    {
                        name: detail === null || detail === void 0 ? void 0 : detail.login,
                        source: (_a = detail === null || detail === void 0 ? void 0 : detail.avatar) !== null && _a !== void 0 ? _a : Expensicons.FallbackAvatar,
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                        fallbackIcon: detail === null || detail === void 0 ? void 0 : detail.fallbackIcon,
                        id: detail === null || detail === void 0 ? void 0 : detail.accountID,
                    },
                ],
            });
        });
        return suggestions;
    }, [translate, formatPhoneNumber, formatLoginPrivateDomain]);
    var getRoomMentionOptions = (0, react_1.useCallback)(function (searchTerm, reportBatch) {
        var filteredRoomMentions = [];
        Object.values(reportBatch !== null && reportBatch !== void 0 ? reportBatch : {}).forEach(function (report) {
            var _a;
            if (!(0, ReportUtils_1.canReportBeMentionedWithinPolicy)(report, policyID)) {
                return;
            }
            if ((_a = report === null || report === void 0 ? void 0 : report.reportName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) {
                filteredRoomMentions.push({
                    text: report.reportName,
                    handle: report.reportName,
                    alternateText: report.reportName,
                });
            }
        });
        return (0, sortBy_1.default)(filteredRoomMentions, 'handle').slice(0, CONST_1.default.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS);
    }, [policyID]);
    var calculateMentionSuggestion = (0, react_1.useCallback)(function (newValue, selectionStart, selectionEnd) {
        var _a, _b;
        if (selectionEnd !== selectionStart || !selectionEnd || shouldBlockCalc.current || selectionEnd < 1 || !isComposerFocused) {
            shouldBlockCalc.current = false;
            resetSuggestions();
            return;
        }
        var afterLastBreakLineIndex = newValue.lastIndexOf('\n', selectionEnd - 1) + 1;
        var leftString = newValue.substring(afterLastBreakLineIndex, selectionEnd);
        var words = leftString.split(CONST_1.default.REGEX.SPACE_OR_EMOJI);
        var lastWord = (_a = words.at(-1)) !== null && _a !== void 0 ? _a : '';
        var secondToLastWord = words.at(-3);
        var atSignIndex;
        var suggestionWord = '';
        var prefix;
        var prefixType = '';
        // Detect if the last two words contain a mention (two words are needed to detect a mention with a space in it)
        if (lastWord.startsWith('@') || lastWord.startsWith('#')) {
            atSignIndex = leftString.lastIndexOf(lastWord) + afterLastBreakLineIndex;
            suggestionWord = lastWord;
            prefix = suggestionWord.substring(1);
            prefixType = suggestionWord.substring(0, 1);
        }
        else if (secondToLastWord && secondToLastWord.startsWith('@') && secondToLastWord.length > 1) {
            atSignIndex = leftString.lastIndexOf(secondToLastWord) + afterLastBreakLineIndex;
            suggestionWord = "".concat(secondToLastWord, " ").concat(lastWord);
            prefix = suggestionWord.substring(1);
            prefixType = suggestionWord.substring(0, 1);
        }
        else {
            prefix = lastWord.substring(1);
        }
        var nextState = {
            suggestedMentions: [],
            atSignIndex: atSignIndex,
            mentionPrefix: prefix,
            prefixType: prefixType,
        };
        if (isMentionCode(suggestionWord) && prefixType === '@') {
            var suggestions = getUserMentionOptions(weightedPersonalDetails, prefix);
            nextState.suggestedMentions = suggestions;
            nextState.shouldShowSuggestionMenu = !!suggestions.length;
        }
        var shouldDisplayRoomMentionsSuggestions = isGroupPolicyReport && ((0, ValidationUtils_1.isValidRoomName)(suggestionWord.toLowerCase()) || prefix === '');
        if (prefixType === '#' && shouldDisplayRoomMentionsSuggestions) {
            // Filter reports by room name and current policy
            nextState.suggestedMentions = getRoomMentionOptions(prefix, reports);
            // Even if there are no reports, we should show the suggestion menu - to perform live search
            nextState.shouldShowSuggestionMenu = true;
        }
        // Early return if there is no update
        var currentState = suggestionValuesRef.current;
        if (currentState.suggestedMentions.length === 0 && ((_b = nextState.suggestedMentions) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            return;
        }
        setSuggestionValues(function (prevState) { return (__assign(__assign({}, prevState), nextState)); });
        setHighlightedMentionIndex(0);
    }, [isComposerFocused, isGroupPolicyReport, setHighlightedMentionIndex, resetSuggestions, getUserMentionOptions, weightedPersonalDetails, getRoomMentionOptions, reports]);
    (0, react_1.useEffect)(function () {
        calculateMentionSuggestion(value, selection.start, selection.end);
    }, [value, selection, calculateMentionSuggestion]);
    (0, react_1.useEffect)(function () {
        debouncedSearchInServer();
    }, [suggestionValues.suggestedMentions.length, suggestionValues.prefixType, policyID, value, debouncedSearchInServer]);
    var updateShouldShowSuggestionMenuToFalse = (0, react_1.useCallback)(function () {
        setSuggestionValues(function (prevState) {
            if (prevState.shouldShowSuggestionMenu) {
                return __assign(__assign({}, prevState), { shouldShowSuggestionMenu: false });
            }
            return prevState;
        });
    }, []);
    var setShouldBlockSuggestionCalc = (0, react_1.useCallback)(function (shouldBlockSuggestionCalc) {
        shouldBlockCalc.current = shouldBlockSuggestionCalc;
    }, [shouldBlockCalc]);
    var getSuggestions = (0, react_1.useCallback)(function () { return suggestionValues.suggestedMentions; }, [suggestionValues]);
    var getIsSuggestionsMenuVisible = (0, react_1.useCallback)(function () { return isMentionSuggestionsMenuVisible; }, [isMentionSuggestionsMenuVisible]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        resetSuggestions: resetSuggestions,
        triggerHotkeyActions: triggerHotkeyActions,
        setShouldBlockSuggestionCalc: setShouldBlockSuggestionCalc,
        updateShouldShowSuggestionMenuToFalse: updateShouldShowSuggestionMenuToFalse,
        getSuggestions: getSuggestions,
        getIsSuggestionsMenuVisible: getIsSuggestionsMenuVisible,
    }); }, [resetSuggestions, setShouldBlockSuggestionCalc, triggerHotkeyActions, updateShouldShowSuggestionMenuToFalse, getSuggestions, getIsSuggestionsMenuVisible]);
    if (!isMentionSuggestionsMenuVisible) {
        return null;
    }
    return (<MentionSuggestions_1.default highlightedMentionIndex={highlightedMentionIndex} mentions={suggestionValues.suggestedMentions} prefix={suggestionValues.mentionPrefix} onSelect={insertSelectedMention} isMentionPickerLarge={!!isAutoSuggestionPickerLarge} measureParentContainerAndReportCursor={measureParentContainerAndReportCursor} resetSuggestions={resetSuggestions}/>);
}
SuggestionMention.displayName = 'SuggestionMention';
exports.default = (0, react_1.forwardRef)(SuggestionMention);
