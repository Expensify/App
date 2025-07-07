"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TagsOptionsListUtils_1 = require("@libs/TagsOptionsListUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function SplitExpenseEditPage(_a) {
    var _b, _c, _d, _e;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _f = route.params, reportID = _f.reportID, transactionID = _f.transactionID, _g = _f.splitExpenseTransactionID, splitExpenseTransactionID = _g === void 0 ? '' : _g, backTo = _f.backTo;
    var report = (0, ReportUtils_1.getReportOrDraftReport)(reportID);
    var splitExpenseDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID), { canBeMissing: false })[0];
    var splitExpenseDraftTransactionDetails = (0, react_1.useMemo)(function () { var _a; return (_a = (0, ReportUtils_1.getTransactionDetails)(splitExpenseDraftTransaction)) !== null && _a !== void 0 ? _a : {}; }, [splitExpenseDraftTransaction]);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(report === null || report === void 0 ? void 0 : report.policyID);
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: false })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: false })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: false })[0];
    var transactionDetails = (0, react_1.useMemo)(function () { var _a; return (_a = (0, ReportUtils_1.getTransactionDetails)(transaction)) !== null && _a !== void 0 ? _a : {}; }, [transaction]);
    var transactionDetailsAmount = (_b = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.amount) !== null && _b !== void 0 ? _b : 0;
    var draftTransactionWithSplitExpenses = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: false })[0];
    var splitExpensesList = (_c = draftTransactionWithSplitExpenses === null || draftTransactionWithSplitExpenses === void 0 ? void 0 : draftTransactionWithSplitExpenses.comment) === null || _c === void 0 ? void 0 : _c.splitExpenses;
    var currentAmount = transactionDetailsAmount >= 0 ? Math.abs(Number(splitExpenseDraftTransactionDetails === null || splitExpenseDraftTransactionDetails === void 0 ? void 0 : splitExpenseDraftTransactionDetails.amount)) : Number(splitExpenseDraftTransactionDetails === null || splitExpenseDraftTransactionDetails === void 0 ? void 0 : splitExpenseDraftTransactionDetails.amount);
    var currentDescription = (0, ReportUtils_1.getParsedComment)(Parser_1.default.htmlToMarkdown((_d = splitExpenseDraftTransactionDetails === null || splitExpenseDraftTransactionDetails === void 0 ? void 0 : splitExpenseDraftTransactionDetails.comment) !== null && _d !== void 0 ? _d : ''));
    var transactionTag = (0, TransactionUtils_1.getTag)(splitExpenseDraftTransaction);
    var policyTagLists = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getTagLists)(policyTags); }, [policyTags]);
    var shouldShowTag = !!(policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled) && !!(transactionTag || (0, TagsOptionsListUtils_1.hasEnabledTags)(policyTagLists));
    var shouldShowCategory = !!(policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) && !!policyCategories;
    return (<ScreenWrapper_1.default testID={SplitExpenseEditPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!reportID || (0, EmptyObject_1.isEmptyObject)(splitExpenseDraftTransaction)}>
                <react_native_1.View style={[styles.flex1]}>
                    <HeaderWithBackButton_1.default title={translate('iou.splitExpenseEditTitle', {
            amount: (0, CurrencyUtils_1.convertToDisplayString)(currentAmount, splitExpenseDraftTransactionDetails === null || splitExpenseDraftTransactionDetails === void 0 ? void 0 : splitExpenseDraftTransactionDetails.currency),
            merchant: (_e = splitExpenseDraftTransaction === null || splitExpenseDraftTransaction === void 0 ? void 0 : splitExpenseDraftTransaction.merchant) !== null && _e !== void 0 ? _e : '',
        })} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                    <ScrollView_1.default>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon shouldRenderAsHTML key={translate('common.description')} description={translate('common.description')} title={currentDescription} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST_1.default.IOU.ACTION.EDIT, CONST_1.default.IOU.TYPE.SPLIT_EXPENSE, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, Navigation_1.default.getActiveRoute()));
        }} style={[styles.moneyRequestMenuItem]} titleWrapperStyle={styles.flex1} numberOfLinesTitle={2}/>
                        {shouldShowCategory && (<MenuItemWithTopDescription_1.default shouldShowRightIcon key={translate('common.category')} description={translate('common.category')} title={splitExpenseDraftTransactionDetails === null || splitExpenseDraftTransactionDetails === void 0 ? void 0 : splitExpenseDraftTransactionDetails.category} numberOfLinesTitle={2} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST_1.default.IOU.ACTION.EDIT, CONST_1.default.IOU.TYPE.SPLIT_EXPENSE, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, Navigation_1.default.getActiveRoute()));
            }} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1}/>)}
                        {shouldShowTag && (<MenuItemWithTopDescription_1.default shouldShowRightIcon key={translate('workspace.common.tags')} description={translate('workspace.common.tags')} title={transactionTag} numberOfLinesTitle={2} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAG.getRoute(CONST_1.default.IOU.ACTION.EDIT, CONST_1.default.IOU.TYPE.SPLIT_EXPENSE, 0, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, Navigation_1.default.getActiveRoute()));
            }} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1}/>)}
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon key={translate('common.date')} description={translate('common.date')} title={splitExpenseDraftTransactionDetails === null || splitExpenseDraftTransactionDetails === void 0 ? void 0 : splitExpenseDraftTransactionDetails.created} numberOfLinesTitle={2} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DATE.getRoute(CONST_1.default.IOU.ACTION.EDIT, CONST_1.default.IOU.TYPE.SPLIT_EXPENSE, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, Navigation_1.default.getActiveRoute()));
        }} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1}/>
                    </ScrollView_1.default>
                    <FixedFooter_1.default style={styles.mtAuto}>
                        {Number(splitExpensesList === null || splitExpensesList === void 0 ? void 0 : splitExpensesList.length) > 2 && (<Button_1.default danger large style={[styles.w100, styles.mb4]} text={translate('iou.removeSplit')} onPress={function () {
                (0, IOU_1.removeSplitExpenseField)(draftTransactionWithSplitExpenses, splitExpenseTransactionID);
                Navigation_1.default.goBack(backTo);
            }} pressOnEnter enterKeyEventListenerPriority={1}/>)}
                        <Button_1.default success large style={[styles.w100]} text={translate('common.save')} onPress={function () {
            (0, IOU_1.updateSplitExpenseField)(splitExpenseDraftTransaction, splitExpenseTransactionID);
            Navigation_1.default.goBack(backTo);
        }} pressOnEnter enterKeyEventListenerPriority={1}/>
                    </FixedFooter_1.default>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
SplitExpenseEditPage.displayName = 'SplitExpenseEditPage';
exports.default = SplitExpenseEditPage;
