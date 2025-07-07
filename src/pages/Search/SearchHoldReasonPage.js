"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchContext_1 = require("@components/Search/SearchContext");
var useLocalize_1 = require("@hooks/useLocalize");
var FormActions_1 = require("@libs/actions/FormActions");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var HoldReasonFormView_1 = require("@pages/iou/HoldReasonFormView");
var IOU_1 = require("@userActions/IOU");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var MoneyRequestHoldReasonForm_1 = require("@src/types/form/MoneyRequestHoldReasonForm");
function SearchHoldReasonPage(_a) {
    var _b;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (_b = route.params) !== null && _b !== void 0 ? _b : {}, _d = _c.backTo, backTo = _d === void 0 ? '' : _d, reportID = _c.reportID;
    var context = (0, SearchContext_1.useSearchContext)();
    var onSubmit = (0, react_1.useCallback)(function (_a) {
        var comment = _a.comment;
        if (route.name === SCREENS_1.default.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS) {
            (0, IOU_1.putTransactionsOnHold)(context.selectedTransactionIDs, comment, reportID);
            context.clearSelectedTransactions(true);
        }
        else {
            (0, Search_1.holdMoneyRequestOnSearch)(context.currentSearchHash, Object.keys(context.selectedTransactions), comment);
            context.clearSelectedTransactions();
        }
        Navigation_1.default.goBack();
    }, [route.name, context, reportID]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [MoneyRequestHoldReasonForm_1.default.COMMENT]);
        if (!values.comment) {
            errors.comment = translate('common.error.fieldRequired');
        }
        return errors;
    }, [translate]);
    (0, react_1.useEffect)(function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.MONEY_REQUEST_HOLD_FORM);
        (0, FormActions_1.clearErrorFields)(ONYXKEYS_1.default.FORMS.MONEY_REQUEST_HOLD_FORM);
    }, []);
    return (<HoldReasonFormView_1.default onSubmit={onSubmit} validate={validate} backTo={backTo}/>);
}
SearchHoldReasonPage.displayName = 'SearchHoldReasonPage';
exports.default = SearchHoldReasonPage;
