"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var Expensicons = require("@components/Icon/Expensicons");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var Navigation_1 = require("@navigation/Navigation");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;
function AssigneeStep(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy, feed = _a.feed;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: true })[0];
    var list = (0, useCardsList_1.default)(policy === null || policy === void 0 ? void 0 : policy.id, feed)[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policy === null || policy === void 0 ? void 0 : policy.id)[0];
    var filteredCardList = (0, CardUtils_1.getFilteredCardList)(list, (_c = (_b = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _b === void 0 ? void 0 : _b.oAuthAccountDetails) === null || _c === void 0 ? void 0 : _c[feed]);
    var isEditing = assignCard === null || assignCard === void 0 ? void 0 : assignCard.isEditing;
    var _f = (0, react_1.useState)((_e = (_d = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _d === void 0 ? void 0 : _d.email) !== null && _e !== void 0 ? _e : ''), selectedMember = _f[0], setSelectedMember = _f[1];
    var _g = (0, useDebouncedState_1.default)(''), searchTerm = _g[0], debouncedSearchTerm = _g[1], setSearchTerm = _g[2];
    var _h = (0, react_1.useState)(false), shouldShowError = _h[0], setShouldShowError = _h[1];
    var selectMember = function (assignee) {
        var _a;
        react_native_1.Keyboard.dismiss();
        setSelectedMember((_a = assignee.login) !== null && _a !== void 0 ? _a : '');
        setShouldShowError(false);
    };
    var submit = function () {
        var _a;
        var nextStep = CONST_1.default.COMPANY_CARD.STEP.CARD;
        if (selectedMember === ((_a = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _a === void 0 ? void 0 : _a.email)) {
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: isEditing ? CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
                isEditing: false,
            });
            return;
        }
        if (!selectedMember) {
            setShouldShowError(true);
            return;
        }
        var personalDetail = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(selectedMember);
        var memberName = (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.firstName) ? personalDetail.firstName : personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login;
        var data = {
            email: selectedMember,
            cardName: (0, CardUtils_1.getDefaultCardName)(memberName),
        };
        if ((0, CardUtils_1.hasOnlyOneCardToAssign)(filteredCardList)) {
            nextStep = CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
            data.cardNumber = Object.keys(filteredCardList).at(0);
            data.encryptedCardNumber = Object.values(filteredCardList).at(0);
        }
        (0, CompanyCards_1.setAssignCardStepAndData)({
            currentStep: isEditing ? CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
            data: data,
            isEditing: false,
        });
    };
    var handleBackButtonPress = function () {
        if (isEditing) {
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        Navigation_1.default.goBack();
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
                isSelected: selectedMember === email,
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
    }, [isOffline, policy === null || policy === void 0 ? void 0 : policy.employeeList, selectedMember]);
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
    return (<InteractiveStepWrapper_1.default wrapperID={AssigneeStep.displayName} handleBackButtonPress={handleBackButtonPress} startStepIndex={0} stepNames={CONST_1.default.COMPANY_CARD.STEP_NAMES} headerTitle={translate('workspace.companyCards.assignCard')} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.whoNeedsCardAssigned')}</Text_1.default>
            <SelectionList_1.default textInputLabel={textInputLabel} textInputValue={searchTerm} onChangeText={setSearchTerm} sections={sections} headerMessage={headerMessage} ListItem={UserListItem_1.default} onSelectRow={selectMember} initiallyFocusedOptionKey={selectedMember} shouldUpdateFocusedIndex addBottomSafeAreaPadding footerContent={<FormAlertWithSubmitButton_1.default buttonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={submit} isAlertVisible={shouldShowError} containerStyles={[!shouldShowError && styles.mt5]} addButtonBottomPadding={false} message={translate('common.error.pleaseSelectOne')}/>}/>
        </InteractiveStepWrapper_1.default>);
}
AssigneeStep.displayName = 'AssigneeStep';
exports.default = AssigneeStep;
