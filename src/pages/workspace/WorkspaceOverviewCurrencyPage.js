"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CurrencySelectionList_1 = require("@components/CurrencySelectionList");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var BankAccount_1 = require("@libs/models/BankAccount");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var mapCurrencyToCountry_1 = require("@pages/ReimbursementAccount/utils/mapCurrencyToCountry");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var Policy_1 = require("@userActions/Policy/Policy");
var ReimbursementAccount_1 = require("@userActions/ReimbursementAccount");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
var COUNTRY = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY;
function WorkspaceOverviewCurrencyPage(_a) {
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var isForcedToChangeCurrency = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_FORCED_TO_CHANGE_CURRENCY, { canBeMissing: true })[0];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { selector: function (value) { var _a; return ((_a = value === null || value === void 0 ? void 0 : value.achData) === null || _a === void 0 ? void 0 : _a.state) === BankAccount_1.default.STATE.OPEN; }, canBeMissing: true })[0], hasVBA = _b === void 0 ? false : _b;
    var onSelectCurrency = function (item) {
        var _a;
        var _b, _c;
        if (!policy) {
            return;
        }
        (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[COUNTRY] = (0, mapCurrencyToCountry_1.default)(item.currencyCode), _a));
        (0, Policy_1.updateGeneralSettings)(policy.id, (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : '', item.currencyCode);
        (0, BankAccounts_1.clearCorpayBankAccountFields)();
        if (isForcedToChangeCurrency) {
            (0, Policy_1.setIsForcedToChangeCurrency)(false);
            if ((0, Policy_1.isCurrencySupportedForGlobalReimbursement)(item.currencyCode, (_c = isBetaEnabled(CONST_1.default.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND)) !== null && _c !== void 0 ? _c : false)) {
                (0, ReimbursementAccount_1.navigateToBankAccountRoute)(policy.id, ROUTES_1.default.WORKSPACE_WORKFLOWS.getRoute(policy.id), { forceReplace: true });
                return;
            }
        }
        Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policy === null || policy === void 0 ? void 0 : policy.id} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} shouldBeBlocked={hasVBA} fullPageNotFoundViewProps={{
            onLinkPress: hasVBA ? function () { return Navigation_1.default.goBack(); } : PolicyUtils_1.goBackFromInvalidPolicy,
            subtitleKey: hasVBA || (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized',
        }}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceOverviewCurrencyPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.editor.currencyInputLabel')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>

                <CurrencySelectionList_1.default searchInputLabel={translate('workspace.editor.currencyInputLabel')} onSelect={onSelectCurrency} initiallySelectedCurrencyCode={policy === null || policy === void 0 ? void 0 : policy.outputCurrency} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOverviewCurrencyPage.displayName = 'WorkspaceOverviewCurrencyPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceOverviewCurrencyPage);
