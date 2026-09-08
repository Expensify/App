import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues, FormRef} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import UploadFile from '@components/UploadFile';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import requiresDocusignStep from '@pages/ReimbursementAccount/NonUSD/utils/requiresDocusignStep';

import {clearErrorFields, clearErrors, setDraftValues, setErrorFields} from '@userActions/FormActions';

import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

function IsAuthorizedToUseBankAccountLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('agreementsStep.iAmAuthorized')}</Text>;
}

function CertifyTrueAndAccurateLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('agreementsStep.iCertify')}</Text>;
}

function TermsAndConditionsLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={translate('agreementsStep.iAcceptTheTermsAndConditions')} />;
}

function ConsentToPrivacyNoticeLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={translate('agreementsStep.iConsentToThePrivacyNotice')} />;
}

type AgreementsFullStepProps<TFormID extends keyof OnyxFormValuesMapping> = {
    /** Default values for inputs */
    defaultValues: Partial<Record<FormOnyxKeys<TFormID>, boolean>>;

    /** The ID of the form */
    formID: TFormID;

    /** Input IDs for field in the form */
    inputIDs: {
        provideTruthfulInformation: Extract<FormOnyxKeys<TFormID>, string>;
        agreeToTermsAndConditions: Extract<FormOnyxKeys<TFormID>, string>;
        consentToPrivacyNotice: Extract<FormOnyxKeys<TFormID>, string>;
        authorizedToBindClientToAgreement: Extract<FormOnyxKeys<TFormID>, string>;
    };

    /** Indicates that action is being processed */
    isLoading: boolean;

    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Currency of related account */
    currency: string;

    /** Array of step names */
    stepNames?: readonly string[];

    /** Index of currently active step in header */
    startStepIndex: number;

    /** ID of the bank statement file upload input. When provided, a required bank statement upload is rendered. */
    bankStatementInputID?: FormOnyxKeys<TFormID>;

    /** Default value for the bank statement file upload input */
    bankStatementDefaultValue?: FileObject[];
};

