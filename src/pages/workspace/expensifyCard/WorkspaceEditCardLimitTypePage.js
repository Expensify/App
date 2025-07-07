"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var Policy_1 = require("@libs/actions/Policy/Policy");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function WorkspaceEditCardLimitTypePage(_a) {
    var _b, _c, _d, _e;
    var route = _a.route;
    var _f = route.params, policyID = _f.policyID, cardID = _f.cardID, backTo = _f.backTo;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), { selector: CardUtils_1.filterInactiveCards })[0];
    var card = cardsList === null || cardsList === void 0 ? void 0 : cardsList[cardID];
    var areApprovalsConfigured = (0, PolicyUtils_1.getApprovalWorkflow)(policy) !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL;
    var defaultLimitType = areApprovalsConfigured ? CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;
    var initialLimitType = (_d = (_c = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _c === void 0 ? void 0 : _c.limitType) !== null && _d !== void 0 ? _d : defaultLimitType;
    var promptTranslationKey = initialLimitType === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED
        ? 'workspace.expensifyCard.changeCardSmartLimitTypeWarning'
        : 'workspace.expensifyCard.changeCardMonthlyLimitTypeWarning';
    var _g = (0, react_1.useState)(initialLimitType), typeSelected = _g[0], setTypeSelected = _g[1];
    var _h = (0, react_1.useState)(false), isConfirmModalVisible = _h[0], setIsConfirmModalVisible = _h[1];
    var isWorkspaceRhp = route.name === SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE;
    var goBack = (0, react_1.useCallback)(function () {
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack(isWorkspaceRhp ? ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID) : ROUTES_1.default.EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID));
    }, [backTo, isWorkspaceRhp, policyID, cardID]);
    var fetchCardLimitTypeData = (0, react_1.useCallback)(function () {
        (0, Policy_1.openPolicyEditCardLimitTypePage)(policyID, Number(cardID));
    }, [policyID, cardID]);
    (0, native_1.useFocusEffect)(fetchCardLimitTypeData);
    var updateCardLimitType = function () {
        var _a;
        setIsConfirmModalVisible(false);
        (0, Card_1.updateExpensifyCardLimitType)(workspaceAccountID, Number(cardID), typeSelected, (_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.limitType);
        goBack();
    };
    var submit = function () {
        var _a;
        var shouldShowConfirmModal = false;
        if (!!(card === null || card === void 0 ? void 0 : card.unapprovedSpend) && ((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.unapprovedExpenseLimit)) {
            // Spends are coming as negative numbers from the backend and we need to make it positive for the correct expression.
            var unapprovedSpend = Math.abs(card.unapprovedSpend);
            var isUnapprovedSpendOverLimit = unapprovedSpend >= card.nameValuePairs.unapprovedExpenseLimit;
            var validCombinations = [
                [CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY, CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART],
                [CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART, CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY],
                [CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART],
                [CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY],
            ];
            // Check if the combination exists in validCombinations
            var isValidCombination = validCombinations.some(function (_a) {
                var limitType = _a[0], selectedType = _a[1];
                return initialLimitType === limitType && typeSelected === selectedType;
            });
            if (isValidCombination && isUnapprovedSpendOverLimit) {
                shouldShowConfirmModal = true;
            }
        }
        if (shouldShowConfirmModal) {
            setIsConfirmModalVisible(true);
        }
        else {
            updateCardLimitType();
        }
    };
    var data = (0, react_1.useMemo)(function () {
        var _a, _b;
        var options = [];
        var shouldShowFixedOption = true;
        if ((card === null || card === void 0 ? void 0 : card.totalSpend) && ((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.unapprovedExpenseLimit)) {
            var totalSpend = Math.abs(card.totalSpend);
            if ((initialLimitType === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART) &&
                totalSpend >= ((_b = card.nameValuePairs) === null || _b === void 0 ? void 0 : _b.unapprovedExpenseLimit)) {
                shouldShowFixedOption = false;
            }
        }
        if (areApprovalsConfigured) {
            options.push({
                value: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }
        options.push({
            value: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            text: translate('workspace.card.issueNewCard.monthly'),
            alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
            keyForList: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            isMultilineSupported: true,
            isSelected: typeSelected === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        });
        if (shouldShowFixedOption) {
            options.push({
                value: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                text: translate('workspace.card.issueNewCard.fixedAmount'),
                alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isMultilineSupported: true,
                isSelected: typeSelected === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            });
        }
        return options;
    }, [areApprovalsConfigured, card, initialLimitType, translate, typeSelected]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceEditCardLimitTypePage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.card.issueNewCard.limitType')} onBackButtonPress={goBack}/>
                <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>
                    <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
        var value = _a.value;
        return setTypeSelected(value);
    }} sections={[{ data: data }]} shouldUpdateFocusedIndex isAlternateTextMultilineSupported initiallyFocusedOptionKey={typeSelected}/>
                    <ConfirmModal_1.default title={translate('workspace.expensifyCard.changeCardLimitType')} isVisible={isConfirmModalVisible} onConfirm={updateCardLimitType} onCancel={function () { return setIsConfirmModalVisible(false); }} prompt={translate(promptTranslationKey, { limit: (0, CurrencyUtils_1.convertToDisplayString)((_e = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _e === void 0 ? void 0 : _e.unapprovedExpenseLimit, CONST_1.default.CURRENCY.USD) })} confirmText={translate('workspace.expensifyCard.changeLimitType')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
                    <Button_1.default success large pressOnEnter text={translate('common.save')} onPress={submit} style={styles.m5}/>
                </FullPageOfflineBlockingView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceEditCardLimitTypePage.displayName = 'WorkspaceEditCardLimitTypePage';
exports.default = WorkspaceEditCardLimitTypePage;
