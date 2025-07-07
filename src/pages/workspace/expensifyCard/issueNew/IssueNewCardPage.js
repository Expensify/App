"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useInitial_1 = require("@hooks/useInitial");
var useOnyx_1 = require("@hooks/useOnyx");
var Card_1 = require("@libs/actions/Card");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AssigneeStep_1 = require("./AssigneeStep");
var CardNameStep_1 = require("./CardNameStep");
var CardTypeStep_1 = require("./CardTypeStep");
var ConfirmationStep_1 = require("./ConfirmationStep");
var LimitStep_1 = require("./LimitStep");
var LimitTypeStep_1 = require("./LimitTypeStep");
function IssueNewCardPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy, route = _a.route;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID), { canBeMissing: true })[0];
    var currentStep = (issueNewCard !== null && issueNewCard !== void 0 ? issueNewCard : {}).currentStep;
    var backTo = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var firstAssigneeEmail = (0, useInitial_1.default)((_c = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _c === void 0 ? void 0 : _c.assigneeEmail);
    var shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === ((_d = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _d === void 0 ? void 0 : _d.assigneeEmail);
    var isActingAsDelegate = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { var _a; return !!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate); }, canBeMissing: true })[0];
    (0, react_1.useEffect)(function () {
        (0, Card_1.startIssueNewCardFlow)(policyID);
    }, [policyID]);
    var getCurrentStep = function () {
        switch (currentStep) {
            case CONST_1.default.EXPENSIFY_CARD.STEP.ASSIGNEE:
                return <AssigneeStep_1.default policy={policy}/>;
            case CONST_1.default.EXPENSIFY_CARD.STEP.CARD_TYPE:
                return <CardTypeStep_1.default policyID={policyID}/>;
            case CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT_TYPE:
                return <LimitTypeStep_1.default policy={policy}/>;
            case CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT:
                return <LimitStep_1.default policyID={policyID}/>;
            case CONST_1.default.EXPENSIFY_CARD.STEP.CARD_NAME:
                return <CardNameStep_1.default policyID={policyID}/>;
            case CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION:
                return (<ConfirmationStep_1.default policyID={policyID} backTo={shouldUseBackToParam ? backTo : undefined}/>);
            default:
                return <AssigneeStep_1.default policy={policy}/>;
        }
    };
    if (isActingAsDelegate) {
        return (<ScreenWrapper_1.default testID={IssueNewCardPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            </ScreenWrapper_1.default>);
    }
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            {getCurrentStep()}
        </AccessOrNotFoundWrapper_1.default>);
}
IssueNewCardPage.displayName = 'IssueNewCardPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(IssueNewCardPage);
