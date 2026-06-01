import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmitCallback from '@hooks/useReimbursementAccountSubmitCallback';
import useThemeStyles from '@hooks/useThemeStyles';
import {getRequiredKYBDocuments} from '@libs/BankAccountUtils';
import {uploadUserKYBDocs} from '@userActions/BankAccounts';
import {clearErrorFields, setDraftValues, setErrorFields} from '@userActions/FormActions';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

type KYBDocumentsProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;
};

function KYBDocuments({onBackButtonPress, onSubmit}: KYBDocumentsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const reimbursementAccountVerificationData = reimbursementAccount?.achData?.verifications?.externalApiResponses;
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isLoading = reimbursementAccount?.isLoading;

    const handleNavigateToConciergeChat = () =>
        navigateToConciergeChat(
            conciergeReportID,
            introSelected,
            currentUserAccountID,
            isSelfTourViewed,
            betas,
            true,
            undefined,
            undefined,
            reimbursementAccount?.achData?.ACHRequestReportActionID,
        );

    const defaultValues = {
        companyTaxID: reimbursementAccountDraft?.companyTaxID ?? [],
        nameChangeDocument: reimbursementAccountDraft?.nameChangeDocument ?? [],
        companyAddressVerification: reimbursementAccountDraft?.companyAddressVerification ?? [],
        userAddressVerification: reimbursementAccountDraft?.userAddressVerification ?? [],
        userDOBVerification: reimbursementAccountDraft?.userDOBVerification ?? [],
    } as Record<string, FileObject[]>;

    const DOCUMENTS_CONFIG = [
        {
            inputID: 'companyTaxID',
            title: 'documentsStep.taxIDVerification',
            description: 'documentsStep.taxIDVerificationDescription',
        },
        {
            inputID: 'nameChangeDocument',
            title: 'documentsStep.nameChangeDocument',
            description: 'documentsStep.nameChangeDocumentDescription',
        },
        {
            inputID: 'companyAddressVerification',
            title: 'documentsStep.companyAddressVerification',
            description: 'documentsStep.companyAddressVerificationDescription',
        },
        {
            inputID: 'userAddressVerification',
            title: 'documentsStep.userAddressVerification',
            description: 'documentsStep.userAddressVerificationDescription',
        },
        {
            inputID: 'userDOBVerification',
            title: 'documentsStep.userDOBVerification',
            description: 'documentsStep.userDOBVerificationDescription',
        },
    ] as const;
    const requiredDocumentInputIDs = getRequiredKYBDocuments(reimbursementAccountVerificationData);
    const requiredDocuments = DOCUMENTS_CONFIG.filter((document) => requiredDocumentInputIDs.includes(document.inputID));

    const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileObject[]>>(defaultValues);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

        for (const document of requiredDocuments) {
            const files = values[document.inputID] as FileObject[] | undefined;
            if (!files || files.length === 0) {
                errors[document.inputID] = translate('common.error.fieldRequired');
            }
        }

        return errors;
    };

    const handleSelectFile = (files: FileObject[], inputID: string) => {
        const updatedFiles = [...uploadedFiles[inputID], ...files];
        setUploadedFiles((prev) => ({...prev, [inputID]: updatedFiles}));
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: updatedFiles});
    };

    const handleRemoveFile = (fileName: string, inputID: string) => {
        const updatedFiles = uploadedFiles[inputID].filter((file) => file.name !== fileName);
        setUploadedFiles((prev) => ({...prev, [inputID]: updatedFiles}));
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: updatedFiles});
    };

    const setUploadError = (error: string, inputID: string) => {
        if (!error) {
            clearErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            return;
        }
        setErrorFields(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[inputID]: {onUpload: error}});
    };

    const markSubmitting = useReimbursementAccountSubmitCallback(onSubmit);

    const submit = useCallback(() => {
        const params: Record<string, FileObject> = {};
        for (const [key, files] of Object.entries(uploadedFiles)) {
            const file = files.at(0);
            if (file) {
                params[key] = file;
            }
        }
        uploadUserKYBDocs({
            ...params,
            bankAccountID,
        });
        markSubmitting();
    }, [uploadedFiles, bankAccountID, markSubmitting]);

    const footer = (
        <Button
            large
            style={[styles.mv3]}
            text={translate('documentsStep.finishViaChat')}
            onPress={handleNavigateToConciergeChat}
            isDisabled={isLoading}
        />
    );

    return (
        <InteractiveStepWrapper
            wrapperID={KYBDocuments.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('documentsStep.subheader')}
            handleBackButtonPress={onBackButtonPress}
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                submitButtonText={translate('common.verify')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                submitButtonStyles={[styles.mb0]}
                enabledWhenOffline={false}
                shouldRenderFooterAboveSubmit
                footerContent={footer}
                isLoading={isLoading}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('documentsStep.beforeYouGo')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('documentsStep.verificationFailed')}</Text>
                {requiredDocuments.map((document, index) => (
                    <View key={document.inputID}>
                        <Text style={[styles.textNormalThemeText, styles.textLineHeightNormal, styles.textStrong, styles.mb3]}>{translate(document.title)}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('common.chooseFile')}
                            uploadedFiles={uploadedFiles[document.inputID]}
                            onUpload={(files) => handleSelectFile(files, document.inputID)}
                            onRemove={(fileName) => handleRemoveFile(fileName, document.inputID)}
                            setError={(error) => setUploadError(error, document.inputID)}
                            fileLimit={CONST.CORPAY_DOCUMENT.FILE_LIMIT}
                            acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                            value={uploadedFiles[document.inputID]}
                            inputID={document.inputID}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt3]}>{translate(document.description)}</Text>
                        {requiredDocuments.length > index + 1 && <View style={[styles.sectionDividerLine, styles.mv6]} />}
                    </View>
                ))}
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

KYBDocuments.displayName = 'KYBDocuments';

export default KYBDocuments;
