"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnyxProvider_1 = require("@components/OnyxProvider");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var IOUUtils = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils = require("@libs/OptionsListUtils");
var ReportUtils = require("@libs/ReportUtils");
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepSplitPayer(_a) {
    var _b = _a.route.params, iouType = _b.iouType, transactionID = _b.transactionID, action = _b.action, backTo = _b.backTo, transaction = _a.transaction, report = _a.report;
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var currentUserOption = (0, react_1.useMemo)(function () { return ({
        accountID: currentUserPersonalDetails.accountID,
        searchText: currentUserPersonalDetails.login,
        selected: true,
    }); }, [currentUserPersonalDetails]);
    var sections = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        var participants = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) !== null && _a !== void 0 ? _a : [];
        var participantOptions = (_d = (_c = (_b = __spreadArray([currentUserOption], participants, true)) === null || _b === void 0 ? void 0 : _b.filter(function (participant) { return !!participant.accountID; })) === null || _c === void 0 ? void 0 : _c.map(function (participant) { return OptionsListUtils.getParticipantsOption(participant, personalDetails); })) !== null && _d !== void 0 ? _d : [];
        return [
            {
                title: '',
                data: participantOptions.map(function (participantOption) {
                    var _a, _b;
                    return (__assign(__assign({}, participantOption), { isSelected: !!(transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs) && ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs) === null || _a === void 0 ? void 0 : _a.includes((_b = participantOption.accountID) !== null && _b !== void 0 ? _b : -1)) }));
                }),
            },
        ];
    }, [transaction === null || transaction === void 0 ? void 0 : transaction.participants, personalDetails, transaction === null || transaction === void 0 ? void 0 : transaction.splitPayerAccountIDs, currentUserOption]);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var setSplitPayer = function (item) {
        var _a;
        IOU.setSplitPayer(transactionID, (_a = item.accountID) !== null && _a !== void 0 ? _a : -1);
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('moneyRequestConfirmationList.paidBy')} onBackButtonPress={navigateBack} shouldShowNotFoundPage={!IOUUtils.isValidMoneyRequestType(iouType) || ReportUtils.isPolicyExpenseChat(report) || action !== CONST_1.default.IOU.ACTION.CREATE || iouType !== CONST_1.default.IOU.TYPE.SPLIT} shouldShowWrapper testID={IOURequestStepSplitPayer.displayName}>
            <SelectionList_1.default sections={sections} ListItem={UserListItem_1.default} onSelectRow={setSplitPayer} shouldSingleExecuteRowSelect showLoadingPlaceholder={!didScreenTransitionEnd}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepSplitPayer.displayName = 'IOURequestStepSplitPayer';
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepSplitPayerWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepSplitPayer);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepSplitPayerWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepSplitPayerWithWritableReportOrNotFound);
exports.default = IOURequestStepSplitPayerWithFullTransactionOrNotFound;
