"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var BankConnection_1 = require("@pages/workspace/companyCards/BankConnection");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var AmexCustomFeed_1 = require("./AmexCustomFeed");
var CardInstructionsStep_1 = require("./CardInstructionsStep");
var CardNameStep_1 = require("./CardNameStep");
var CardTypeStep_1 = require("./CardTypeStep");
var DetailsStep_1 = require("./DetailsStep");
var PlaidConnectionStep_1 = require("./PlaidConnectionStep");
var SelectBankStep_1 = require("./SelectBankStep");
var SelectCountryStep_1 = require("./SelectCountryStep");
var SelectFeedType_1 = require("./SelectFeedType");
var StatementCloseDateStep_1 = require("./StatementCloseDateStep");
function AddNewCardPage(_a) {
    var policy = _a.policy;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: false }), addNewCardFeed = _b[0], addNewCardFeedMetadata = _b[1];
    var currentStep = (addNewCardFeed !== null && addNewCardFeed !== void 0 ? addNewCardFeed : {}).currentStep;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var isActingAsDelegate = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { var _a; return !!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate); }, canBeMissing: false })[0];
    var isAddCardFeedLoading = (0, isLoadingOnyxValue_1.default)(addNewCardFeedMetadata);
    (0, react_1.useEffect)(function () {
        return function () {
            (0, CompanyCards_1.clearAddNewCardFlow)();
        };
    }, []);
    (0, react_1.useEffect)(function () {
        // If the user only has a domain feed, a workspace account may not have been created yet.
        // However, adding a workspace feed requires a workspace account.
        // Calling openPolicyAddCardFeedPage will trigger the creation of a workspace account.
        if (workspaceAccountID) {
            return;
        }
        (0, CompanyCards_1.openPolicyAddCardFeedPage)(policyID);
    }, [workspaceAccountID, policyID]);
    if (isAddCardFeedLoading) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    if (isActingAsDelegate) {
        return (<ScreenWrapper_1.default testID={AddNewCardPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}/>
            </ScreenWrapper_1.default>);
    }
    switch (currentStep) {
        case CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK:
            return <SelectBankStep_1.default />;
        case CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE:
            return <SelectFeedType_1.default />;
        case CONST_1.default.COMPANY_CARDS.STEP.CARD_TYPE:
            return <CardTypeStep_1.default />;
        case CONST_1.default.COMPANY_CARDS.STEP.BANK_CONNECTION:
            return <BankConnection_1.default policyID={policyID}/>;
        case CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS:
            return <CardInstructionsStep_1.default policyID={policyID}/>;
        case CONST_1.default.COMPANY_CARDS.STEP.CARD_NAME:
            return <CardNameStep_1.default />;
        case CONST_1.default.COMPANY_CARDS.STEP.CARD_DETAILS:
            return <DetailsStep_1.default policyID={policyID}/>;
        case CONST_1.default.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED:
            return <AmexCustomFeed_1.default />;
        case CONST_1.default.COMPANY_CARDS.STEP.PLAID_CONNECTION:
            return <PlaidConnectionStep_1.default />;
        case CONST_1.default.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE:
            return <StatementCloseDateStep_1.default policyID={policyID}/>;
        default:
            return isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) ? <SelectCountryStep_1.default policyID={policyID}/> : <SelectBankStep_1.default />;
    }
}
AddNewCardPage.displayName = 'AddNewCardPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(AddNewCardPage);
