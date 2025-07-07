"use strict";
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
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var getNeededDocumentsStatusForBeneficialOwner_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner");
var getValuesForBeneficialOwner_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, PREFIX = _a.PREFIX, COUNTRY = _a.COUNTRY;
function Confirmation(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing, ownerBeingModifiedID = _a.ownerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var values = (0, react_1.useMemo)(function () { return (0, getValuesForBeneficialOwner_1.default)(ownerBeingModifiedID, reimbursementAccountDraft); }, [ownerBeingModifiedID, reimbursementAccountDraft]);
    var beneficialOwnerCountryInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(COUNTRY);
    var beneficialOwnerCountry = String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialOwnerCountryInputID]) !== null && _b !== void 0 ? _b : '');
    var policyID = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var currency = (_d = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _d !== void 0 ? _d : '';
    var countryStepCountryValue = (_e = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _e !== void 0 ? _e : '';
    var isDocumentNeededStatus = (0, getNeededDocumentsStatusForBeneficialOwner_1.default)(currency, countryStepCountryValue, beneficialOwnerCountry);
    var summaryItems = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        {
            title: "".concat(values.firstName, " ").concat(values.lastName),
            description: translate('ownershipInfoStep.legalName'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(0);
            },
        },
        {
            title: values.ownershipPercentage,
            description: translate('ownershipInfoStep.ownershipPercentage'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(1);
            },
        },
        {
            title: values.dob,
            description: translate('common.dob'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(2);
            },
        }
    ], (beneficialOwnerCountry === CONST_1.default.COUNTRY.US
        ? [
            {
                title: values.ssnLast4,
                description: translate('ownershipInfoStep.last4'),
                shouldShowRightIcon: true,
                onPress: function () {
                    onMove(4);
                },
            },
        ]
        : []), true), [
        {
            title: "".concat(values.street, ", ").concat(values.city, ", ").concat(values.state, " ").concat(values.zipCode),
            description: translate('ownershipInfoStep.address'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(3);
            },
        }
    ], false), (isDocumentNeededStatus.isProofOfOwnershipNeeded
        ? [
            {
                title: values.proofOfOwnership.map(function (file) { return file.name; }).join(', '),
                description: translate('ownershipInfoStep.proofOfBeneficialOwner'),
                shouldShowRightIcon: true,
                onPress: function () {
                    onMove(5);
                },
            },
        ]
        : []), true), (isDocumentNeededStatus.isCopyOfIDNeeded
        ? [
            {
                title: values.copyOfID.map(function (file) { return file.name; }).join(', '),
                description: translate('ownershipInfoStep.copyOfID'),
                shouldShowRightIcon: true,
                onPress: function () {
                    onMove(5);
                },
            },
        ]
        : []), true), (isDocumentNeededStatus.isProofOfAddressNeeded
        ? [
            {
                title: values.addressProof.map(function (file) { return file.name; }).join(', '),
                description: translate('ownershipInfoStep.proofOfAddress'),
                shouldShowRightIcon: true,
                onPress: function () {
                    onMove(5);
                },
            },
        ]
        : []), true), (isDocumentNeededStatus.isCodiceFiscaleNeeded
        ? [
            {
                title: values.codiceFiscale.map(function (file) { return file.name; }).join(', '),
                description: translate('ownershipInfoStep.codiceFiscale'),
                shouldShowRightIcon: true,
                onPress: function () {
                    onMove(5);
                },
            },
        ]
        : []), true); }, [
        beneficialOwnerCountry,
        isDocumentNeededStatus.isCodiceFiscaleNeeded,
        isDocumentNeededStatus.isCopyOfIDNeeded,
        isDocumentNeededStatus.isProofOfAddressNeeded,
        isDocumentNeededStatus.isProofOfOwnershipNeeded,
        onMove,
        translate,
        values.addressProof,
        values.city,
        values.codiceFiscale,
        values.copyOfID,
        values.dob,
        values.firstName,
        values.lastName,
        values.ownershipPercentage,
        values.proofOfOwnership,
        values.ssnLast4,
        values.state,
        values.street,
        values.zipCode,
    ]);
    return (<ConfirmationStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} pageTitle={translate('ownershipInfoStep.letsDoubleCheck')} summaryItems={summaryItems} showOnfidoLinks={false}/>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
