"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var Text_1 = require("@components/Text");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var Navigation_1 = require("@navigation/Navigation");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;
function AssigneeStep(_a) {
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID), { canBeMissing: true })[0];
    var isEditing = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isEditing;
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var submit = function (assignee) {
        var _a, _b, _c, _d;
        var data = {
            assigneeEmail: (_a = assignee === null || assignee === void 0 ? void 0 : assignee.login) !== null && _a !== void 0 ? _a : '',
        };
        if (isEditing && ((_b = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _b === void 0 ? void 0 : _b.cardTitle) === (0, Card_1.getCardDefaultName)((0, PersonalDetailsUtils_1.getUserNameByEmail)((_c = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _c === void 0 ? void 0 : _c.assigneeEmail, 'firstName'))) {
            // If the card title is the default card title, update it with the new assignee's name
            data.cardTitle = (0, Card_1.getCardDefaultName)((0, PersonalDetailsUtils_1.getUserNameByEmail)((_d = assignee === null || assignee === void 0 ? void 0 : assignee.login) !== null && _d !== void 0 ? _d : '', 'firstName'));
        }
        (0, Card_1.setIssueNewCardStepAndData)({
            step: isEditing ? CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST_1.default.EXPENSIFY_CARD.STEP.CARD_TYPE,
            data: data,
            isEditing: false,
            policyID: policyID,
        });
    };
    var handleBackButtonPress = function () {
        if (isEditing) {
            (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID: policyID });
            return;
        }
        Navigation_1.default.goBack();
        (0, Card_1.clearIssueNewCardFlow)(policyID);
    };
    var shouldShowSearchInput = (policy === null || policy === void 0 ? void 0 : policy.employeeList) && Object.keys(policy.employeeList).length >= MINIMUM_MEMBER_TO_SHOW_SEARCH;
    var textInputLabel = shouldShowSearchInput ? translate('workspace.card.issueNewCard.findMember') : undefined;
    var membersDetails = (0, react_1.useMemo)(function () {
        var _a;
        var membersList = [];
        if (!(policy === null || policy === void 0 ? void 0 : policy.employeeList)) {
            return membersList;
        }
        Object.entries((_a = policy.employeeList) !== null && _a !== void 0 ? _a : {}).forEach(function (_a) {
            var _b;
            var email = _a[0], policyEmployee = _a[1];
            if ((0, PolicyUtils_1.isDeletedPolicyEmployee)(policyEmployee, isOffline)) {
                return;
            }
            var personalDetail = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(email);
            membersList.push({
                keyForList: email,
                text: personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.displayName,
                alternateText: email,
                login: email,
                accountID: personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID,
                icons: [
                    {
                        source: (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _b !== void 0 ? _b : Expensicons.FallbackAvatar,
                        name: (0, LocalePhoneNumber_1.formatPhoneNumber)(email),
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                        id: personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID,
                    },
                ],
            });
        });
        membersList = (0, OptionsListUtils_1.sortAlphabetically)(membersList, 'text');
        return membersList;
    }, [isOffline, policy === null || policy === void 0 ? void 0 : policy.employeeList]);
    var sections = (0, react_1.useMemo)(function () {
        if (!debouncedSearchTerm) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }
        var searchValue = (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(debouncedSearchTerm).toLowerCase();
        var filteredOptions = (0, tokenizedSearch_1.default)(membersDetails, searchValue, function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.alternateText) !== null && _b !== void 0 ? _b : '']; });
        return [
            {
                title: undefined,
                data: filteredOptions,
                shouldShow: true,
            },
        ];
    }, [membersDetails, debouncedSearchTerm]);
    var headerMessage = (0, react_1.useMemo)(function () {
        var searchValue = debouncedSearchTerm.trim().toLowerCase();
        return (0, OptionsListUtils_1.getHeaderMessage)(sections[0].data.length !== 0, false, searchValue);
    }, [debouncedSearchTerm, sections]);
    return (<InteractiveStepWrapper_1.default wrapperID={AssigneeStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('workspace.card.issueCard')} handleBackButtonPress={handleBackButtonPress} startStepIndex={0} stepNames={CONST_1.default.EXPENSIFY_CARD.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.whoNeedsCard')}</Text_1.default>
            <SelectionList_1.default textInputLabel={textInputLabel} textInputValue={searchTerm} onChangeText={setSearchTerm} sections={sections} headerMessage={headerMessage} ListItem={UserListItem_1.default} onSelectRow={submit} addBottomSafeAreaPadding/>
        </InteractiveStepWrapper_1.default>);
}
AssigneeStep.displayName = 'AssigneeStep';
exports.default = AssigneeStep;
