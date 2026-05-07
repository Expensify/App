import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getCurrencyForNonUSDBankAccount from '@pages/ReimbursementAccount/NonUSD/utils/getCurrencyForNonUSDBankAccount';
import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/utils/getNeededDocumentsStatusForSignerInfo';
import WhyLink from '@pages/ReimbursementAccount/WhyLink';
import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import {openExternalLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

type UploadDocumentsProps = SubPageProps;

const {ADDRESS_PROOF, PROOF_OF_DIRECTORS, COPY_OF_ID, CODICE_FISCALE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
const signerInfoKeys = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

function UploadDocuments({onNext, isEditing}: UploadDocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [environmentUrl, setEnvironmentUrl] = useState<string | null>(null);

    const {country, currency} = getCurrencyForNonUSDBankAccount(policy, reimbursementAccountDraft, reimbursementAccount);
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, country);
    const isPDSandFSGDownloaded = reimbursementAccount?.achData?.corpay?.downloadedPDSandFSG ?? reimbursementAccountDraft?.[signerInfoKeys.DOWNLOADED_PDS_AND_FSG] ?? false;
    const [isPDSandFSGDownloadedTouched, setIsPDSandFSGDownloadedTouched] = useState<boolean>(false);

    const defaultValues: Record<string, FileObject[]> = {
        [COPY_OF_ID]: Array.isArray(reimbursementAccountDraft?.[COPY_OF_ID]) ? (reimbursementAccountDraft?.[COPY_OF_ID] ?? []) : [],
        [ADDRESS_PROOF]: Array.isArray(reimbursementAccountDraft?.[ADDRESS_PROOF]) ? (reimbursementAccountDraft?.[ADDRESS_PROOF] ?? []) : [],
        [PROOF_OF_DIRECTORS]: Array.isArray(reimbursementAccountDraft?.[PROOF_OF_DIRECTORS]) ? (reimbursementAccountDraft?.[PROOF_OF_DIRECTORS] ?? []) : [],
        [CODICE_FISCALE]: Array.isArray(reimbursementAccountDraft?.[CODICE_FISCALE]) ? (reimbursementAccountDraft?.[CODICE_FISCALE] ?? []) : [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[COPY_OF_ID]);
    const [uploadedProofsOfAddress, setUploadedProofOfAddress] = useState<FileObject[]>(defaultValues[ADDRESS_PROOF]);
    const [uploadedProofsOfDirectors, setUploadedProofsOfDirectors] = useState<FileObject[]>(defaultValues[PROOF_OF_DIRECTORS]);
    const [uploadedCodiceFiscale, setUploadedCodiceFiscale] = useState<FileObject[]>(defaultValues[CODICE_FISCALE]);

    useEffect(() => {
        getEnvironmentURL().then(setEnvironmentUrl);
    }, []);

    const STEP_FIELDS: Array<FormOnyxKeys<'reimbursementAccount'>> = [COPY_OF_ID, ADDRESS_PROOF, PROOF_OF_DIRECTORS, CODICE_FISCALE];

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        setIsPDSandFSGDownloadedTouched(true);
        return getFieldRequiredErrors(values, STEP_FIELDS, translate);
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleSubmitWithDownload = (values: FormOnyxValues<'reimbursementAccount'>) => {
        if (isDocumentNeededStatus.isPRDAndFSGNeeded && !isPDSandFSGDownloaded) {
            return;
        }

        handleSubmit(values);
    };

    const handleRemoveFile = (fileName: string, uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        const newUploadedIDs = uploadedFiles.filter((file) => file.name !== fileName);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: newUploadedIDs});
        setFiles(newUploadedIDs);
    };

    const handleSelectFile = (files: FileObject[], uploadedFiles: FileObject[], inputID: string, setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>) => {
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: [...uploadedFiles, ...files]});
        setFiles((prev) => [...prev, ...files]);
    };

    const setUploadError = (error: string, inputID: string) => {
        if (!error) {
            clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }

        setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: {onUpload: error}});
    };

    const handleDownload = () => {
        openExternalLink(`${environmentUrl}/pdfs/PDSAndFSG.pdf`);
        setIsPDSandFSGDownloadedTouched(true);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[signerInfoKeys.DOWNLOADED_PDS_AND_FSG]: true});
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmitWithDownload}
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
                            handleSelectFile(files, uploadedIDs, COPY_OF_ID, setUploadedID);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedIDs, COPY_OF_ID, setUploadedID);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedIDs}
                        inputID={COPY_OF_ID}
                        setError={(error) => {
                            setUploadError(error, COPY_OF_ID);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.copyOfIDDescription')}</Text>
                    {(isDocumentNeededStatus.isAddressProofNeeded ||
                        isDocumentNeededStatus.isProofOfDirectorsNeeded ||
                        isDocumentNeededStatus.isCodiceFiscaleNeeded ||
                        isDocumentNeededStatus.isPRDAndFSGNeeded) && <View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]} />}
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
                            handleSelectFile(files, uploadedProofsOfAddress, ADDRESS_PROOF, setUploadedProofOfAddress);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofsOfAddress, ADDRESS_PROOF, setUploadedProofOfAddress);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedProofsOfAddress}
                        inputID={ADDRESS_PROOF}
                        setError={(error) => {
                            setUploadError(error, ADDRESS_PROOF);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('ownershipInfoStep.proofOfAddressDescription')}</Text>
                    {(isDocumentNeededStatus.isProofOfDirectorsNeeded || isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDAndFSGNeeded) && (
                        <View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]} />
                    )}
                </View>
            )}
            {isDocumentNeededStatus.isProofOfDirectorsNeeded && (
                <View>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.proofOfDirectors')}</Text>
                    <InputWrapper
                        InputComponent={UploadFile}
                        buttonText={translate('signerInfoStep.chooseFile')}
                        uploadedFiles={uploadedProofsOfDirectors}
                        onUpload={(files) => {
                            handleSelectFile(files, uploadedProofsOfDirectors, PROOF_OF_DIRECTORS, setUploadedProofsOfDirectors);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofsOfDirectors, PROOF_OF_DIRECTORS, setUploadedProofsOfDirectors);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedProofsOfDirectors}
                        inputID={PROOF_OF_DIRECTORS}
                        setError={(error) => {
                            setUploadError(error, PROOF_OF_DIRECTORS);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.proofOfDirectorsDescription')}</Text>
                    {(isDocumentNeededStatus.isCodiceFiscaleNeeded || isDocumentNeededStatus.isPRDAndFSGNeeded) && <View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]} />}
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
                            handleSelectFile(files, uploadedCodiceFiscale, CODICE_FISCALE, setUploadedCodiceFiscale);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedCodiceFiscale, CODICE_FISCALE, setUploadedCodiceFiscale);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedCodiceFiscale}
                        inputID={CODICE_FISCALE}
                        setError={(error) => {
                            setUploadError(error, CODICE_FISCALE);
                        }}
                        fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.codiceFiscaleDescription')}</Text>
                    {isDocumentNeededStatus.isPRDAndFSGNeeded && <View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]} />}
                </View>
            )}
            {isDocumentNeededStatus.isPRDAndFSGNeeded && (
                <View style={[styles.alignItemsStart]}>
                    <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('signerInfoStep.PDSandFSG')}</Text>
                    <Button
                        onPress={handleDownload}
                        text={translate('common.download')}
                    />
                    {!isPDSandFSGDownloaded && isPDSandFSGDownloadedTouched && (
                        <DotIndicatorMessage
                            style={[styles.formError, styles.mt3]}
                            type="error"
                            messages={{[signerInfoKeys.DOWNLOADED_PDS_AND_FSG]: translate('common.error.fieldRequired')}}
                        />
                    )}
                    <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('signerInfoStep.PDSandFSGDescription')}</Text>
                </View>
            )}
            <WhyLink containerStyles={[styles.mt6]} />
        </FormProvider>
    );
}

export default UploadDocuments;
