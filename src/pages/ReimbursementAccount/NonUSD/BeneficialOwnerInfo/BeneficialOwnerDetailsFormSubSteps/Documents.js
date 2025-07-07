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
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var UploadFile_1 = require("@components/UploadFile");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var getNeededDocumentsStatusForBeneficialOwner_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, PROOF_OF_OWNERSHIP = _a.PROOF_OF_OWNERSHIP, ADDRESS_PROOF = _a.ADDRESS_PROOF, COPY_OF_ID = _a.COPY_OF_ID, CODICE_FISCALE = _a.CODICE_FISCALE, COUNTRY = _a.COUNTRY, PREFIX = _a.PREFIX;
function Documents(_a) {
    var _b;
    var _c, _d, _e, _f, _g, _h, _j, _k;
    var onNext = _a.onNext, isEditing = _a.isEditing, ownerBeingModifiedID = _a.ownerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var countryStepCountryValue = (_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _c !== void 0 ? _c : '';
    var policyID = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_e = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _e !== void 0 ? _e : '';
    var proofOfOwnershipInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(PROOF_OF_OWNERSHIP);
    var copyOfIDInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(COPY_OF_ID);
    var addressProofInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(ADDRESS_PROOF);
    var codiceFiscaleInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(CODICE_FISCALE);
    var beneficialOwnerCountryInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(COUNTRY);
    var beneficialOwnerCountry = String((_f = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialOwnerCountryInputID]) !== null && _f !== void 0 ? _f : '');
    var isDocumentNeededStatus = (0, getNeededDocumentsStatusForBeneficialOwner_1.default)(currency, countryStepCountryValue, beneficialOwnerCountry);
    var defaultValues = (_b = {},
        _b[proofOfOwnershipInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[proofOfOwnershipInputID]) ? ((_g = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[proofOfOwnershipInputID]) !== null && _g !== void 0 ? _g : []) : [],
        _b[copyOfIDInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[copyOfIDInputID]) ? ((_h = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[copyOfIDInputID]) !== null && _h !== void 0 ? _h : []) : [],
        _b[addressProofInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[addressProofInputID]) ? ((_j = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[addressProofInputID]) !== null && _j !== void 0 ? _j : []) : [],
        _b[codiceFiscaleInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[codiceFiscaleInputID]) ? ((_k = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[codiceFiscaleInputID]) !== null && _k !== void 0 ? _k : []) : [],
        _b);
    var _l = (0, react_1.useState)(defaultValues[proofOfOwnershipInputID]), uploadedProofOfOwnership = _l[0], setUploadedProofOfOwnership = _l[1];
    var _m = (0, react_1.useState)(defaultValues[copyOfIDInputID]), uploadedCopyOfID = _m[0], setUploadedCopyOfID = _m[1];
    var _o = (0, react_1.useState)(defaultValues[addressProofInputID]), uploadedAddressProof = _o[0], setUploadedAddressProof = _o[1];
    var _p = (0, react_1.useState)(defaultValues[codiceFiscaleInputID]), uploadedCodiceFiscale = _p[0], setUploadedCodiceFiscale = _p[1];
    var STEP_FIELDS = (0, react_1.useMemo)(function () { return [proofOfOwnershipInputID, addressProofInputID, copyOfIDInputID, codiceFiscaleInputID]; }, [addressProofInputID, codiceFiscaleInputID, copyOfIDInputID, proofOfOwnershipInputID]);
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
    }, [STEP_FIELDS]);
    var handleSelectFile = function (files, uploadedFiles, inputID, setFiles) {
        var _a;
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[inputID] = __spreadArray(__spreadArray([], uploadedFiles, true), files, true), _a));
        setFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), files, true); });
    };
    var handleRemoveFile = function (fileName, uploadedFiles, inputID, setFiles) {
        var _a;
        var newUploadedIDs = uploadedFiles.filter(function (file) { return file.name !== fileName; });
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[inputID] = newUploadedIDs, _a));
        setFiles(newUploadedIDs);
    };
    var setUploadError = function (error, inputID) {
        var _a;
        if (!error) {
            (0, FormActions_1.clearErrorFields)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }
        (0, FormActions_1.setErrorFields)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[inputID] = { onUpload: error }, _a));
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var testForShouldHideFixErrorsAlert = [
        isDocumentNeededStatus.isProofOfOwnershipNeeded,
        isDocumentNeededStatus.isCopyOfIDNeeded,
        isDocumentNeededStatus.isProofOfAddressNeeded,
        isDocumentNeededStatus.isCodiceFiscaleNeeded,
    ].filter(Boolean).length <= 1;
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={validate} onSubmit={handleSubmit} style={[styles.mh5, styles.flexGrow1]} submitButtonStyles={[styles.mb0]} shouldHideFixErrorsAlert={testForShouldHideFixErrorsAlert}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('ownershipInfoStep.uploadDocuments')}</Text_1.default>
            <Text_1.default style={[styles.textSupporting, styles.mb5]}>{translate('ownershipInfoStep.pleaseUpload')}</Text_1.default>
            <Text_1.default style={[styles.textSupporting, styles.mb6]}>{translate('ownershipInfoStep.acceptedFiles')}</Text_1.default>
            {isDocumentNeededStatus.isProofOfOwnershipNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.proofOfBeneficialOwner')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('ownershipInfoStep.chooseFile')} uploadedFiles={uploadedProofOfOwnership} onUpload={function (files) {
                handleSelectFile(files, uploadedProofOfOwnership, proofOfOwnershipInputID, setUploadedProofOfOwnership);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedProofOfOwnership, proofOfOwnershipInputID, setUploadedProofOfOwnership);
            }} setError={function (error) {
                setUploadError(error, proofOfOwnershipInputID);
            }} fileLimit={CONST_1.default.NON_USD_BANK_ACCOUNT.FILE_LIMIT} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={defaultValues[proofOfOwnershipInputID]} inputID={proofOfOwnershipInputID}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfBeneficialOwnerDescription')}</Text_1.default>
                    {(isDocumentNeededStatus.isCopyOfIDNeeded || isDocumentNeededStatus.isProofOfAddressNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded) && (<react_native_1.View style={[styles.sectionDividerLine, styles.mv6]}/>)}
                </react_native_1.View>)}

            {isDocumentNeededStatus.isCopyOfIDNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.copyOfID')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('ownershipInfoStep.chooseFile')} uploadedFiles={uploadedCopyOfID} onUpload={function (files) {
                handleSelectFile(files, uploadedCopyOfID, copyOfIDInputID, setUploadedCopyOfID);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedCopyOfID, copyOfIDInputID, setUploadedCopyOfID);
            }} setError={function (error) {
                setUploadError(error, copyOfIDInputID);
            }} fileLimit={CONST_1.default.NON_USD_BANK_ACCOUNT.FILE_LIMIT} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={defaultValues[copyOfIDInputID]} inputID={copyOfIDInputID}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.copyOfIDDescription')}</Text_1.default>
                    {(isDocumentNeededStatus.isProofOfAddressNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded) && <react_native_1.View style={[styles.sectionDividerLine, styles.mv6]}/>}
                </react_native_1.View>)}

            {isDocumentNeededStatus.isProofOfAddressNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.proofOfAddress')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('ownershipInfoStep.chooseFile')} uploadedFiles={uploadedAddressProof} onUpload={function (files) {
                handleSelectFile(files, uploadedAddressProof, addressProofInputID, setUploadedAddressProof);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedAddressProof, addressProofInputID, setUploadedAddressProof);
            }} setError={function (error) {
                setUploadError(error, addressProofInputID);
            }} fileLimit={CONST_1.default.NON_USD_BANK_ACCOUNT.FILE_LIMIT} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={defaultValues[addressProofInputID]} inputID={addressProofInputID}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfAddressDescription')}</Text_1.default>
                    {isDocumentNeededStatus.isCodiceFiscaleNeeded && <react_native_1.View style={[styles.sectionDividerLine, styles.mv6]}/>}
                </react_native_1.View>)}

            {isDocumentNeededStatus.isCodiceFiscaleNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.codiceFiscale')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('ownershipInfoStep.chooseFile')} uploadedFiles={uploadedCodiceFiscale} onUpload={function (files) {
                handleSelectFile(files, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
            }} setError={function (error) {
                setUploadError(error, codiceFiscaleInputID);
            }} fileLimit={CONST_1.default.NON_USD_BANK_ACCOUNT.FILE_LIMIT} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={defaultValues[codiceFiscaleInputID]} inputID={codiceFiscaleInputID}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('ownershipInfoStep.codiceFiscaleDescription')}</Text_1.default>
                </react_native_1.View>)}
        </FormProvider_1.default>);
}
Documents.displayName = 'Documents';
exports.default = Documents;
