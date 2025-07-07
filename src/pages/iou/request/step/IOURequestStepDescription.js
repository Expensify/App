"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var variables_1 = require("@styles/variables");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MoneyRequestDescriptionForm_1 = require("@src/types/form/MoneyRequestDescriptionForm");
var DiscardChangesConfirmation_1 = require("./DiscardChangesConfirmation");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepDescription(_a) {
    var _b, _c;
    var _d = _a.route.params, action = _d.action, iouType = _d.iouType, reportID = _d.reportID, backTo = _d.backTo, reportActionID = _d.reportActionID, transactionID = _d.transactionID, transaction = _a.transaction, report = _a.report;
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var reportActionsReportID = (0, react_1.useMemo)(function () {
        var actionsReportID;
        if (action === CONST_1.default.IOU.ACTION.EDIT) {
            actionsReportID = iouType === CONST_1.default.IOU.TYPE.SPLIT ? report === null || report === void 0 ? void 0 : report.reportID : report === null || report === void 0 ? void 0 : report.parentReportID;
        }
        return actionsReportID;
    }, [action, iouType, report === null || report === void 0 ? void 0 : report.reportID, report === null || report === void 0 ? void 0 : report.parentReportID]);
    var reportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportActionsReportID), {
        canEvict: false,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        selector: function (reportActions) { return reportActions === null || reportActions === void 0 ? void 0 : reportActions[(report === null || report === void 0 ? void 0 : report.parentReportActionID) || reportActionID]; },
        canBeMissing: true,
    })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)(true).inputCallbackRef;
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    var isEditingSplit = (iouType === CONST_1.default.IOU.TYPE.SPLIT || iouType === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    var isTransactionDraft = (0, IOUUtils_1.shouldUseTransactionDraft)(action, iouType);
    var currentDescriptionInMarkdown = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!isTransactionDraft || iouType === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE) {
            return Parser_1.default.htmlToMarkdown(isEditingSplit && !(0, isEmpty_1.default)(splitDraftTransaction) ? ((_b = (_a = splitDraftTransaction === null || splitDraftTransaction === void 0 ? void 0 : splitDraftTransaction.comment) === null || _a === void 0 ? void 0 : _a.comment) !== null && _b !== void 0 ? _b : '') : ((_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.comment) !== null && _d !== void 0 ? _d : ''));
        }
        return isEditingSplit && !(0, isEmpty_1.default)(splitDraftTransaction) ? ((_f = (_e = splitDraftTransaction === null || splitDraftTransaction === void 0 ? void 0 : splitDraftTransaction.comment) === null || _e === void 0 ? void 0 : _e.comment) !== null && _f !== void 0 ? _f : '') : ((_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _g === void 0 ? void 0 : _g.comment) !== null && _h !== void 0 ? _h : '');
    }, [isTransactionDraft, iouType, isEditingSplit, splitDraftTransaction, (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.comment]);
    var descriptionRef = (0, react_1.useRef)(currentDescriptionInMarkdown);
    var isSavedRef = (0, react_1.useRef)(false);
    /**
     * @returns - An object containing the errors for each inputID
     */
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (values.moneyRequestComment.length > CONST_1.default.DESCRIPTION_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'moneyRequestComment', translate('common.error.characterLimitExceedCounter', { length: values.moneyRequestComment.length, limit: CONST_1.default.DESCRIPTION_LIMIT }));
        }
        return errors;
    }, [translate]);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var updateDescriptionRef = function (value) {
        descriptionRef.current = value;
    };
    var updateComment = function (value) {
        if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
            return;
        }
        isSavedRef.current = true;
        var newComment = value.moneyRequestComment.trim();
        // Only update comment if it has changed
        if (newComment === currentDescriptionInMarkdown) {
            navigateBack();
            return;
        }
        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplit) {
            (0, IOU_1.setDraftSplitTransaction)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, { comment: newComment });
            navigateBack();
            return;
        }
        (0, IOU_1.setMoneyRequestDescription)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, newComment, isTransactionDraft);
        if (action === CONST_1.default.IOU.ACTION.EDIT) {
            (0, IOU_1.updateMoneyRequestDescription)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, reportID, newComment, policy, policyTags, policyCategories);
        }
        navigateBack();
    };
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
    var isReportInGroupPolicy = !!(report === null || report === void 0 ? void 0 : report.policyID) && report.policyID !== CONST_1.default.POLICY.ID_FAKE && ((_c = (0, PolicyUtils_1.getPersonalPolicy)()) === null || _c === void 0 ? void 0 : _c.id) !== report.policyID;
    var getDescriptionHint = function () {
        var _a, _b;
        return (transaction === null || transaction === void 0 ? void 0 : transaction.category) && policyCategories ? ((_b = (_a = policyCategories[transaction === null || transaction === void 0 ? void 0 : transaction.category]) === null || _a === void 0 ? void 0 : _a.commentHint) !== null && _b !== void 0 ? _b : '') : '';
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('common.description')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepDescription.displayName} shouldShowNotFoundPage={shouldShowNotFoundPage}>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.MONEY_REQUEST_DESCRIPTION_FORM} onSubmit={updateComment} validate={validate} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                <react_native_1.View style={styles.mb4}>
                    <InputWrapper_1.default valueType="string" InputComponent={TextInput_1.default} inputID={MoneyRequestDescriptionForm_1.default.MONEY_REQUEST_COMMENT} name={MoneyRequestDescriptionForm_1.default.MONEY_REQUEST_COMMENT} defaultValue={currentDescriptionInMarkdown} onValueChange={updateDescriptionRef} label={translate('moneyRequestConfirmationList.whatsItFor')} accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')} role={CONST_1.default.ROLE.PRESENTATION} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} shouldSubmitForm type="markdown" excludedMarkdownStyles={!isReportInGroupPolicy ? ['mentionReport'] : []} ref={inputCallbackRef} hint={getDescriptionHint()}/>
                </react_native_1.View>
            </FormProvider_1.default>
            <DiscardChangesConfirmation_1.default getHasUnsavedChanges={function () {
            if (isSavedRef.current) {
                return false;
            }
            return descriptionRef.current !== currentDescriptionInMarkdown;
        }}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepDescription.displayName = 'IOURequestStepDescription';
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDescriptionWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepDescription);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDescriptionWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepDescriptionWithFullTransactionOrNotFound);
exports.default = IOURequestStepDescriptionWithWritableReportOrNotFound;
