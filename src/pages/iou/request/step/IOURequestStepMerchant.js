"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MoneyRequestMerchantForm_1 = require("@src/types/form/MoneyRequestMerchantForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var DiscardChangesConfirmation_1 = require("./DiscardChangesConfirmation");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepMerchant(_a) {
    var _b, _c;
    var _d = _a.route.params, transactionID = _d.transactionID, reportID = _d.reportID, backTo = _d.backTo, action = _d.action, iouType = _d.iouType, transaction = _a.transaction, report = _a.report;
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var splitDraftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    var isEditingSplitBill = iouType === CONST_1.default.IOU.TYPE.SPLIT && isEditing;
    var merchant = (_b = (0, ReportUtils_1.getTransactionDetails)(isEditingSplitBill && !(0, EmptyObject_1.isEmptyObject)(splitDraftTransaction) ? splitDraftTransaction : transaction)) === null || _b === void 0 ? void 0 : _b.merchant;
    var isEmptyMerchant = merchant === '' || merchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    var initialMerchant = isEmptyMerchant ? '' : merchant;
    var merchantRef = (0, react_1.useRef)(initialMerchant);
    var isSavedRef = (0, react_1.useRef)(false);
    var isMerchantRequired = (0, ReportUtils_1.isPolicyExpenseChat)(report) || (0, ReportUtils_1.isExpenseRequest)(report) || ((_c = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _c === void 0 ? void 0 : _c.some(function (participant) { return !!participant.isPolicyExpenseChat; }));
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var validate = (0, react_1.useCallback)(function (value) {
        var errors = {};
        var _a = (0, ValidationUtils_1.isValidInputLength)(value.moneyRequestMerchant, CONST_1.default.MERCHANT_NAME_MAX_BYTES), isValid = _a.isValid, byteLength = _a.byteLength;
        if (isMerchantRequired && !value.moneyRequestMerchant) {
            errors.moneyRequestMerchant = translate('common.error.fieldRequired');
        }
        else if (isMerchantRequired && value.moneyRequestMerchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
            errors.moneyRequestMerchant = translate('iou.error.invalidMerchant');
        }
        else if (!isValid) {
            errors.moneyRequestMerchant = translate('common.error.characterLimitExceedCounter', {
                length: byteLength,
                limit: CONST_1.default.MERCHANT_NAME_MAX_BYTES,
            });
        }
        return errors;
    }, [isMerchantRequired, translate]);
    var updateMerchantRef = function (value) {
        merchantRef.current = value;
    };
    var updateMerchant = function (value) {
        var _a;
        isSavedRef.current = true;
        var newMerchant = (_a = value.moneyRequestMerchant) === null || _a === void 0 ? void 0 : _a.trim();
        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            (0, IOU_1.setDraftSplitTransaction)(transactionID, { merchant: newMerchant });
            navigateBack();
            return;
        }
        // In case the merchant hasn't been changed, do not make the API request.
        // In case the merchant has been set to empty string while current merchant is partial, do nothing too.
        if (newMerchant === merchant || (newMerchant === '' && merchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)) {
            navigateBack();
            return;
        }
        // When creating/editing an expense, newMerchant can be blank so we fall back on PARTIAL_TRANSACTION_MERCHANT
        (0, IOU_1.setMoneyRequestMerchant)(transactionID, newMerchant || CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, !isEditing);
        if (isEditing) {
            (0, IOU_1.updateMoneyRequestMerchant)(transactionID, reportID, newMerchant || CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, policy, policyTags, policyCategories);
        }
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('common.merchant')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepMerchant.displayName}>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.MONEY_REQUEST_MERCHANT_FORM} onSubmit={updateMerchant} validate={validate} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert shouldUseStrictHtmlTagValidation>
                <react_native_1.View style={styles.mb4}>
                    <InputWrapper_1.default valueType="string" InputComponent={TextInput_1.default} inputID={MoneyRequestMerchantForm_1.default.MONEY_REQUEST_MERCHANT} name={MoneyRequestMerchantForm_1.default.MONEY_REQUEST_MERCHANT} defaultValue={initialMerchant} onValueChange={updateMerchantRef} label={translate('common.merchant')} accessibilityLabel={translate('common.merchant')} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                </react_native_1.View>
            </FormProvider_1.default>
            <DiscardChangesConfirmation_1.default getHasUnsavedChanges={function () {
            if (isSavedRef.current) {
                return false;
            }
            return merchantRef.current !== initialMerchant;
        }}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepMerchant.displayName = 'IOURequestStepMerchant';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepMerchant));
