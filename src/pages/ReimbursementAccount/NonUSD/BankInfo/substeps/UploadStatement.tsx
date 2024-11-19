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
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import WhyLink from '@pages/ReimbursementAccount/NonUSD/WhyLink';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type UploadStatementProps = SubStepProps;

const {BANK_STATEMENT} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BANK_STATEMENT];

function UploadStatement({onNext, isEditing}: UploadStatementProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const defaultValues = {
        [BANK_STATEMENT]: reimbursementAccount?.achData?.additionalData?.corpay?.[BANK_STATEMENT] ?? reimbursementAccountDraft?.[BANK_STATEMENT] ?? [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[BANK_STATEMENT]);

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const baseError = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

        if (baseError) {
            return baseError;
        }

        return {};
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleSelectIDFile = (files: FileObject[]) => {
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[BANK_STATEMENT]: [...uploadedIDs, ...files]});
        setUploadedID((prev) => [...prev, ...files]);
    };

    const handleRemoveIDFile = (fileName: string) => {
        const newUploadedIDs = uploadedIDs.filter((file) => file.name !== fileName);
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[BANK_STATEMENT]: newUploadedIDs});
        setUploadedID(newUploadedIDs);
    };

    const setUploadError = (error: string) => {
        if (!error) {
            FormActions.clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }

        FormActions.setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[BANK_STATEMENT]: {onUpload: error}});
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
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankInfoStep.uploadYourLatest')}</Text>
                <Text style={[styles.mutedTextLabel, styles.mb3]}>
                    {translate('bankInfoStep.pleaseUpload', {lastFourDigits: getLastFourDigits(reimbursementAccountDraft?.accountNumber ?? '')})}
                </Text>
                <Text style={[styles.mutedTextLabel, styles.mb3, styles.mt6]}>{translate('bankInfoStep.bankStatement')}</Text>
                <InputWrapper
                    InputComponent={UploadFile}
                    buttonText={translate('bankInfoStep.chooseFile')}
                    uploadedFiles={uploadedIDs}
                    onUpload={handleSelectIDFile}
                    onRemove={handleRemoveIDFile}
                    setError={setUploadError}
                    fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                    acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                    value={uploadedIDs}
                    inputID={BANK_STATEMENT}
                />
                <WhyLink containerStyles={[styles.mt6]} />
            </View>
        </FormProvider>
    );
}

UploadStatement.displayName = 'UploadStatement';

export default UploadStatement;
