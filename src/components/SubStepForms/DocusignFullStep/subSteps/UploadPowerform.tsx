import React, {useCallback, useState} from 'react';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import mapCurrencyToCountry from '@libs/mapCurrencyToCountry';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import {openLink} from '@userActions/Link';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

type UploadPowerformProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** Default value for file upload input */
    defaultValue: FileObject[];

    /** The ID of the form */
    formID: TFormID;

    /** ID of the input in the form */
    inputID: FormOnyxKeys<TFormID>;

    /** Indicates that action is being processed */
    isLoading: boolean;

    /** Currency of related account */
    currency: string;
};
function UploadPowerform<TFormID extends keyof OnyxFormValuesMapping>({defaultValue, formID, inputID, isLoading, onNext, currency}: UploadPowerformProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();

    const [uploadedFiles, setUploadedFiles] = useState<FileObject[]>(defaultValue);

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            return getFieldRequiredErrors(values, [inputID], translate);
        },
        [inputID, translate],
    );

    const handleSelectFile = (files: FileObject[]) => {
        setDraftValues(formID, {[inputID]: [...uploadedFiles, ...files]});
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (fileName: string) => {
        const newUploadedFiles = uploadedFiles.filter((file) => file.name !== fileName);
        setDraftValues(formID, {[inputID]: newUploadedFiles});
        setUploadedFiles(newUploadedFiles);
    };

    const setUploadError = (error: string) => {
        if (!error) {
            clearErrorFields(formID);
            return;
        }

        setErrorFields(formID, {[inputID]: {onUpload: error}});
    };

    const country = mapCurrencyToCountry(currency ?? '');

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate('common.submit')}
            onSubmit={onNext}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
            enabledWhenOffline={false}
            isLoading={isLoading}
        >
            {(country === CONST.COUNTRY.CA || country === CONST.COUNTRY.US) && (
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb10]}>{translate('docusignStep.pleaseComplete')}</Text>
            )}
            {country === CONST.COUNTRY.AU && (
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
                    openLink(CONST.DOCUSIGN_POWERFORM_LINK[country as 'CA' | 'AU' | 'US'], environmentURL);
                }}
                text={translate('docusignStep.takeMeTo')}
            />
            {(country === CONST.COUNTRY.CA || country === CONST.COUNTRY.US) && (
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('docusignStep.uploadAdditional')}</Text>
            )}
            {country === CONST.COUNTRY.AU && <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('docusignStep.pleaseUploadTheDirect')}</Text>}
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
    );
}

export default UploadPowerform;
