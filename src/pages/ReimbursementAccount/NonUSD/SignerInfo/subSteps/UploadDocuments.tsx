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

const {SIGNER_ADDRESS_PROOF, SIGNER_PROOF_OF_DIRECTORS, SIGNER_COPY_OF_ID, SIGNER_CODICE_FISCALE, SIGNER_PRD_AND_SFG} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {ADDRESS_PROOF, PROOF_OF_DIRECTORS, COPY_OF_ID, CODICE_FISCALE, PRD_AND_SFG} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
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
        [`signer_${COPY_OF_ID}`]: reimbursementAccount?.achData?.corpay?.[SIGNER_COPY_OF_ID] ?? reimbursementAccountDraft?.[`signer_${COPY_OF_ID}`] ?? [],
        [`signer_${ADDRESS_PROOF}`]: reimbursementAccount?.achData?.corpay?.[SIGNER_ADDRESS_PROOF] ?? reimbursementAccountDraft?.[`signer_${ADDRESS_PROOF}`] ?? [],
        [`signer_${PROOF_OF_DIRECTORS}`]:
            reimbursementAccount?.achData?.corpay?.[SIGNER_PROOF_OF_DIRECTORS] ?? reimbursementAccountDraft?.[`signer_${PROOF_OF_DIRECTORS}`] ?? [],
        [`signer_${CODICE_FISCALE}`]: reimbursementAccount?.achData?.corpay?.[SIGNER_CODICE_FISCALE] ?? reimbursementAccountDraft?.[`signer_${CODICE_FISCALE}`] ?? [],
        [`signer_${PRD_AND_SFG}`]: reimbursementAccount?.achData?.corpay?.[SIGNER_PRD_AND_SFG] ?? reimbursementAccountDraft?.[`signer_${PRD_AND_SFG}`] ?? [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[`signer_${COPY_OF_ID}`] as FileObject[]);
    const [uploadedProofsOfAddress, setUploadedProofOfAddress] = useState<FileObject[]>(defaultValues[`signer_${ADDRESS_PROOF}`] as FileObject[]);
    const [uploadedProofsOfDirectors, setUploadedProofsOfDirectors] = useState<FileObject[]>(defaultValues[`signer_${PROOF_OF_DIRECTORS}`] as FileObject[]);
    const [uploadedCodiceFiscale, setUploadedCodiceFiscale] = useState<FileObject[]>(defaultValues[`signer_${CODICE_FISCALE}`] as FileObject[]);
    const [uploadedPRDandSFG, setUploadedPRDandSFG] = useState<FileObject[]>(defaultValues[`signer_${PRD_AND_SFG}`] as FileObject[]);

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
            style={[styles.mh5, styles.flex1]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('signerInfoStep.uploadID')}</Text>
                {isDocumentNeededStatus.isCopyOfIDNeeded && (
                    <View>
                        <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.id')}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('signerInfoStep.chooseFile')}
                            uploadedFiles={uploadedIDs}
                            onUpload={(files) => {
                                handleSelectFile(files, uploadedIDs, `signer_${COPY_OF_ID}`, setUploadedID);
                            }}
                            onRemove={(fileName) => {
                                handleRemoveFile(fileName, uploadedIDs, `signer_${COPY_OF_ID}`, setUploadedID);
                            }}
                            acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                            value={uploadedIDs}
                            inputID={`signer_${COPY_OF_ID}`}
                            setError={setError}
                        />
                    </View>
                )}
                {isDocumentNeededStatus.isAddressProofNeeded && (
                    <View>
                        <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('signerInfoStep.proofOf')}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('signerInfoStep.chooseFile')}
                            uploadedFiles={uploadedProofsOfAddress}
                            onUpload={(files) => {
                                handleSelectFile(files, uploadedProofsOfAddress, `signer_${ADDRESS_PROOF}`, setUploadedProofOfAddress);
                            }}
                            onRemove={(fileName) => {
                                handleRemoveFile(fileName, uploadedProofsOfAddress, `signer_${ADDRESS_PROOF}`, setUploadedProofOfAddress);
                            }}
                            acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                            value={uploadedProofsOfAddress}
                            inputID={`signer_${ADDRESS_PROOF}`}
                            setError={setError}
                        />
                    </View>
                )}
                {isDocumentNeededStatus.isProofOfDirecorsNeeded && (
                    <View>
                        <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('signerInfoStep.proofOfDirectors')}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('signerInfoStep.chooseFile')}
                            uploadedFiles={uploadedProofsOfDirectors}
                            onUpload={(files) => {
                                handleSelectFile(files, uploadedProofsOfDirectors, `signer_${PROOF_OF_DIRECTORS}`, setUploadedProofsOfDirectors);
                            }}
                            onRemove={(fileName) => {
                                handleRemoveFile(fileName, uploadedProofsOfDirectors, `signer_${PROOF_OF_DIRECTORS}`, setUploadedProofsOfDirectors);
                            }}
                            acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                            value={uploadedProofsOfDirectors}
                            inputID={`signer_${PROOF_OF_DIRECTORS}`}
                            setError={setError}
                        />
                    </View>
                )}
                {isDocumentNeededStatus.isCodiceFiscaleNeeded && (
                    <View>
                        <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('signerInfoStep.codiceFiscale')}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('signerInfoStep.chooseFile')}
                            uploadedFiles={uploadedCodiceFiscale}
                            onUpload={(files) => {
                                handleSelectFile(files, uploadedCodiceFiscale, `signer_${CODICE_FISCALE}`, setUploadedCodiceFiscale);
                            }}
                            onRemove={(fileName) => {
                                handleRemoveFile(fileName, uploadedCodiceFiscale, `signer_${CODICE_FISCALE}`, setUploadedCodiceFiscale);
                            }}
                            acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                            value={uploadedCodiceFiscale}
                            inputID={`signer_${CODICE_FISCALE}`}
                            setError={setError}
                        />
                    </View>
                )}
                {isDocumentNeededStatus.isPRDandFSGNeeded && (
                    <View>
                        <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('signerInfoStep.PRDandSFD')}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('signerInfoStep.chooseFile')}
                            uploadedFiles={uploadedPRDandSFG}
                            onUpload={(files) => {
                                handleSelectFile(files, uploadedPRDandSFG, `signer_${PRD_AND_SFG}`, setUploadedPRDandSFG);
                            }}
                            onRemove={(fileName) => {
                                handleRemoveFile(fileName, uploadedPRDandSFG, `signer_${PRD_AND_SFG}`, setUploadedPRDandSFG);
                            }}
                            acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                            value={uploadedPRDandSFG}
                            inputID={`signer_${PRD_AND_SFG}`}
                            setError={setError}
                        />
                    </View>
                )}
                <WhyLink containerStyles={[styles.mt6]} />
            </View>
        </FormProvider>
    );
}

UploadDocuments.displayName = 'UploadDocuments';

export default UploadDocuments;
