import React, {useCallback, useMemo, useState} from 'react';
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
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DocumentsProps = SubStepProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {PROOF_OF_OWNERSHIP, ADDRESS_PROOF, COPY_OF_ID, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Documents({onNext, isEditing, isUserEnteringHisOwnData, ownerBeingModifiedID}: DocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const proofOfOwnershipInputID = `${PREFIX}_${ownerBeingModifiedID}_${PROOF_OF_OWNERSHIP}` as const;
    const copyOfIDInputID = `${PREFIX}_${ownerBeingModifiedID}_${COPY_OF_ID}` as const;
    const addressProofInputID = `${PREFIX}_${ownerBeingModifiedID}_${ADDRESS_PROOF}` as const;

    const defaultValues: Record<string, FileObject[]> = {
        [proofOfOwnershipInputID]: Array.isArray(reimbursementAccountDraft?.[proofOfOwnershipInputID]) ? (reimbursementAccountDraft?.[proofOfOwnershipInputID] as FileObject[]) ?? [] : [],
        [copyOfIDInputID]: Array.isArray(reimbursementAccountDraft?.[copyOfIDInputID]) ? (reimbursementAccountDraft?.[copyOfIDInputID] as FileObject[]) ?? [] : [],
        [addressProofInputID]: Array.isArray(reimbursementAccountDraft?.[addressProofInputID]) ? (reimbursementAccountDraft?.[addressProofInputID] as FileObject[]) ?? [] : [],
    };

    const [uploadedProofOfOwnership, setUploadedProofOfOwnership] = useState<FileObject[]>(defaultValues[proofOfOwnershipInputID]);
    const [uploadedCopyOfID, setUploadedCopyOfID] = useState<FileObject[]>(defaultValues[copyOfIDInputID]);
    const [uploadedAddressProof, setUploadedAddressProof] = useState<FileObject[]>(defaultValues[addressProofInputID]);

    const STEP_FIELDS = useMemo(() => [proofOfOwnershipInputID, addressProofInputID, copyOfIDInputID], []);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (errors) {
                return errors;
            }

            return {};
        },
        [STEP_FIELDS],
    );

    const handleSelectFile = (files: FileObject[], uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: [...uploadedFiles, ...files]});
        setFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (fileName: string, uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        const newUploadedIDs = uploadedFiles.filter((file) => file.name !== fileName);
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: newUploadedIDs});
        setFiles(newUploadedIDs);
    };

    const setUploadError = (error: string, inputID: string) => {
        if (!error) {
            FormActions.clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }

        FormActions.setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: {onUpload: error}});
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('ownershipInfoStep.uploadDocuments')}</Text>
                <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('ownershipInfoStep.proofOfBeneficialOwner')}</Text>
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
            </View>
            <View>
                <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('ownershipInfoStep.copyOfID')}</Text>
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
            </View>
            <View>
                <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('ownershipInfoStep.proofOfAddress')}</Text>
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
            </View>
        </FormProvider>
    );
}

Documents.displayName = 'Documents';

export default Documents;
