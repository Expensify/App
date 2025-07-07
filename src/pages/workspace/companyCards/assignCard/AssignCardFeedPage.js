"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useInitial_1 = require("@hooks/useInitial");
var useOnyx_1 = require("@hooks/useOnyx");
var PlaidConnectionStep_1 = require("@pages/workspace/companyCards/addNew/PlaidConnectionStep");
var BankConnection_1 = require("@pages/workspace/companyCards/BankConnection");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AssigneeStep_1 = require("./AssigneeStep");
var CardNameStep_1 = require("./CardNameStep");
var CardSelectionStep_1 = require("./CardSelectionStep");
var ConfirmationStep_1 = require("./ConfirmationStep");
var TransactionStartDateStep_1 = require("./TransactionStartDateStep");
function AssignCardFeedPage(_a) {
    var _b, _c, _d, _e;
    var route = _a.route, policy = _a.policy;
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: true })[0];
    var currentStep = assignCard === null || assignCard === void 0 ? void 0 : assignCard.currentStep;
    var feed = decodeURIComponent((_b = route.params) === null || _b === void 0 ? void 0 : _b.feed);
    var backTo = (_c = route.params) === null || _c === void 0 ? void 0 : _c.backTo;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var isActingAsDelegate = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { var _a; return !!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate); }, canBeMissing: true })[0];
    var firstAssigneeEmail = (0, useInitial_1.default)((_d = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _d === void 0 ? void 0 : _d.email);
    var shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === ((_e = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _e === void 0 ? void 0 : _e.email);
    (0, react_1.useEffect)(function () {
        return function () {
            (0, CompanyCards_1.clearAssignCardStepAndData)();
        };
    }, []);
    if (isActingAsDelegate) {
        return (<ScreenWrapper_1.default testID={AssignCardFeedPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}/>
            </ScreenWrapper_1.default>);
    }
    switch (currentStep) {
        case CONST_1.default.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (<BankConnection_1.default policyID={policyID} feed={feed}/>);
        case CONST_1.default.COMPANY_CARD.STEP.PLAID_CONNECTION:
            return <PlaidConnectionStep_1.default feed={feed}/>;
        case CONST_1.default.COMPANY_CARD.STEP.ASSIGNEE:
            return (<AssigneeStep_1.default policy={policy} feed={feed}/>);
        case CONST_1.default.COMPANY_CARD.STEP.CARD:
            return (<CardSelectionStep_1.default feed={feed} policyID={policyID}/>);
        case CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
            return (<TransactionStartDateStep_1.default policyID={policyID} feed={feed} backTo={backTo}/>);
        case CONST_1.default.COMPANY_CARD.STEP.CARD_NAME:
            return <CardNameStep_1.default policyID={policyID}/>;
        case CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION:
            return (<ConfirmationStep_1.default policyID={policyID} backTo={shouldUseBackToParam ? backTo : undefined}/>);
        default:
            return (<AssigneeStep_1.default policy={policy} feed={feed}/>);
    }
}
AssignCardFeedPage.displayName = 'AssignCardFeedPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(AssignCardFeedPage);
