import React, {useCallback, useState} from 'react';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import {openLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type UploadPowerformProps = SubStepProps;

const {ACH_AUTHORIZATION_FORM} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [ACH_AUTHORIZATION_FORM];

function UploadPowerform({onNext, isEditing}: UploadPowerformProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const countryStepCountryValue = reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';

    const defaultValue: FileObject[] = Array.isArray(reimbursementAccountDraft?.[ACH_AUTHORIZATION_FORM]) ? (reimbursementAccountDraft?.[ACH_AUTHORIZATION_FORM] ?? []) : [];

    const [uploadedFiles, setUploadedFiles] = useState<FileObject[]>(defaultValue);

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleSelectFile = (files: FileObject[]) => {
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ACH_AUTHORIZATION_FORM]: [...uploadedFiles, ...files]});
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (fileName: string) => {
        const newUploadedFiles = uploadedFiles.filter((file) => file.name !== fileName);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ACH_AUTHORIZATION_FORM]: newUploadedFiles});
        setUploadedFiles(newUploadedFiles);
    };

    const setUploadError = (error: string) => {
        if (!error) {
            clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }

        setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ACH_AUTHORIZATION_FORM]: {onUpload: error}});
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.submit')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
            enabledWhenOffline={false}
            isLoading={reimbursementAccount?.isFinishingCorpayBankAccountOnboarding}
        >
            {countryStepCountryValue === CONST.COUNTRY.CA && <Text style={[styles.textHeadlineLineHeightXXL, styles.mb10]}>{translate('docusignStep.pleaseComplete')}</Text>}
            {countryStepCountryValue === CONST.COUNTRY.AU && (
                <>
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('docusignStep.pleaseCompleteTheBusinessAccount')}</Text>
                    <Text style={[styles.textSupporting, styles.mb10]}>{translate('docusignStep.pleaseCompleteTheDirect')}</Text>
                </>
            )}
            <Button
                success
                large
                style={[styles.w100, styles.mb15]}
                onPress={() => {
                    openLink(CONST.DOCUSIGN_POWERFORM_LINK[countryStepCountryValue as 'CA' | 'AU'], environmentURL);
                }}
                text={translate('docusignStep.takeMeTo')}
            />
            {countryStepCountryValue === CONST.COUNTRY.CA && <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('docusignStep.uploadAdditional')}</Text>}
            {countryStepCountryValue === CONST.COUNTRY.AU && <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('docusignStep.pleaseUploadTheDirect')}</Text>}
            <Text style={[styles.textHeadlineH2, styles.colorMuted, styles.mb10]}>{translate('docusignStep.pleaseUpload')}</Text>
            <InputWrapper
                InputComponent={UploadFile}
                buttonText={translate('common.chooseFile')}
                uploadedFiles={uploadedFiles}
                onUpload={(files) => {
                    handleSelectFile(files);
                }}
                onRemove={(fileName) => {
                    handleRemoveFile(fileName);
                }}
                acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                value={uploadedFiles}
                inputID={ACH_AUTHORIZATION_FORM}
                setError={(error) => {
                    setUploadError(error);
                }}
                fileLimit={1}
            />
        </FormProvider>
    );
}

UploadPowerform.displayName = 'UploadPowerform';

export default UploadPowerform;
