"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var PERSONAL_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP;
var PERSONAL_INFO_STEP_INDEXES = CONST_1.default.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.PERSONAL_INFO;
function Confirmation(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var isLoading = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isLoading) !== null && _b !== void 0 ? _b : false;
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var error = (0, ErrorUtils_1.getLatestErrorMessage)(reimbursementAccount !== null && reimbursementAccount !== void 0 ? reimbursementAccount : {});
    var summaryItems = [
        {
            description: translate('personalInfoStep.legalName'),
            title: "".concat(values[PERSONAL_INFO_STEP_KEYS.FIRST_NAME], " ").concat(values[PERSONAL_INFO_STEP_KEYS.LAST_NAME]),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: values[PERSONAL_INFO_STEP_KEYS.DOB],
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.DATE_OF_BIRTH);
            },
        },
        {
            description: translate('personalInfoStep.last4SSN'),
            title: values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4],
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.SSN);
            },
        },
        {
            description: translate('personalInfoStep.address'),
            title: "".concat(values[PERSONAL_INFO_STEP_KEYS.STREET], ", ").concat(values[PERSONAL_INFO_STEP_KEYS.CITY], ", ").concat(values[PERSONAL_INFO_STEP_KEYS.STATE], " ").concat(values[PERSONAL_INFO_STEP_KEYS.ZIP_CODE]),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.ADDRESS);
            },
        },
    ];
    return (<ConfirmationStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} pageTitle={translate('personalInfoStep.letsDoubleCheck')} summaryItems={summaryItems} showOnfidoLinks onfidoLinksTitle={"".concat(translate('personalInfoStep.byAddingThisBankAccount'), " ")} isLoading={isLoading} error={error}/>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
