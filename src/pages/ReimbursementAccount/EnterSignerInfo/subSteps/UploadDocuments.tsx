import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormFieldGroup from '@components/Form/Layout/FormFieldGroup';
import FormFields from '@components/Form/Layout/FormFields';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';

import useEnterSignerInfoStepFormSubmit from '@hooks/useEnterSignerInfoStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getEnvironmentURL} from '@libs/Environment/Environment';
import mapCurrencyToCountry from '@libs/mapCurrencyToCountry';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/utils/getNeededDocumentsStatusForSignerInfo';
import WhyLink from '@pages/ReimbursementAccount/WhyLink';

import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import {openExternalLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type UploadDocumentsProps = SubPageProps & {policyID: string};

function UploadDocuments({onNext, isEditing, policyID}: UploadDocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [environmentUrl, setEnvironmentUrl] = useState<string | null>(null);

    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? '';
    const country = mapCurrencyToCountry(currency) ?? reimbursementAccountDraft?.country;
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, country);
    const isPDSandFSGDownloaded = enterSignerInfoFormDraft?.[INPUT_IDS.DOWNLOADED_PDS_AND_FSG] ?? false;
    const [isPDSandFSGDownloadedTouched, setIsPDSandFSGDownloadedTouched] = useState<boolean>(false);

    const copyOfIDInputID = INPUT_IDS.SIGNER_COPY_OF_ID;
    const addressProofInputID = INPUT_IDS.SIGNER_ADDRESS_PROOF;
    const directorsProofInputID = INPUT_IDS.PROOF_OF_DIRECTORS;
    const codiceFiscaleInputID = INPUT_IDS.SIGNER_CODICE_FISCALE;

    const defaultValues: Record<string, FileObject[]> = {
        [copyOfIDInputID]: Array.isArray(enterSignerInfoFormDraft?.[copyOfIDInputID]) ? (enterSignerInfoFormDraft?.[copyOfIDInputID] ?? []) : [],
        [addressProofInputID]: Array.isArray(enterSignerInfoFormDraft?.[addressProofInputID]) ? (enterSignerInfoFormDraft?.[addressProofInputID] ?? []) : [],
        [directorsProofInputID]: Array.isArray(enterSignerInfoFormDraft?.[directorsProofInputID]) ? (enterSignerInfoFormDraft?.[directorsProofInputID] ?? []) : [],
        [codiceFiscaleInputID]: Array.isArray(enterSignerInfoFormDraft?.[codiceFiscaleInputID]) ? (enterSignerInfoFormDraft?.[codiceFiscaleInputID] ?? []) : [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[copyOfIDInputID]);
    const [uploadedProofsOfAddress, setUploadedProofOfAddress] = useState<FileObject[]>(defaultValues[addressProofInputID]);
    const [uploadedProofsOfDirectors, setUploadedProofsOfDirectors] = useState<FileObject[]>(defaultValues[directorsProofInputID]);
    const [uploadedCodiceFiscale, setUploadedCodiceFiscale] = useState<FileObject[]>(defaultValues[codiceFiscaleInputID]);

    useEffect(() => {
        getEnvironmentURL().then(setEnvironmentUrl);
    }, []);

    const STEP_FIELDS: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>> = [copyOfIDInputID, addressProofInputID, directorsProofInputID, codiceFiscaleInputID];

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM> => {
        return getFieldRequiredErrors(values, STEP_FIELDS, translate);
    };

    const handleSubmit = useEnterSignerInfoStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleSubmitWithDownload = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>) => {
        if (isDocumentNeededStatus.isPRDAndFSGNeeded && !isPDSandFSGDownloaded) {
            return;
        }

        handleSubmit(values);
    };

    const handleRemoveFile = (fileName: string, uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        const newUploadedIDs = uploadedFiles.filter((file) => file.name !== fileName);
        setDraftValues(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {[inputID]: newUploadedIDs});
        setFiles(newUploadedIDs);
    };

    const handleSelectFile = (files: FileObject[], uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        setDraftValues(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {[inputID]: [...uploadedFiles, ...files]});
        setFiles((prev) => [...prev, ...files]);
    };

    const setUploadError = (error: string, inputID: string) => {
        if (!error) {
            clearErrorFields(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM);
            return;
        }

        setErrorFields(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {[inputID]: {onUpload: error}});
    };

    const downloadPDSAndFSG = () => {
        openExternalLink(`${environmentUrl}/pdfs/PDSAndFSG.pdf`);
        setIsPDSandFSGDownloadedTouched(true);
        setDraftValues(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {[INPUT_IDS.DOWNLOADED_PDS_AND_FSG]: true});
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmitWithDownload}
            onBeforeSubmit={() => setIsPDSandFSGDownloadedTouched(true)}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <FormHeader
                title={translate('ownershipInfoStep.uploadDocuments')}
                description={translate('signerInfoStep.pleaseUpload')}
            >
                <Text style={styles.textSupporting}>{translate('ownershipInfoStep.acceptedFiles')}</Text>
            </FormHeader>
            <FormFields>
                {isDocumentNeededStatus.isCopyOfIDNeeded && (
                    <>
                        <FormFieldGroup>
                            <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.id')}</Text>
                            <InputWrapper
                                InputComponent={UploadFile}
                                buttonText={translate('signerInfoStep.chooseFile')}
                                uploadedFiles={uploadedIDs}
                                onUpload={(files) => {
                                    handleSelectFile(files, uploadedIDs, copyOfIDInputID, setUploadedID);
                                }}
                                onRemove={(fileName) => {
                                    handleRemoveFile(fileName, uploadedIDs, copyOfIDInputID, setUploadedID);
                                }}
                                acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                                value={uploadedIDs}
                                inputID={copyOfIDInputID}
                                setError={(error) => {
                                    setUploadError(error, copyOfIDInputID);
                                }}
                                fileLimit={1}
                            />
                            <Text style={styles.mutedTextLabel}>{translate('ownershipInfoStep.copyOfIDDescription')}</Text>
                        </FormFieldGroup>
                        {(isDocumentNeededStatus.isAddressProofNeeded ||
                            isDocumentNeededStatus.isProofOfDirectorsNeeded ||
                            isDocumentNeededStatus.isCodiceFiscaleNeeded ||
                            isDocumentNeededStatus.isPRDAndFSGNeeded) && <View style={styles.sectionDividerLine} />}
                    </>
                )}
                {isDocumentNeededStatus.isAddressProofNeeded && (
                    <>
                        <FormFieldGroup>
                            <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.proofOf')}</Text>
                            <InputWrapper
                                InputComponent={UploadFile}
                                buttonText={translate('signerInfoStep.chooseFile')}
                                uploadedFiles={uploadedProofsOfAddress}
                                onUpload={(files) => {
                                    handleSelectFile(files, uploadedProofsOfAddress, addressProofInputID, setUploadedProofOfAddress);
                                }}
                                onRemove={(fileName) => {
                                    handleRemoveFile(fileName, uploadedProofsOfAddress, addressProofInputID, setUploadedProofOfAddress);
                                }}
                                acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                                value={uploadedProofsOfAddress}
                                inputID={addressProofInputID}
                                setError={(error) => {
                                    setUploadError(error, addressProofInputID);
                                }}
                                fileLimit={1}
                            />
                            <Text style={styles.mutedTextLabel}>{translate('ownershipInfoStep.proofOfAddressDescription')}</Text>
                        </FormFieldGroup>
                        {(isDocumentNeededStatus.isProofOfDirectorsNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDAndFSGNeeded) && (
                            <View style={styles.sectionDividerLine} />
                        )}
                    </>
                )}
                {isDocumentNeededStatus.isProofOfDirectorsNeeded && (
                    <>
                        <FormFieldGroup>
                            <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.proofOfDirectors')}</Text>
                            <InputWrapper
                                InputComponent={UploadFile}
                                buttonText={translate('signerInfoStep.chooseFile')}
                                uploadedFiles={uploadedProofsOfDirectors}
                                onUpload={(files) => {
                                    handleSelectFile(files, uploadedProofsOfDirectors, directorsProofInputID, setUploadedProofsOfDirectors);
                                }}
                                onRemove={(fileName) => {
                                    handleRemoveFile(fileName, uploadedProofsOfDirectors, directorsProofInputID, setUploadedProofsOfDirectors);
                                }}
                                acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                                value={uploadedProofsOfDirectors}
                                inputID={directorsProofInputID}
                                setError={(error) => {
                                    setUploadError(error, directorsProofInputID);
                                }}
                                fileLimit={1}
                            />
                            <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.proofOfDirectorsDescription')}</Text>
                        </FormFieldGroup>
                        {(isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDAndFSGNeeded) && <View style={styles.sectionDividerLine} />}
                    </>
                )}
                {isDocumentNeededStatus.isCodiceFiscaleNeeded && (
                    <>
                        <FormFieldGroup>
                            <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.codiceFiscale')}</Text>
                            <InputWrapper
                                InputComponent={UploadFile}
                                buttonText={translate('signerInfoStep.chooseFile')}
                                uploadedFiles={uploadedCodiceFiscale}
                                onUpload={(files) => {
                                    handleSelectFile(files, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
                                }}
                                onRemove={(fileName) => {
                                    handleRemoveFile(fileName, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
                                }}
                                acceptedFileTypes={[...CONST.ENTER_SIGNER_INFO.ALLOWED_FILE_TYPES]}
                                value={uploadedCodiceFiscale}
                                inputID={codiceFiscaleInputID}
                                setError={(error) => {
                                    setUploadError(error, codiceFiscaleInputID);
                                }}
                                fileLimit={1}
                            />
                            <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.codiceFiscaleDescription')}</Text>
                        </FormFieldGroup>
                        {isDocumentNeededStatus.isPRDAndFSGNeeded && <View style={styles.sectionDividerLine} />}
                    </>
                )}
                {isDocumentNeededStatus.isPRDAndFSGNeeded && (
                    <FormFieldGroup style={styles.alignItemsStart}>
                        <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.PDSandFSG')}</Text>
                        <Button onPress={downloadPDSAndFSG}>
                            <Button.Text>{translate('common.download')}</Button.Text>
                        </Button>
                        {!isPDSandFSGDownloaded && isPDSandFSGDownloadedTouched && (
                            <DotIndicatorMessage
                                style={styles.formError}
                                type="error"
                                messages={{[INPUT_IDS.DOWNLOADED_PDS_AND_FSG]: translate('common.error.fieldRequired')}}
                            />
                        )}
                        <Text style={styles.mutedTextLabel}>{translate('signerInfoStep.PDSandFSGDescription')}</Text>
                    </FormFieldGroup>
                )}
            </FormFields>
            <WhyLink />
        </FormProvider>
    );
}

export default UploadDocuments;
