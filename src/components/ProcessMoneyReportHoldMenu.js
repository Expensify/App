"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var DecisionModal_1 = require("./DecisionModal");
function ProcessMoneyReportHoldMenu(_a) {
    var requestType = _a.requestType, nonHeldAmount = _a.nonHeldAmount, fullAmount = _a.fullAmount, onClose = _a.onClose, isVisible = _a.isVisible, paymentType = _a.paymentType, chatReport = _a.chatReport, moneyRequestReport = _a.moneyRequestReport, transactionCount = _a.transactionCount, startAnimation = _a.startAnimation;
    var translate = (0, useLocalize_1.default)().translate;
    var isApprove = requestType === CONST_1.default.IOU.REPORT_ACTION_TYPE.APPROVE;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var onSubmit = function (full) {
        if (isApprove) {
            if (startAnimation) {
                startAnimation();
            }
            (0, IOU_1.approveMoneyRequest)(moneyRequestReport, full);
            if (!full && (0, ReportActionsUtils_1.isLinkedTransactionHeld)(Navigation_1.default.getTopmostReportActionId(), moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID)) {
                Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID));
            }
        }
        else if (chatReport && paymentType) {
            if (startAnimation) {
                startAnimation();
            }
            (0, IOU_1.payMoneyRequest)(paymentType, chatReport, moneyRequestReport, full);
        }
        onClose();
    };
    var promptText = (0, react_1.useMemo)(function () {
        if (nonHeldAmount) {
            return translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount');
        }
        return translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', { count: transactionCount });
    }, [nonHeldAmount, transactionCount, translate, isApprove]);
    return (<DecisionModal_1.default title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')} onClose={onClose} isVisible={isVisible} prompt={promptText} firstOptionText={nonHeldAmount ? "".concat(translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly'), " ").concat(nonHeldAmount) : undefined} secondOptionText={"".concat(translate(isApprove ? 'iou.approve' : 'iou.pay'), " ").concat(fullAmount)} onFirstOptionSubmit={function () { return onSubmit(false); }} onSecondOptionSubmit={function () { return onSubmit(true); }} isSmallScreenWidth={isSmallScreenWidth}/>);
}
ProcessMoneyReportHoldMenu.displayName = 'ProcessMoneyReportHoldMenu';
exports.default = ProcessMoneyReportHoldMenu;
