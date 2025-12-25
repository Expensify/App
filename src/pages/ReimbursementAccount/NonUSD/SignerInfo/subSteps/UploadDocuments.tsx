import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/utils/getNeededDocumentsStatusForSignerInfo';
import WhyLink from '@pages/ReimbursementAccount/WhyLink';
import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import {openExternalLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {FileObject} from '@src/types/utils/Attachment';

type UploadDocumentsProps = SubStepProps;

const {ADDRESS_PROOF, PROOF_OF_DIRECTORS, COPY_OF_ID, CODICE_FISCALE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
const signerInfoKeys = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

function UploadDocuments({onNext, isEditing}: UploadDocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const [environmentUrl, setEnvironmentUrl] = useState<string | null>(null);

    const currency = policy?.outputCurrency ?? '';
    const countryStepCountryValue = reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, countryStepCountryValue);
    const isPDSandFSGDownloaded = reimbursementAccount?.achData?.corpay?.downloadedPDSandFSG ?? reimbursementAccountDraft?.[signerInfoKeys.DOWNLOADED_PDS_AND_FSG] ?? false;
    const [isPDSandFSGDownloadedTouched, setIsPDSandFSGDownloadedTouched] = useState<boolean>(false);

    const copyOfIDInputID = COPY_OF_ID;
    const addressProofInputID = ADDRESS_PROOF;
    const directorsProofInputID = PROOF_OF_DIRECTORS;
    const codiceFiscaleInputID = CODICE_FISCALE;

    const defaultValues: Record<string, FileObject[]> = {
        [copyOfIDInputID]: Array.isArray(reimbursementAccountDraft?.[copyOfIDInputID]) ? (reimbursementAccountDraft?.[copyOfIDInputID] ?? []) : [],
        [addressProofInputID]: Array.isArray(reimbursementAccountDraft?.[addressProofInputID]) ? (reimbursementAccountDraft?.[addressProofInputID] ?? []) : [],
        [directorsProofInputID]: Array.isArray(reimbursementAccountDraft?.[directorsProofInputID]) ? (reimbursementAccountDraft?.[directorsProofInputID] ?? []) : [],
        [codiceFiscaleInputID]: Array.isArray(reimbursementAccountDraft?.[codiceFiscaleInputID]) ? (reimbursementAccountDraft?.[codiceFiscaleInputID] ?? []) : [],
    };

    const [uploadedIDs, setUploadedID] = useState<FileObject[]>(defaultValues[copyOfIDInputID]);
    const [uploadedProofsOfAddress, setUploadedProofOfAddress] = useState<FileObject[]>(defaultValues[addressProofInputID]);
    const [uploadedProofsOfDirectors, setUploadedProofsOfDirectors] = useState<FileObject[]>(defaultValues[directorsProofInputID]);
    const [uploadedCodiceFiscale, setUploadedCodiceFiscale] = useState<FileObject[]>(defaultValues[codiceFiscaleInputID]);

    useEffect(() => {
        getEnvironmentURL().then(setEnvironmentUrl);
    }, []);

    const STEP_FIELDS = useMemo(
        (): Array<FormOnyxKeys<'reimbursementAccount'>> => [copyOfIDInputID, addressProofInputID, directorsProofInputID, codiceFiscaleInputID],
        [copyOfIDInputID, addressProofInputID, directorsProofInputID, codiceFiscaleInputID],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            setIsPDSandFSGDownloadedTouched(true);
            return getFieldRequiredErrors(values, STEP_FIELDS);
        },
        [STEP_FIELDS],
    );

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
                            handleSelectFile(files, uploadedIDs, copyOfIDInputID, setUploadedID);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedIDs, copyOfIDInputID, setUploadedID);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedIDs}
                        inputID={copyOfIDInputID}
                        setError={(error) => {
                            setUploadError(error, copyOfIDInputID);
                        }}
                        fileLimit={1}
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
                            handleSelectFile(files, uploadedProofsOfAddress, addressProofInputID, setUploadedProofOfAddress);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofsOfAddress, addressProofInputID, setUploadedProofOfAddress);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedProofsOfAddress}
                        inputID={addressProofInputID}
                        setError={(error) => {
                            setUploadError(error, addressProofInputID);
                        }}
                        fileLimit={1}
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
                            handleSelectFile(files, uploadedProofsOfDirectors, directorsProofInputID, setUploadedProofsOfDirectors);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedProofsOfDirectors, directorsProofInputID, setUploadedProofsOfDirectors);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedProofsOfDirectors}
                        inputID={directorsProofInputID}
                        setError={(error) => {
                            setUploadError(error, directorsProofInputID);
                        }}
                        fileLimit={1}
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
                            handleSelectFile(files, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
                        }}
                        onRemove={(fileName) => {
                            handleRemoveFile(fileName, uploadedCodiceFiscale, codiceFiscaleInputID, setUploadedCodiceFiscale);
                        }}
                        acceptedFileTypes={[...CONST.NON_USD_BANK_ACCOUNT.ALLOWED_FILE_TYPES]}
                        value={uploadedCodiceFiscale}
                        inputID={codiceFiscaleInputID}
                        setError={(error) => {
                            setUploadError(error, codiceFiscaleInputID);
                        }}
                        fileLimit={1}
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
