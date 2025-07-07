"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var useOnyx_1 = require("@hooks/useOnyx");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
var IOUUtils_1 = require("@libs/IOUUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function default_1(WrappedComponent) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithFullTransactionOrNotFound(props, ref) {
        var route = props.route;
        var transactionID = route.params.transactionID;
        var userAction = 'action' in route.params && route.params.action ? route.params.action : CONST_1.default.IOU.ACTION.CREATE;
        var _a = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true }), transaction = _a[0], transactionResult = _a[1];
        var _b = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true }), transactionDraft = _b[0], transactionDraftResult = _b[1];
        var isLoadingTransaction = (0, isLoadingOnyxValue_1.default)(transactionResult, transactionDraftResult);
        var splitTransactionDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
        var userType = 'iouType' in route.params && route.params.iouType ? route.params.iouType : CONST_1.default.IOU.TYPE.CREATE;
        var isFocused = (0, native_1.useIsFocused)();
        var transactionDraftData = userType === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE ? splitTransactionDraft : transactionDraft;
        // If the transaction does not have a transactionID, then the transaction no longer exists in Onyx as a full transaction and the not-found page should be shown.
        // In addition, the not-found page should be shown only if the component screen's route is active (i.e. is focused).
        // This is to prevent it from showing when the modal is being dismissed while navigating to a different route (e.g. on requesting money).
        if (!transactionID) {
            return <FullPageNotFoundView_1.default shouldShow={isFocused}/>;
        }
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} transaction={(0, IOUUtils_1.shouldUseTransactionDraft)(userAction, userType) ? transactionDraftData : transaction} isLoadingTransaction={isLoadingTransaction} ref={ref}/>);
    }
    WithFullTransactionOrNotFound.displayName = "withFullTransactionOrNotFound(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
    return (0, react_1.forwardRef)(WithFullTransactionOrNotFound);
}
