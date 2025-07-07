"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var getNeededDocumentsStatusForSignerInfo_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForSignerInfo");
var getValuesForSignerInfo_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getValuesForSignerInfo");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var OWNS_MORE_THAN_25_PERCENT = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.OWNS_MORE_THAN_25_PERCENT;
function Confirmation(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var isUserOwner = (_e = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.corpay) === null || _c === void 0 ? void 0 : _c[OWNS_MORE_THAN_25_PERCENT]) !== null && _d !== void 0 ? _d : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[OWNS_MORE_THAN_25_PERCENT]) !== null && _e !== void 0 ? _e : false;
    var values = (0, react_1.useMemo)(function () { return (0, getValuesForSignerInfo_1.default)(reimbursementAccountDraft); }, [reimbursementAccountDraft]);
    var policyID = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var currency = (_g = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _g !== void 0 ? _g : '';
    var countryStepCountryValue = (_j = (_h = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _h === void 0 ? void 0 : _h[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _j !== void 0 ? _j : '';
    var isDocumentNeededStatus = (0, getNeededDocumentsStatusForSignerInfo_1.default)(currency, countryStepCountryValue);
    var summaryItems = [
        {
            title: values.jobTitle,
            description: translate('signerInfoStep.jobTitle'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(1);
            },
        },
    ];
    if (isDocumentNeededStatus.isCopyOfIDNeeded && values.copyOfId.length > 0) {
        summaryItems.push({
            title: values.copyOfId.map(function (id) { return id.name; }).join(', '),
            description: translate('signerInfoStep.id'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(4);
            },
        });
    }
    if (isDocumentNeededStatus.isAddressProofNeeded && values.addressProof.length > 0) {
        summaryItems.push({
            title: values.addressProof.map(function (proof) { return proof.name; }).join(', '),
            description: translate('signerInfoStep.proofOf'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(4);
            },
        });
    }
    if (isDocumentNeededStatus.isProofOfDirectorsNeeded && values.proofOfDirectors.length > 0) {
        summaryItems.push({
            title: values.proofOfDirectors.map(function (proof) { return proof.name; }).join(', '),
            description: translate('signerInfoStep.proofOfDirectors'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(4);
            },
        });
    }
    if (isDocumentNeededStatus.isCodiceFiscaleNeeded && values.codiceFiscale.length > 0) {
        summaryItems.push({
            title: values.codiceFiscale.map(function (fiscale) { return fiscale.name; }).join(', '),
            description: translate('signerInfoStep.codiceFiscale'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(4);
            },
        });
    }
    if (!isUserOwner) {
        summaryItems.unshift({
            title: values.fullName,
            description: translate('signerInfoStep.legalName'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(0);
            },
        });
        summaryItems.splice(2, 0, {
            title: values.dateOfBirth,
            description: translate('common.dob'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(2);
            },
        });
        summaryItems.splice(3, 0, {
            title: "".concat(values.street, ", ").concat(values.city, ", ").concat(values.state, ", ").concat(values.zipCode),
            description: translate('ownershipInfoStep.address'),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(3);
            },
        });
    }
    return (<ConfirmationStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} pageTitle={translate('signerInfoStep.letsDoubleCheck')} summaryItems={summaryItems} showOnfidoLinks={false} isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingDirectorInformation} error={(_l = Object.values((_k = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _k !== void 0 ? _k : []).at(0)) !== null && _l !== void 0 ? _l : ''}/>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
