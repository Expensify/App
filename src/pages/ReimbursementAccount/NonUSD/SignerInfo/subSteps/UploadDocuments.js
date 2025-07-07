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
var Button_1 = require("@components/Button");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var UploadFile_1 = require("@components/UploadFile");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Environment_1 = require("@libs/Environment/Environment");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var getNeededDocumentsStatusForSignerInfo_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForSignerInfo");
var WhyLink_1 = require("@pages/ReimbursementAccount/NonUSD/WhyLink");
var FormActions_1 = require("@userActions/FormActions");
var Link_1 = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA, ADDRESS_PROOF = _a.ADDRESS_PROOF, PROOF_OF_DIRECTORS = _a.PROOF_OF_DIRECTORS, COPY_OF_ID = _a.COPY_OF_ID, CODICE_FISCALE = _a.CODICE_FISCALE;
var signerInfoKeys = CONST_1.default.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
function UploadDocuments(_a) {
    var _b, _c;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var policyID = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var _r = (0, react_1.useState)(null), environmentUrl = _r[0], setEnvironmentUrl = _r[1];
    var currency = (_e = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _e !== void 0 ? _e : '';
    var countryStepCountryValue = (_g = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _g !== void 0 ? _g : '';
    var isDocumentNeededStatus = (0, getNeededDocumentsStatusForSignerInfo_1.default)(currency, countryStepCountryValue);
    var isPDSandFSGDownloaded = (_l = (_k = (_j = (_h = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _h === void 0 ? void 0 : _h.corpay) === null || _j === void 0 ? void 0 : _j.downloadedPDSandFSG) !== null && _k !== void 0 ? _k : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[signerInfoKeys.DOWNLOADED_PDS_AND_FSG]) !== null && _l !== void 0 ? _l : false;
    var _s = (0, react_1.useState)(false), isPDSandFSGDownloadedTouched = _s[0], setIsPDSandFSGDownloadedTouched = _s[1];
    var copyOfIDInputID = COPY_OF_ID;
    var addressProofInputID = ADDRESS_PROOF;
    var directorsProofInputID = PROOF_OF_DIRECTORS;
    var codiceFiscaleInputID = CODICE_FISCALE;
    var defaultValues = (_b = {},
        _b[copyOfIDInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[copyOfIDInputID]) ? ((_m = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[copyOfIDInputID]) !== null && _m !== void 0 ? _m : []) : [],
        _b[addressProofInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[addressProofInputID]) ? ((_o = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[addressProofInputID]) !== null && _o !== void 0 ? _o : []) : [],
        _b[directorsProofInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[directorsProofInputID]) ? ((_p = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[directorsProofInputID]) !== null && _p !== void 0 ? _p : []) : [],
        _b[codiceFiscaleInputID] = Array.isArray(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[codiceFiscaleInputID]) ? ((_q = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[codiceFiscaleInputID]) !== null && _q !== void 0 ? _q : []) : [],
        _b);
    var _t = (0, react_1.useState)(defaultValues[copyOfIDInputID]), uploadedIDs = _t[0], setUploadedID = _t[1];
    var _u = (0, react_1.useState)(defaultValues[addressProofInputID]), uploadedProofsOfAddress = _u[0], setUploadedProofOfAddress = _u[1];
    var _v = (0, react_1.useState)(defaultValues[directorsProofInputID]), uploadedProofsOfDirectors = _v[0], setUploadedProofsOfDirectors = _v[1];
    var _w = (0, react_1.useState)(defaultValues[codiceFiscaleInputID]), uploadedCodiceFiscale = _w[0], setUploadedCodiceFiscale = _w[1];
    (0, react_1.useEffect)(function () {
        (0, Environment_1.getEnvironmentURL)().then(setEnvironmentUrl);
    }, []);
    var STEP_FIELDS = (0, react_1.useMemo)(function () { return [copyOfIDInputID, addressProofInputID, directorsProofInputID, codiceFiscaleInputID]; }, [copyOfIDInputID, addressProofInputID, directorsProofInputID, codiceFiscaleInputID]);
    var validate = (0, react_1.useCallback)(function (values) {
        setIsPDSandFSGDownloadedTouched(true);
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
    }, [STEP_FIELDS]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var handleSubmitWithDownload = function (values) {
        if (isDocumentNeededStatus.isPRDAndFSGNeeded && !isPDSandFSGDownloaded) {
            return;
        }
        handleSubmit(values);
    };
    var handleRemoveFile = function (fileName, uploadedFiles, inputID, setFiles) {
        var _a;
        var newUploadedIDs = uploadedFiles.filter(function (file) { return file.name !== fileName; });
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[inputID] = newUploadedIDs, _a));
        setFiles(newUploadedIDs);
    };
    var handleSelectFile = function (files, uploadedFiles, inputID, setFiles) {
        var _a;
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[inputID] = __spreadArray(__spreadArray([], uploadedFiles, true), files, true), _a));
        setFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), files, true); });
    };
    var setUploadError = function (error, inputID) {
        var _a;
        if (!error) {
            (0, FormActions_1.clearErrorFields)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }
        (0, FormActions_1.setErrorFields)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[inputID] = { onUpload: error }, _a));
    };
    var handleDownload = function () {
        var _a;
        (0, Link_1.openExternalLink)("".concat(environmentUrl, "/pdfs/PDSAndFSG.pdf"));
        setIsPDSandFSGDownloadedTouched(true);
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[signerInfoKeys.DOWNLOADED_PDS_AND_FSG] = true, _a));
    };
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmitWithDownload} validate={validate} style={[styles.mh5, styles.flexGrow1]} submitButtonStyles={[styles.mb0]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('ownershipInfoStep.uploadDocuments')}</Text_1.default>
            <Text_1.default style={[styles.textSupporting, styles.mb5]}>{translate('signerInfoStep.pleaseUpload')}</Text_1.default>
            <Text_1.default style={[styles.textSupporting, styles.mb6]}>{translate('ownershipInfoStep.acceptedFiles')}</Text_1.default>
            {isDocumentNeededStatus.isCopyOfIDNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.id')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('signerInfoStep.chooseFile')} uploadedFiles={uploadedIDs} onUpload={function (files) {
                handleSelectFile(files, uploadedIDs, copyOfIDInputID, setUploadedID);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedIDs, copyOfIDInputID, setUploadedID);
            }} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={uploadedIDs} inputID={copyOfIDInputID} setError={function (error) {
                setUploadError(error, copyOfIDInputID);
            }} fileLimit={1}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.copyOfIDDescription')}</Text_1.default>
                    {(isDocumentNeededStatus.isAddressProofNeeded ||
                isDocumentNeededStatus.isProofOfDirectorsNeeded ||
                isDocumentNeededStatus.isCodiceFiscaleNeeded ||
                isDocumentNeededStatus.isPRDAndFSGNeeded) && <react_native_1.View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]}/>}
                </react_native_1.View>)}
            {isDocumentNeededStatus.isAddressProofNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.proofOf')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('signerInfoStep.chooseFile')} uploadedFiles={uploadedProofsOfAddress} onUpload={function (files) {
                handleSelectFile(files, uploadedProofsOfAddress, addressProofInputID, setUploadedProofOfAddress);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedProofsOfAddress, addressProofInputID, setUploadedProofOfAddress);
            }} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={uploadedProofsOfAddress} inputID={addressProofInputID} setError={function (error) {
                setUploadError(error, addressProofInputID);
            }} fileLimit={1}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfAddressDescription')}</Text_1.default>
                    {(isDocumentNeededStatus.isProofOfDirectorsNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDAndFSGNeeded) && (<react_native_1.View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]}/>)}
                </react_native_1.View>)}
            {isDocumentNeededStatus.isProofOfDirectorsNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.proofOfDirectors')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('signerInfoStep.chooseFile')} uploadedFiles={uploadedProofsOfDirectors} onUpload={function (files) {
                handleSelectFile(files, uploadedProofsOfDirectors, directorsProofInputID, setUploadedProofsOfDirectors);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedProofsOfDirectors, directorsProofInputID, setUploadedProofsOfDirectors);
            }} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={uploadedProofsOfDirectors} inputID={directorsProofInputID} setError={function (error) {
                setUploadError(error, directorsProofInputID);
            }} fileLimit={1}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.proofOfDirectorsDescription')}</Text_1.default>
                    {(isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDAndFSGNeeded) && <react_native_1.View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]}/>}
                </react_native_1.View>)}
            {isDocumentNeededStatus.isCodiceFiscaleNeeded && (<react_native_1.View>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.codiceFiscale')}</Text_1.default>
                    <InputWrapper_1.default InputComponent={UploadFile_1.default} buttonText={translate('signerInfoStep.chooseFile')} uploadedFiles={uploadedCodiceFiscale} onUpload={function (files) {
                handleSelectFile(files, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
            }} onRemove={function (fileName) {
                handleRemoveFile(fileName, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
            }} acceptedFileTypes={__spreadArray([], CONST_1.default.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES, true)} value={uploadedCodiceFiscale} inputID={codiceFiscaleInputID} setError={function (error) {
                setUploadError(error, codiceFiscaleInputID);
            }} fileLimit={1}/>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.codiceFiscaleDescription')}</Text_1.default>
                    {isDocumentNeededStatus.isPRDAndFSGNeeded && <react_native_1.View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]}/>}
                </react_native_1.View>)}
            {isDocumentNeededStatus.isPRDAndFSGNeeded && (<react_native_1.View style={[styles.alignItemsStart]}>
                    <Text_1.default style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.PDSandFSG')}</Text_1.default>
                    <Button_1.default onPress={handleDownload} text={translate('common.download')}/>
                    {!isPDSandFSGDownloaded && isPDSandFSGDownloadedTouched && (<DotIndicatorMessage_1.default style={[styles.formError, styles.mt3]} type="error" messages={_c = {}, _c[signerInfoKeys.DOWNLOADED_PDS_AND_FSG] = translate('common.error.fieldRequired'), _c}/>)}
                    <Text_1.default style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.PDSandFSGDescription')}</Text_1.default>
                </react_native_1.View>)}
            <WhyLink_1.default containerStyles={[styles.mt6]}/>
        </FormProvider_1.default>);
}
UploadDocuments.displayName = 'UploadDocuments';
exports.default = UploadDocuments;
