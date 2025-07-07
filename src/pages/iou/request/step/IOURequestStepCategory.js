"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var CategoryPicker_1 = require("@components/CategoryPicker");
var FixedFooter_1 = require("@components/FixedFooter");
var Illustrations = require("@components/Icon/Illustrations");
var SearchContext_1 = require("@components/Search/SearchContext");
var Text_1 = require("@components/Text");
var WorkspaceEmptyStateSection_1 = require("@components/WorkspaceEmptyStateSection");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var Category_1 = require("@libs/actions/Policy/Category");
var CategoryUtils_1 = require("@libs/CategoryUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepCategory(_a) {
    var _b, _c, _d, _e, _f;
    var reportReal = _a.report, reportDraft = _a.reportDraft, _g = _a.route.params, transactionID = _g.transactionID, backTo = _g.backTo, action = _g.action, iouType = _g.iouType, reportActionID = _g.reportActionID, transaction = _a.transaction;
    var policyReal = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((0, IOU_1.getIOURequestPolicyID)(transaction, reportReal)), { canBeMissing: true })[0];
    var policyDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat((0, IOU_1.getIOURequestPolicyID)(transaction, reportDraft)), { canBeMissing: true })[0];
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
    var policyCategoriesReal = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat((0, IOU_1.getIOURequestPolicyID)(transaction, reportReal)), { canBeMissing: true })[0];
    var policyCategoriesDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES_DRAFT).concat((0, IOU_1.getIOURequestPolicyID)(transaction, reportDraft)), { canBeMissing: true })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat((0, IOU_1.getIOURequestPolicyID)(transaction, reportReal)), { canBeMissing: true })[0];
    var reportID = '-1';
    if (action === CONST_1.default.IOU.ACTION.EDIT && reportReal) {
        if (iouType === CONST_1.default.IOU.TYPE.SPLIT) {
            reportID = reportReal.reportID;
        }
        else if (reportReal.parentReportID) {
            reportID = reportReal.parentReportID;
        }
    }
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), { canEvict: false, canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var report = reportReal !== null && reportReal !== void 0 ? reportReal : reportDraft;
    var policy = policyReal !== null && policyReal !== void 0 ? policyReal : policyDraft;
    var policyCategories = policyCategoriesReal !== null && policyCategoriesReal !== void 0 ? policyCategoriesReal : policyCategoriesDraft;
    var allTransactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true })[0];
    var policyTagLists = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var currentSearchHash = (0, SearchContext_1.useSearchContext)().currentSearchHash;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var isEditingSplit = (iouType === CONST_1.default.IOU.TYPE.SPLIT || iouType === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    var currentTransaction = isEditingSplit && !(0, isEmpty_1.default)(splitDraftTransaction) ? splitDraftTransaction : transaction;
    var transactionCategory = (_c = (_b = (0, ReportUtils_1.getTransactionDetails)(currentTransaction)) === null || _b === void 0 ? void 0 : _b.category) !== null && _c !== void 0 ? _c : '';
    var categoryForDisplay = (0, CategoryUtils_1.isCategoryMissing)(transactionCategory) ? '' : transactionCategory;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var reportAction = (_d = reportActions === null || reportActions === void 0 ? void 0 : reportActions[(report === null || report === void 0 ? void 0 : report.parentReportActionID) || reportActionID]) !== null && _d !== void 0 ? _d : null;
    var shouldShowCategory = ((0, ReportUtils_1.isReportInGroupPolicy)(report) || (0, ReportUtils_1.isGroupPolicy)((_e = policy === null || policy === void 0 ? void 0 : policy.type) !== null && _e !== void 0 ? _e : '')) &&
        // The transactionCategory can be an empty string, so to maintain the logic we'd like to keep it in this shape until utils refactor
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (!!categoryForDisplay || (0, OptionsListUtils_1.hasEnabledOptions)(Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {})));
    var isSplitBill = iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var isSplitExpense = iouType === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE;
    var canEditSplitBill = isSplitBill && reportAction && (session === null || session === void 0 ? void 0 : session.accountID) === reportAction.actorAccountID && (0, TransactionUtils_1.areRequiredFieldsEmpty)(transaction);
    var canEditSplitExpense = isSplitExpense && !!transaction;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = false;
    if (isEditing) {
        if (isSplitBill) {
            shouldShowNotFoundPage = !canEditSplitBill;
        }
        else if (isSplitExpense) {
            shouldShowNotFoundPage = !canEditSplitExpense;
        }
        else {
            shouldShowNotFoundPage = !(0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) || !(0, ReportUtils_1.canEditMoneyRequest)(reportAction);
        }
    }
    var fetchData = function () {
        if ((!!policy && !!policyCategories) || !(report === null || report === void 0 ? void 0 : report.policyID)) {
            return;
        }
        (0, Category_1.getPolicyCategories)(report === null || report === void 0 ? void 0 : report.policyID);
    };
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchData }).isOffline;
    var isLoading = !isOffline && policyCategories === undefined;
    var shouldShowEmptyState = policyCategories !== undefined && !shouldShowCategory;
    var shouldShowOfflineView = policyCategories === undefined && isOffline;
    (0, react_1.useEffect)(function () {
        fetchData();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var updateCategory = function (category) {
        var _a;
        var categorySearchText = (_a = category.searchText) !== null && _a !== void 0 ? _a : '';
        var isSelectedCategory = categorySearchText === categoryForDisplay;
        var updatedCategory = isSelectedCategory ? '' : categorySearchText;
        if (transaction) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit) {
                (0, IOU_1.setDraftSplitTransaction)(transaction.transactionID, { category: updatedCategory }, policy);
                navigateBack();
                return;
            }
            if (isEditing && report) {
                (0, IOU_1.updateMoneyRequestCategory)(transaction.transactionID, report.reportID, updatedCategory, policy, policyTags, policyCategories, currentSearchHash);
                navigateBack();
                return;
            }
        }
        (0, IOU_1.setMoneyRequestCategory)(transactionID, updatedCategory, policy === null || policy === void 0 ? void 0 : policy.id);
        if (action === CONST_1.default.IOU.ACTION.CATEGORIZE && !backTo) {
            if (report === null || report === void 0 ? void 0 : report.reportID) {
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, report.reportID));
            }
            return;
        }
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('common.category')} onBackButtonPress={navigateBack} shouldShowWrapper shouldShowNotFoundPage={shouldShowNotFoundPage} shouldShowOfflineIndicator={policyCategories !== undefined} testID={IOURequestStepCategory.displayName} shouldEnableKeyboardAvoidingView={false}>
            {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.spinner}/>)}
            {shouldShowOfflineView && <FullPageOfflineBlockingView_1.default>{null}</FullPageOfflineBlockingView_1.default>}
            {shouldShowEmptyState && (<react_native_1.View style={[styles.flex1]}>
                    <WorkspaceEmptyStateSection_1.default shouldStyleAsCard={false} icon={Illustrations.EmptyStateExpenses} title={translate('workspace.categories.emptyCategories.title')} subtitle={translate('workspace.categories.emptyCategories.subtitle')} containerStyle={[styles.flex1, styles.justifyContentCenter]}/>
                    {(0, PolicyUtils_1.isPolicyAdmin)(policy) && (<FixedFooter_1.default style={[styles.mtAuto, styles.pt5]}>
                            <Button_1.default large success style={[styles.w100]} onPress={function () {
                    if (!(policy === null || policy === void 0 ? void 0 : policy.id) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                        return;
                    }
                    if (!policy.areCategoriesEnabled) {
                        (0, Category_1.enablePolicyCategories)(policy.id, true, policyTagLists, allTransactionViolations, false);
                    }
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CATEGORIES_ROOT.getRoute(policy.id, ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, report.reportID, backTo, reportActionID)));
                    });
                }} text={translate('workspace.categories.editCategories')} pressOnEnter/>
                        </FixedFooter_1.default>)}
                </react_native_1.View>)}
            {!shouldShowEmptyState && !isLoading && !shouldShowOfflineView && (<>
                    <Text_1.default style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text_1.default>
                    <CategoryPicker_1.default selectedCategory={categoryForDisplay} policyID={(_f = report === null || report === void 0 ? void 0 : report.policyID) !== null && _f !== void 0 ? _f : policy === null || policy === void 0 ? void 0 : policy.id} onSubmit={updateCategory}/>
                </>)}
        </StepScreenWrapper_1.default>);
}
IOURequestStepCategory.displayName = 'IOURequestStepCategory';
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepCategoryWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepCategory);
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepCategoryWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepCategoryWithFullTransactionOrNotFound);
exports.default = IOURequestStepCategoryWithWritableReportOrNotFound;
