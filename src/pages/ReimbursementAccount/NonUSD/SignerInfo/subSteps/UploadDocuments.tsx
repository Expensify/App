import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForSignerInfo';
import WhyLink from '@pages/ReimbursementAccount/NonUSD/WhyLink';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type UploadDocumentsProps = SubStepProps;

const {ADDRESS_PROOF, PROOF_OF_DIRECTORS, COPY_OF_ID, CODICE_FISCALE, PRD_AND_SFG, SIGNER_PREFIX} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
const STEP_FIELDS = [ADDRESS_PROOF, PROOF_OF_DIRECTORS, COPY_OF_ID];

function UploadDocuments({onNext, isEditing}: UploadDocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const currency = policy?.outputCurrency ?? '';
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, countryStepCountryValue);

    const defaultValues = {
        [`${SIGNER_PREFIX}_${COPY_OF_ID}`]: Array.isArray(reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${COPY_OF_ID}`]) ? reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${COPY_OF_ID}`] : [],
        [`${SIGNER_PREFIX}_${ADDRESS_PROOF}`]: Array.isArray(reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${ADDRESS_PROOF}`])
            ? reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${ADDRESS_PROOF}`]
            : [],
        [`${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`]: Array.isArray(reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`])
            ? reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`]
            : [],
        [`${SIGNER_PREFIX}_${CODICE_FISCALE}`]: Array.isArray(reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${CODICE_FISCALE}`])
            ? reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${CODICE_FISCALE}`]
            : [],
        [`${SIGNER_PREFIX}_${PRD_AND_SFG}`]: Array.isArray(reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${PRD_AND_SFG}`])
            ? reimbursementAccountDraft?.[`${SIGNER_PREFIX}_${PRD_AND_SFG}`]
            : [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[`${SIGNER_PREFIX}_${COPY_OF_ID}`]);
    const [uploadedProofsOfAddress, setUploadedProofOfAddress] = useState<FileObject[]>(defaultValues[`${SIGNER_PREFIX}_${ADDRESS_PROOF}`]);
    const [uploadedProofsOfDirectors, setUploadedProofsOfDirectors] = useState<FileObject[]>(defaultValues[`${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`]);
    const [uploadedCodiceFiscale, setUploadedCodiceFiscale] = useState<FileObject[]>(defaultValues[`${SIGNER_PREFIX}_${CODICE_FISCALE}`]);
    const [uploadedPRDandSFG, setUploadedPRDandSFG] = useState<FileObject[]>(defaultValues[`${SIGNER_PREFIX}_${PRD_AND_SFG}`]);

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleRemoveFile = (fileName: string, uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        const newUploadedIDs = uploadedFiles.filter((file) => file.name !== fileName);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: newUploadedIDs});
        setFiles(newUploadedIDs);
    };

    const handleSelectFile = (files: FileObject[], uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: [...uploadedFiles, ...files]});
        setFiles((prev) => [...prev, ...files]);
    };

    // TODO: check if this is necessary
    const setError = (error: string) => {
        // eslint-disable-next-line
        console.info(error);
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('ownershipInfoStep.uploadDocuments')}</Text>
            <Text style={[styles.textSupporting, styles.mb5]}>{translate('signerInfoStep.pleaseUpload')}</Text>
            <Text style={[styles.textSupporting, styles.mb6]}>{translate('ownershipInfoStep.acceptedFiles')}</Text>
            {isDocumentNeededStatus.isCopyOfIDNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.id')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('signerInfoStep.chooseFile')}
                        uploadedFiles={uploadedIDs}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedIDs, `${SIGNER_PREFIX}_${COPY_OF_ID}`, setUploadedID);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedIDs, `${SIGNER_PREFIX}_${COPY_OF_ID}`, setUploadedID);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedIDs}
                        inputID={`${SIGNER_PREFIX}_${COPY_OF_ID}`}
                        setError={setError}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.copyOfIDDescription')}</Text>
                    {(isDocumentNeededStatus.isAddressProofNeeded ||
                        isDocumentNeededStatus.isProofOfDirecorsNeeded ||
                        isDocumentNeededStatus.isCodiceFiscaleNeeded ||
                        isDocumentNeededStatus.isPRDandFSGNeeded) && <View style={[styles.sectionDividerLine, styles.mh0]} />}
                </View>
            )}
            {isDocumentNeededStatus.isAddressProofNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.proofOf')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('signerInfoStep.chooseFile')}
                        uploadedFiles={uploadedProofsOfAddress}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedProofsOfAddress, `${SIGNER_PREFIX}_${ADDRESS_PROOF}`, setUploadedProofOfAddress);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofsOfAddress, `${SIGNER_PREFIX}_${ADDRESS_PROOF}`, setUploadedProofOfAddress);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedProofsOfAddress}
                        inputID={`${SIGNER_PREFIX}_${ADDRESS_PROOF}`}
                        setError={setError}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfAddressDescription')}</Text>
                    {(isDocumentNeededStatus.isProofOfDirecorsNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDandFSGNeeded) && (
                        <View style={[styles.sectionDividerLine, styles.mh0]} />
                    )}
                </View>
            )}
            {isDocumentNeededStatus.isProofOfDirecorsNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.proofOfDirectors')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('signerInfoStep.chooseFile')}
                        uploadedFiles={uploadedProofsOfDirectors}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedProofsOfDirectors, `${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`, setUploadedProofsOfDirectors);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofsOfDirectors, `${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`, setUploadedProofsOfDirectors);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedProofsOfDirectors}
                        inputID={`${SIGNER_PREFIX}_${PROOF_OF_DIRECTORS}`}
                        setError={setError}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.proofOfDirectorsDescription')}</Text>
                    {(isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDandFSGNeeded) && <View style={[styles.sectionDividerLine, styles.mh0]} />}
                </View>
            )}
            {isDocumentNeededStatus.isCodiceFiscaleNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.codiceFiscale')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('signerInfoStep.chooseFile')}
                        uploadedFiles={uploadedCodiceFiscale}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedCodiceFiscale, `${SIGNER_PREFIX}_${CODICE_FISCALE}`, setUploadedCodiceFiscale);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedCodiceFiscale, `${SIGNER_PREFIX}_${CODICE_FISCALE}`, setUploadedCodiceFiscale);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedCodiceFiscale}
                        inputID={`${SIGNER_PREFIX}_${CODICE_FISCALE}`}
                        setError={setError}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('ownershipInfoStep.codiceFiscaleDescription')}</Text>
                    {isDocumentNeededStatus.isPRDandFSGNeeded && <View style={[styles.sectionDividerLine, styles.mh0]} />}
                </View>
            )}
            {isDocumentNeededStatus.isPRDandFSGNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.PRDandSFD')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('signerInfoStep.chooseFile')}
                        uploadedFiles={uploadedPRDandSFG}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedPRDandSFG, `${SIGNER_PREFIX}_${PRD_AND_SFG}`, setUploadedPRDandSFG);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedPRDandSFG, `${SIGNER_PREFIX}_${PRD_AND_SFG}`, setUploadedPRDandSFG);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedPRDandSFG}
                        inputID={`${SIGNER_PREFIX}_${PRD_AND_SFG}`}
                        setError={setError}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('signerInfoStep.PRDandFSGDescription')}</Text>
                </View>
            )}
            <WhyLink containerStyles={[styles.mt6]} />
        </FormProvider>
    );
}

UploadDocuments.displayName = 'UploadDocuments';

export default UploadDocuments;
