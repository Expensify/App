"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AmountForm_1 = require("@components/AmountForm");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var Card_1 = require("@libs/actions/Card");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EditExpensifyCardLimitForm_1 = require("@src/types/form/EditExpensifyCardLimitForm");
function WorkspaceEditCardLimitPage(_a) {
    var _b;
    var route = _a.route;
    var _c = route.params, policyID = _c.policyID, cardID = _c.cardID, backTo = _c.backTo;
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, react_1.useState)(false), isConfirmModalVisible = _d[0], setIsConfirmModalVisible = _d[1];
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), { selector: CardUtils_1.filterInactiveCards })[0];
    var card = cardsList === null || cardsList === void 0 ? void 0 : cardsList[cardID];
    var getPromptTextKey = (0, react_1.useMemo)(function () {
        var _a;
        switch ((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.limitType) {
            case CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
                return 'workspace.expensifyCard.smartLimitWarning';
            case CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
                return 'workspace.expensifyCard.fixedLimitWarning';
            case CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
                return 'workspace.expensifyCard.monthlyLimitWarning';
            default:
                return 'workspace.expensifyCard.fixedLimitWarning';
        }
    }, [(_b = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _b === void 0 ? void 0 : _b.limitType]);
    var getNewAvailableSpend = function (newLimit) {
        var _a, _b, _c;
        var currentLimit = (_b = (_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.unapprovedExpenseLimit) !== null && _b !== void 0 ? _b : 0;
        var currentSpend = currentLimit - ((_c = card === null || card === void 0 ? void 0 : card.availableSpend) !== null && _c !== void 0 ? _c : 0);
        return newLimit - currentSpend;
    };
    var isWorkspaceRhp = route.name === SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD_LIMIT;
    var goBack = (0, react_1.useCallback)(function () {
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack(isWorkspaceRhp ? ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID) : ROUTES_1.default.EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID));
    }, [backTo, isWorkspaceRhp, policyID, cardID]);
    var updateCardLimit = function (newLimit) {
        var _a;
        var newAvailableSpend = getNewAvailableSpend(newLimit);
        setIsConfirmModalVisible(false);
        (0, Card_1.updateExpensifyCardLimit)(workspaceAccountID, Number(cardID), newLimit, newAvailableSpend, (_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.unapprovedExpenseLimit, card === null || card === void 0 ? void 0 : card.availableSpend);
        goBack();
    };
    var submit = function (values) {
        var newLimit = Number(values[EditExpensifyCardLimitForm_1.default.LIMIT]) * 100;
        var newAvailableSpend = getNewAvailableSpend(newLimit);
        if (newAvailableSpend <= 0) {
            setIsConfirmModalVisible(true);
            return;
        }
        updateCardLimit(newLimit);
    };
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [EditExpensifyCardLimitForm_1.default.LIMIT]);
        // We only want integers to be sent as the limit
        if (!Number(values.limit)) {
            errors.limit = translate('iou.error.invalidAmount');
        }
        else if (!Number.isInteger(Number(values.limit))) {
            errors.limit = translate('iou.error.invalidIntegerAmount');
        }
        if (Number(values.limit) > CONST_1.default.EXPENSIFY_CARD.LIMIT_VALUE) {
            errors.limit = translate('workspace.card.issueNewCard.cardLimitError');
        }
        return errors;
    }, [translate]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceEditCardLimitPage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.expensifyCard.cardLimit')} onBackButtonPress={goBack}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM} submitButtonText={translate('common.save')} shouldHideFixErrorsAlert onSubmit={submit} style={styles.flex1} submitButtonStyles={[styles.mh5, styles.mt0]} submitFlexEnabled={false} enabledWhenOffline validate={validate}>
                    {function (_a) {
            var _b;
            var inputValues = _a.inputValues;
            return (<>
                            <InputWrapper_1.default InputComponent={AmountForm_1.default} defaultValue={(0, CurrencyUtils_1.convertToFrontendAmountAsString)((_b = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _b === void 0 ? void 0 : _b.unapprovedExpenseLimit, CONST_1.default.CURRENCY.USD, false)} isCurrencyPressable={false} inputID={EditExpensifyCardLimitForm_1.default.LIMIT} ref={inputCallbackRef}/>
                            <ConfirmModal_1.default title={translate('workspace.expensifyCard.changeCardLimit')} isVisible={isConfirmModalVisible} onConfirm={function () { return updateCardLimit(Number(inputValues[EditExpensifyCardLimitForm_1.default.LIMIT]) * 100); }} onCancel={function () { return setIsConfirmModalVisible(false); }} prompt={translate(getPromptTextKey, { limit: (0, CurrencyUtils_1.convertToDisplayString)(Number(inputValues[EditExpensifyCardLimitForm_1.default.LIMIT]) * 100, CONST_1.default.CURRENCY.USD) })} confirmText={translate('workspace.expensifyCard.changeLimit')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
                        </>);
        }}
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceEditCardLimitPage.displayName = 'WorkspaceEditCardLimitPage';
exports.default = WorkspaceEditCardLimitPage;
