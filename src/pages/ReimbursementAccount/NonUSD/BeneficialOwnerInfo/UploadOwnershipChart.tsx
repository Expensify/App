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
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type UploadOwnershipChartProps = {
    onSubmit: () => void;
};

const {ENTITY_CHART} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function UploadOwnershipChart({onSubmit}: UploadOwnershipChartProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const defaultValue = reimbursementAccount?.achData?.additionalData?.corpay?.[ENTITY_CHART] ?? reimbursementAccountDraft?.[ENTITY_CHART] ?? [];

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return ValidationUtils.getFieldRequiredErrors(values, [ENTITY_CHART]);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [ENTITY_CHART],
        onNext: onSubmit,
        shouldSaveDraft: true,
    });

    const [uploadedOwnershipChartStatements, setUploadedOwnershipChartStatements] = useState<FileObject[]>(defaultValue);

    const handleSelectFile = (files: FileObject[]) => {
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ENTITY_CHART]: [...uploadedOwnershipChartStatements, ...files]});
        setUploadedOwnershipChartStatements((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (fileUri: string) => {
        const newUploadedOwnershipChartStatements = uploadedOwnershipChartStatements.filter((file) => file.uri !== fileUri);
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ENTITY_CHART]: newUploadedOwnershipChartStatements});
        setUploadedOwnershipChartStatements(newUploadedOwnershipChartStatements);
    };

    const setUploadError = (error: string) => {
        if (!error) {
            FormActions.clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }

        FormActions.setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ENTITY_CHART]: {onUpload: error}});
    };
    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.confirm')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flex1]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('ownershipInfoStep.addCertified')}</Text>
                <Text style={[styles.mutedTextLabel, styles.mb6]}>{translate('ownershipInfoStep.regulationRequiresChart')}</Text>
                <InputWrapper
                    InputComponent={UploadFile}
                    buttonText={translate('ownershipInfoStep.uploadEntity')}
                    uploadedFiles={uploadedOwnershipChartStatements}
                    onUpload={handleSelectFile}
                    onRemove={handleRemoveFile}
                    acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                    value={uploadedOwnershipChartStatements}
                    inputID={ENTITY_CHART}
                    setError={setUploadError}
                />
                <Text style={[styles.mutedTextLabel, styles.mt6, styles.mb6]}>{translate('ownershipInfoStep.noteEntity')}</Text>
            </View>
        </FormProvider>
    );
}

UploadOwnershipChart.displayName = 'UploadOwnershipChart';

export default UploadOwnershipChart;
