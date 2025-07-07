"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var getPlaidOAuthReceivedRedirectURI_1 = require("@libs/getPlaidOAuthReceivedRedirectURI");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var BankAccounts_1 = require("@userActions/BankAccounts");
var ReimbursementAccount_1 = require("@userActions/ReimbursementAccount");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var Manual_1 = require("./subSteps/Manual");
var Plaid_1 = require("./subSteps/Plaid");
var BANK_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.BANK_INFO_STEP;
var manualSubSteps = [Manual_1.default];
var plaidSubSteps = [Plaid_1.default];
var receivedRedirectURI = (0, getPlaidOAuthReceivedRedirectURI_1.default)();
function BankInfo(_a) {
    var _b, _c, _d;
    var onBackButtonPress = _a.onBackButtonPress, policyID = _a.policyID, setUSDBankAccountStep = _a.setUSDBankAccountStep;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var plaidLinkToken = (0, useOnyx_1.default)(ONYXKEYS_1.default.PLAID_LINK_TOKEN, { canBeMissing: true })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var _e = react_1.default.useState(false), redirectedFromPlaidToManual = _e[0], setRedirectedFromPlaidToManual = _e[1];
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(BANK_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount !== null && reimbursementAccount !== void 0 ? reimbursementAccount : {}); }, [reimbursementAccount, reimbursementAccountDraft]);
    var setupType = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.subStep) !== null && _c !== void 0 ? _c : '';
    var shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST_1.default.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }
    var bankAccountID = Number((_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.bankAccountID);
    var submit = (0, react_1.useCallback)(function (submitData) {
        var _a, _b;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        var data = submitData;
        if (setupType === CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
            (0, BankAccounts_1.connectBankAccountManually)(bankAccountID, (_a = {},
                _a[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] = (_c = data[BANK_INFO_STEP_KEYS.ROUTING_NUMBER]) !== null && _c !== void 0 ? _c : '',
                _a[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] = (_d = data[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]) !== null && _d !== void 0 ? _d : '',
                _a[BANK_INFO_STEP_KEYS.BANK_NAME] = (_e = data[BANK_INFO_STEP_KEYS.BANK_NAME]) !== null && _e !== void 0 ? _e : '',
                _a[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] = (_f = data[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]) !== null && _f !== void 0 ? _f : '',
                _a[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] = (_g = data[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]) !== null && _g !== void 0 ? _g : '',
                _a[BANK_INFO_STEP_KEYS.PLAID_MASK] = (_h = data[BANK_INFO_STEP_KEYS.PLAID_MASK]) !== null && _h !== void 0 ? _h : '',
                _a[BANK_INFO_STEP_KEYS.IS_SAVINGS] = (_j = data[BANK_INFO_STEP_KEYS.IS_SAVINGS]) !== null && _j !== void 0 ? _j : false,
                _a), policyID);
        }
        else if (setupType === CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
            (0, BankAccounts_1.connectBankAccountWithPlaid)(bankAccountID, (_b = {},
                _b[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] = (_k = data[BANK_INFO_STEP_KEYS.ROUTING_NUMBER]) !== null && _k !== void 0 ? _k : '',
                _b[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] = (_l = data[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]) !== null && _l !== void 0 ? _l : '',
                _b[BANK_INFO_STEP_KEYS.BANK_NAME] = (_m = data[BANK_INFO_STEP_KEYS.BANK_NAME]) !== null && _m !== void 0 ? _m : '',
                _b[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] = (_o = data[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]) !== null && _o !== void 0 ? _o : '',
                _b[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] = (_p = data[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]) !== null && _p !== void 0 ? _p : '',
                _b[BANK_INFO_STEP_KEYS.PLAID_MASK] = (_q = data[BANK_INFO_STEP_KEYS.PLAID_MASK]) !== null && _q !== void 0 ? _q : '',
                _b[BANK_INFO_STEP_KEYS.IS_SAVINGS] = (_r = data[BANK_INFO_STEP_KEYS.IS_SAVINGS]) !== null && _r !== void 0 ? _r : false,
                _b), policyID);
        }
    }, [setupType, bankAccountID, policyID]);
    var bodyContent = setupType === CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID ? plaidSubSteps : manualSubSteps;
    var _f = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: 0, onFinished: submit }), SubStep = _f.componentToRender, isEditing = _f.isEditing, screenIndex = _f.screenIndex, nextScreen = _f.nextScreen, prevScreen = _f.prevScreen, moveTo = _f.moveTo;
    // Some services user connects to via Plaid return dummy account numbers and routing numbers e.g. Chase
    // In this case we need to redirect user to manual flow to enter real account number and routing number
    // and we need to do it only once so redirectedFromPlaidToManual flag is used
    (0, react_1.useEffect)(function () {
        if (redirectedFromPlaidToManual) {
            return;
        }
        if (setupType === CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.MANUAL && values.bankName !== '' && !redirectedFromPlaidToManual) {
            setRedirectedFromPlaidToManual(true);
        }
    }, [redirectedFromPlaidToManual, setupType, values]);
    var handleBackButtonPress = function () {
        var _a;
        if (screenIndex === 0) {
            if (bankAccountID) {
                onBackButtonPress();
            }
            else {
                var bankAccountData = (_a = {},
                    _a[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] = '',
                    _a[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] = '',
                    _a[BANK_INFO_STEP_KEYS.PLAID_MASK] = '',
                    _a[BANK_INFO_STEP_KEYS.IS_SAVINGS] = false,
                    _a[BANK_INFO_STEP_KEYS.BANK_NAME] = '',
                    _a[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] = '',
                    _a[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] = '',
                    _a);
                (0, ReimbursementAccount_1.updateReimbursementAccountDraft)(bankAccountData);
                (0, ReimbursementAccount_1.hideBankAccountErrors)();
                (0, BankAccounts_1.setBankAccountSubStep)(null);
                setUSDBankAccountStep(null);
            }
        }
        else {
            prevScreen();
        }
    };
    return (<InteractiveStepWrapper_1.default wrapperID={BankInfo.displayName} shouldEnablePickerAvoiding={false} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('bankAccount.bankInfo')} startStepIndex={0} stepNames={CONST_1.default.BANK_ACCOUNT.STEP_NAMES}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo} setUSDBankAccountStep={setUSDBankAccountStep}/>
        </InteractiveStepWrapper_1.default>);
}
BankInfo.displayName = 'BankInfo';
exports.default = BankInfo;
