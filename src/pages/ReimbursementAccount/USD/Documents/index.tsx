import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DocumentsProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

function Documents({onBackButtonPress}: DocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const validate = () => {};

    const submit = useCallback(() => {
        console.log('submit');
    }, []);

    return (
        <InteractiveStepWrapper
            wrapperID={Documents.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('documentsStep.subheader')}
            handleBackButtonPress={onBackButtonPress}
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                submitButtonText={translate('common.submit')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                submitButtonStyles={[styles.mb0]}
                enabledWhenOffline={false}
            >
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
                    inputID={inputID as string}
                    setError={(error) => {
                        setUploadError(error);
                    }}
                    fileLimit={1}
                />
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

Documents.displayName = 'Documents';

export default Documents;
