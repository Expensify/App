"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var ErrorUtils = require("@libs/ErrorUtils");
var getSubstepValues_1 = require("@pages/EnablePayments/utils/getSubstepValues");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var PERSONAL_INFO_STEP_KEYS = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
var PERSONAL_INFO_STEP_INDEXES = CONST_1.default.WALLET.SUBSTEP_INDEXES.PERSONAL_INFO;
function ConfirmationStep(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var walletAdditionalDetailsDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT)[0];
    var isLoading = (_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.isLoading) !== null && _b !== void 0 ? _b : false;
    var error = ErrorUtils.getLatestErrorMessage(walletAdditionalDetails !== null && walletAdditionalDetails !== void 0 ? walletAdditionalDetails : {});
    var values = (0, react_1.useMemo)(function () { return (0, getSubstepValues_1.default)(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails); }, [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    var shouldAskForFullSSN = (walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.errorCode) === CONST_1.default.WALLET.ERROR.SSN;
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
            description: translate('personalInfoStep.address'),
            title: "".concat(values[PERSONAL_INFO_STEP_KEYS.STREET], ", ").concat(values[PERSONAL_INFO_STEP_KEYS.CITY], ", ").concat(values[PERSONAL_INFO_STEP_KEYS.STATE], " ").concat(values[PERSONAL_INFO_STEP_KEYS.ZIP_CODE]),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.ADDRESS);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: values[PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER],
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.PHONE_NUMBER);
            },
        },
        {
            description: translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN'),
            title: values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4],
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_INFO_STEP_INDEXES.SSN);
            },
        },
    ];
    return (<ConfirmationStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} pageTitle={translate('personalInfoStep.letsDoubleCheck')} summaryItems={summaryItems} showOnfidoLinks onfidoLinksTitle={"".concat(translate('personalInfoStep.byAddingThisBankAccount'), " ")} isLoading={isLoading} error={error}/>);
}
ConfirmationStep.displayName = 'ConfirmationStep';
exports.default = ConfirmationStep;