function AgreementsFullStep<TFormID extends keyof OnyxFormValuesMapping>({
    defaultValues,
    formID,
    inputIDs,
    isLoading,
    onBackButtonPress,
    onSubmit,
    currency,
    stepNames,
    startStepIndex,
    bankStatementInputID,
    bankStatementDefaultValue,
}: AgreementsFullStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const formRef = useRef<FormRef | null>(null);
    const [uploadedBankStatement, setUploadedBankStatement] = useState<FileObject[]>(bankStatementDefaultValue ?? []);

    const isDocusignStepRequired = requiresDocusignStep(currency);
    const stepFields = useMemo(() => {
        const fields: Array<FormOnyxKeys<TFormID>> = [
            inputIDs.authorizedToBindClientToAgreement,
            inputIDs.provideTruthfulInformation,
            inputIDs.agreeToTermsAndConditions,
            inputIDs.consentToPrivacyNotice,
        ];
        if (bankStatementInputID) {
            fields.push(bankStatementInputID);
        }
        return fields;
    }, [inputIDs.authorizedToBindClientToAgreement, inputIDs.provideTruthfulInformation, inputIDs.agreeToTermsAndConditions, inputIDs.consentToPrivacyNotice, bankStatementInputID]);

    const handleSelectBankStatement = (files: FileObject[]) => {
        if (!bankStatementInputID) {
            return;
        }
        setDraftValues(formID, {[bankStatementInputID]: [...uploadedBankStatement, ...files]});
        setUploadedBankStatement((prev) => [...prev, ...files]);
    };

    const handleRemoveBankStatement = (fileName: string) => {
        if (!bankStatementInputID) {
            return;
        }
        const newUploadedFiles = uploadedBankStatement.filter((file) => file.name !== fileName);
        setDraftValues(formID, {[bankStatementInputID]: newUploadedFiles});
        setUploadedBankStatement(newUploadedFiles);
    };

    const setBankStatementError = (error: string) => {
        if (!bankStatementInputID) {
            return;
        }
        if (!error) {
            clearErrorFields(formID);
            return;
        }
        formRef.current?.resetFormFieldError(String(bankStatementInputID));
        clearErrors(formID);
        setErrorFields(formID, {[bankStatementInputID]: {onUpload: error}});
    };

    const handleBackButtonPress = () => {
        clearErrors(formID);
        onBackButtonPress();
    };

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = getFieldRequiredErrors(values, stepFields, translate);

            if (Object.hasOwn(errors, inputIDs.authorizedToBindClientToAgreement)) {
                errors[inputIDs.authorizedToBindClientToAgreement] = translate('agreementsStep.error.authorized');
            }

            if (Object.hasOwn(errors, inputIDs.provideTruthfulInformation)) {
                errors[inputIDs.provideTruthfulInformation] = translate('agreementsStep.error.certify');
            }

            if (Object.hasOwn(errors, inputIDs.agreeToTermsAndConditions)) {
                errors[inputIDs.agreeToTermsAndConditions] = translate('common.error.acceptTerms');
            }

            if (Object.hasOwn(errors, inputIDs.consentToPrivacyNotice)) {
                errors[inputIDs.consentToPrivacyNotice] = translate('agreementsStep.error.consent');
            }

            return errors;
        },
        [inputIDs.agreeToTermsAndConditions, inputIDs.authorizedToBindClientToAgreement, inputIDs.consentToPrivacyNotice, inputIDs.provideTruthfulInformation, stepFields, translate],
    );

    return (
        <InteractiveStepWrapper
            wrapperID="AgreementsFullStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('agreementsStep.agreements')}
            stepNames={stepNames}
            startStepIndex={startStepIndex}
        >
            <FormProvider
                ref={formRef}
                formID={formID}
                onSubmit={onSubmit}
                validate={validate}
                submitButtonText={isDocusignStepRequired ? translate('common.confirm') : translate('agreementsStep.accept')}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline={false}
                isLoading={isLoading}
            >
                <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('agreementsStep.pleaseConfirm')}</Text>
                {!isDocusignStepRequired && <Text style={[styles.pv3, styles.textSupporting]}>{translate('agreementsStep.regulationRequiresUs')}</Text>}
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('agreementsStep.iAmAuthorized')}
                    inputID={inputIDs.authorizedToBindClientToAgreement}
                    style={styles.mt6}
                    LabelComponent={IsAuthorizedToUseBankAccountLabel}
                    defaultValue={defaultValues[inputIDs.authorizedToBindClientToAgreement]}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('agreementsStep.iCertify')}
                    inputID={inputIDs.provideTruthfulInformation}
                    style={styles.mt6}
                    LabelComponent={CertifyTrueAndAccurateLabel}
                    defaultValue={defaultValues[inputIDs.provideTruthfulInformation]}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('agreementsStep.iAcceptTheTermsAndConditionsAccessibility')}
                    inputID={inputIDs.agreeToTermsAndConditions}
                    style={styles.mt6}
                    LabelComponent={TermsAndConditionsLabel}
                    defaultValue={defaultValues[inputIDs.agreeToTermsAndConditions]}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('agreementsStep.iConsentToThePrivacyNoticeAccessibility')}
                    inputID={inputIDs.consentToPrivacyNotice}
                    style={styles.mt6}
                    LabelComponent={ConsentToPrivacyNoticeLabel}
                    defaultValue={defaultValues[inputIDs.consentToPrivacyNotice]}
                    shouldSaveDraft
                />
                {!!bankStatementInputID && (
                    <>
                        <View style={[styles.sectionDividerLine, styles.mt6, styles.mb6]} />
                        <Text style={[styles.mutedTextLabel, styles.mb3]}>{translate('agreementsStep.bankStatement')}</Text>
                        <InputWrapper
                            InputComponent={UploadFile}
                            buttonText={translate('common.chooseFile')}
                            uploadedFiles={uploadedBankStatement}
                            onUpload={(files) => {
                                handleSelectBankStatement(files);
                            }}
                            onRemove={(fileName) => {
                                handleRemoveBankStatement(fileName);
                            }}
                            acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                            value={uploadedBankStatement}
                            inputID={String(bankStatementInputID)}
                            setError={(error) => {
                                setBankStatementError(error);
                            }}
                            fileLimit={1}
                            maxFileSize={CONST.CORPAY_DOCUMENT.MAX_FILE_SIZE}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt6]}>{translate('agreementsStep.bankStatementDescription')}</Text>
                    </>
                )}
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default AgreementsFullStep;
