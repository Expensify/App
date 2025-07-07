"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var RenderHTML_1 = require("@components/RenderHTML");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardMessageUtils_1 = require("@libs/CardMessageUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function IssueCardMessage(_a) {
    var _b;
    var action = _a.action, policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    var assigneeAccountID = (_b = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _b === void 0 ? void 0 : _b.assigneeAccountID;
    var card = (0, CardMessageUtils_1.getExpensifyCardFromReportAction)({ reportAction: action, policyID: policyID });
    var isAssigneeCurrentUser = !(0, EmptyObject_1.isEmptyObject)(session) && session.accountID === assigneeAccountID;
    var shouldShowAddMissingDetailsButton = isAssigneeCurrentUser && (0, ReportActionsUtils_1.shouldShowAddMissingDetails)(action === null || action === void 0 ? void 0 : action.actionName, card);
    return (<>
            <RenderHTML_1.default html={"<muted-text>".concat((0, ReportActionsUtils_1.getCardIssuedMessage)({ reportAction: action, shouldRenderHTML: true, policyID: policyID, card: card }), "</muted-text>")}/>
            {shouldShowAddMissingDetailsButton && (<Button_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.MISSING_PERSONAL_DETAILS); }} success style={[styles.alignSelfStart, styles.mt3]} text={translate('workspace.expensifyCard.addShippingDetails')}/>)}
        </>);
}
IssueCardMessage.displayName = 'IssueCardMessage';
exports.default = IssueCardMessage;
