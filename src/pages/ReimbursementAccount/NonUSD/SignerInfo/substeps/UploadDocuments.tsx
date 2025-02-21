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
import * as ValidationUtils from '@libs/ValidationUtils';
import WhyLink from '@pages/ReimbursementAccount/NonUSD/WhyLink';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type UploadDocumentsProps = SubStepProps;

const {SIGNER_ADDRESS_PROOF, SIGNER_COPY_OF_ID} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [SIGNER_COPY_OF_ID, SIGNER_ADDRESS_PROOF];

function UploadDocuments({onNext, isEditing}: UploadDocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const defaultValues = {
        [SIGNER_COPY_OF_ID]: reimbursementAccount?.achData?.additionalData?.corpay?.[SIGNER_COPY_OF_ID] ?? reimbursementAccountDraft?.[SIGNER_COPY_OF_ID] ?? [],
        [SIGNER_ADDRESS_PROOF]: reimbursementAccount?.achData?.additionalData?.corpay?.[SIGNER_ADDRESS_PROOF] ?? reimbursementAccountDraft?.[SIGNER_ADDRESS_PROOF] ?? [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[SIGNER_ADDRESS_PROOF]);
    const [uploadedProofsOfAddress, setUploadedProofOfAddress] = useState<FileObject[]>(defaultValues[SIGNER_ADDRESS_PROOF]);

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleSelectIDFile = (files: FileObject[]) => {
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[SIGNER_COPY_OF_ID]: [...uploadedIDs, ...files]});
        setUploadedID((prev) => [...prev, ...files]);
    };

    const handleRemoveIDFile = (fileUri: string) => {
        const newUploadedIDs = uploadedIDs.filter((file) => file.uri !== fileUri);
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[SIGNER_COPY_OF_ID]: newUploadedIDs});
        setUploadedID(newUploadedIDs);
    };

    const handleSelectProofOfAddressFile = (files: FileObject[]) => {
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[SIGNER_ADDRESS_PROOF]: [...uploadedProofsOfAddress, ...files]});
        setUploadedProofOfAddress((prev) => [...prev, ...files]);
    };

    const handleRemoveProofOfAddressFile = (fileUri: string) => {
        const newUploadedProofsOfAddress = uploadedProofsOfAddress.filter((file) => file.uri !== fileUri);
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[SIGNER_ADDRESS_PROOF]: newUploadedProofsOfAddress});
        setUploadedProofOfAddress(newUploadedProofsOfAddress);
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
                <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.id')}</Text>
                <InputWrapper
                    InputComponent={UploadFile}
                    buttonText={translate('signerInfoStep.chooseFile')}
                    uploadedFiles={uploadedIDs}
                    onUpload={handleSelectIDFile}
                    onRemove={handleRemoveIDFile}
                    acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                    value={uploadedIDs}
                    inputID={SIGNER_COPY_OF_ID}
                    setError={setError}
                />
                <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('signerInfoStep.proofOf')}</Text>
                <InputWrapper
                    InputComponent={UploadFile}
                    buttonText={translate('signerInfoStep.chooseFile')}
                    uploadedFiles={uploadedProofsOfAddress}
                    onUpload={handleSelectProofOfAddressFile}
                    onRemove={handleRemoveProofOfAddressFile}
                    acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                    value={uploadedProofsOfAddress}
                    inputID={SIGNER_ADDRESS_PROOF}
                    setError={setError}
                />
                <WhyLink containerStyles={[styles.mt6]} />
            </View>
        </FormProvider>
    );
}

UploadDocuments.displayName = 'UploadDocuments';

export default UploadDocuments;
