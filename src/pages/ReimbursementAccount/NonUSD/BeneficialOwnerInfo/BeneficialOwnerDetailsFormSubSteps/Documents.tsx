import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getNeededDocumentsStatusForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner';
import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {FileObject} from '@src/types/utils/Attachment';
import SafeString from '@src/utils/SafeString';

type DocumentsProps = SubStepProps & {ownerBeingModifiedID: string};

const {PROOF_OF_OWNERSHIP, ADDRESS_PROOF, COPY_OF_ID, CODICE_FISCALE, NATIONALITY, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Documents({onNext, isEditing, ownerBeingModifiedID}: DocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';
    const proofOfOwnershipInputID = `${PREFIX}_${ownerBeingModifiedID}_${PROOF_OF_OWNERSHIP}` as const;
    const copyOfIDInputID = `${PREFIX}_${ownerBeingModifiedID}_${COPY_OF_ID}` as const;
    const addressProofInputID = `${PREFIX}_${ownerBeingModifiedID}_${ADDRESS_PROOF}` as const;
    const codiceFiscaleInputID = `${PREFIX}_${ownerBeingModifiedID}_${CODICE_FISCALE}` as const;
    const beneficialOwnerNationalityInputID = `${PREFIX}_${ownerBeingModifiedID}_${NATIONALITY}` as const;
    const beneficialOwnerNationality = SafeString(reimbursementAccountDraft?.[beneficialOwnerNationalityInputID]);
    const isDocumentNeededStatus = getNeededDocumentsStatusForBeneficialOwner(currency, countryStepCountryValue, beneficialOwnerNationality);
    const defaultValues: Record<string, FileObject[]> = {
        [proofOfOwnershipInputID]: Array.isArray(reimbursementAccountDraft?.[proofOfOwnershipInputID]) ? (reimbursementAccountDraft?.[proofOfOwnershipInputID] ?? []) : [],
        [copyOfIDInputID]: Array.isArray(reimbursementAccountDraft?.[copyOfIDInputID]) ? (reimbursementAccountDraft?.[copyOfIDInputID] ?? []) : [],
        [addressProofInputID]: Array.isArray(reimbursementAccountDraft?.[addressProofInputID]) ? (reimbursementAccountDraft?.[addressProofInputID] ?? []) : [],
        [codiceFiscaleInputID]: Array.isArray(reimbursementAccountDraft?.[codiceFiscaleInputID]) ? (reimbursementAccountDraft?.[codiceFiscaleInputID] ?? []) : [],
    };

    const [uploadedProofOfOwnership, setUploadedProofOfOwnership] = useState<FileObject[]>(defaultValues[proofOfOwnershipInputID]);
    const [uploadedCopyOfID, setUploadedCopyOfID] = useState<FileObject[]>(defaultValues[copyOfIDInputID]);
    const [uploadedAddressProof, setUploadedAddressProof] = useState<FileObject[]>(defaultValues[addressProofInputID]);
    const [uploadedCodiceFiscale, setUploadedCodiceFiscale] = useState<FileObject[]>(defaultValues[codiceFiscaleInputID]);

    const STEP_FIELDS = useMemo(
        () => [proofOfOwnershipInputID, addressProofInputID, copyOfIDInputID, codiceFiscaleInputID],
        [addressProofInputID, codiceFiscaleInputID, copyOfIDInputID, proofOfOwnershipInputID],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> =>
            getFieldRequiredErrors(values, STEP_FIELDS),
        [STEP_FIELDS],
    );

    const handleSelectFile = (files: FileObject[], uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: [...uploadedFiles, ...files]});
        setFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (fileName: string, uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        const newUploadedIDs = uploadedFiles.filter((file) => file.name !== fileName);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: newUploadedIDs});
        setFiles(newUploadedIDs);
    };

    const setUploadError = (error: string, inputID: string) => {
        if (!error) {
            clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }

        setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: {onUpload: error}});
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const testForShouldHideFixErrorsAlert =
        [
            isDocumentNeededStatus.isProofOfOwnershipNeeded,
            isDocumentNeededStatus.isCopyOfIDNeeded,
            isDocumentNeededStatus.isProofOfAddressNeeded,
            isDocumentNeededStatus.isCodiceFiscaleNeeded,
        ].filter(Boolean).length <= 1;

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
            shouldHideFixErrorsAlert={testForShouldHideFixErrorsAlert}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('ownershipInfoStep.uploadDocuments')}</Text>
            <Text style={[styles.textSupporting, styles.mb5]}>{translate('ownershipInfoStep.pleaseUpload')}</Text>
            <Text style={[styles.textSupporting, styles.mb6]}>{translate('ownershipInfoStep.acceptedFiles')}</Text>
            {isDocumentNeededStatus.isProofOfOwnershipNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.proofOfBeneficialOwner')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('ownershipInfoStep.chooseFile')}
                        uploadedFiles={uploadedProofOfOwnership}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedProofOfOwnership, proofOfOwnershipInputID, setUploadedProofOfOwnership);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofOfOwnership, proofOfOwnershipInputID, setUploadedProofOfOwnership);
                        }}
                        setError={(error) => {
                            setUploadError(error, proofOfOwnershipInputID);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={defaultValues[proofOfOwnershipInputID]}
                        inputID={proofOfOwnershipInputID}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfBeneficialOwnerDescription')}</Text>
                    {(isDocumentNeededStatus.isCopyOfIDNeeded || isDocumentNeededStatus.isProofOfAddressNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded) && (
                        <View style={[styles.sectionDividerLine, styles.mv6]} />
                    )}
                </View>
            )}

            {isDocumentNeededStatus.isCopyOfIDNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.copyOfID')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('ownershipInfoStep.chooseFile')}
                        uploadedFiles={uploadedCopyOfID}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedCopyOfID, copyOfIDInputID, setUploadedCopyOfID);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedCopyOfID, copyOfIDInputID, setUploadedCopyOfID);
                        }}
                        setError={(error) => {
                            setUploadError(error, copyOfIDInputID);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={defaultValues[copyOfIDInputID]}
                        inputID={copyOfIDInputID}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.copyOfIDDescription')}</Text>
                    {(isDocumentNeededStatus.isProofOfAddressNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded) && <View style={[styles.sectionDividerLine, styles.mv6]} />}
                </View>
            )}

            {isDocumentNeededStatus.isProofOfAddressNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.proofOfAddress')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('ownershipInfoStep.chooseFile')}
                        uploadedFiles={uploadedAddressProof}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedAddressProof, addressProofInputID, setUploadedAddressProof);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedAddressProof, addressProofInputID, setUploadedAddressProof);
                        }}
                        setError={(error) => {
                            setUploadError(error, addressProofInputID);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={defaultValues[addressProofInputID]}
                        inputID={addressProofInputID}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfAddressDescription')}</Text>
                    {isDocumentNeededStatus.isCodiceFiscaleNeeded && <View style={[styles.sectionDividerLine, styles.mv6]} />}
                </View>
            )}

            {isDocumentNeededStatus.isCodiceFiscaleNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('ownershipInfoStep.codiceFiscale')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('ownershipInfoStep.chooseFile')}
                        uploadedFiles={uploadedCodiceFiscale}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
                        }}
                        setError={(error) => {
                            setUploadError(error, codiceFiscaleInputID);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={defaultValues[codiceFiscaleInputID]}
                        inputID={codiceFiscaleInputID}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('ownershipInfoStep.codiceFiscaleDescription')}</Text>
                </View>
            )}
        </FormProvider>
    );
}

export default Documents;
