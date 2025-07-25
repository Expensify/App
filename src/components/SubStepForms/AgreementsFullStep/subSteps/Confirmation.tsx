import React, {useCallback, useMemo} from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isRequiredFulfilled} from '@libs/ValidationUtils';
import requiresDocusignStep from '@pages/ReimbursementAccount/NonUSD/utils/requiresDocusignStep';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

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
    return (
        <Text>
            {translate('common.iAcceptThe')}
            <TextLink href="https://cross-border.corpay.com/tc/">{`${translate('agreementsStep.termsAndConditions')}`}</TextLink>.
        </Text>
    );
}

function ConsentToPrivacyNoticeLabel() {
    const {translate} = useLocalize();
    return (
        <Text>
            {translate('agreementsStep.iConsentToThe')} <TextLink href="https://payments.corpay.com/compliance">{`${translate('agreementsStep.privacyNotice')}`}</TextLink>.
        </Text>
    );
}

type ConfirmationProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    policyCurrency: string | undefined;

    /** The ID of the form */
    formID: TFormID;

    /** Input IDs for field in the form */
    inputIDs: {
        provideTruthfulInformation: FormOnyxKeys<TFormID>;
        agreeToTermsAndConditions: FormOnyxKeys<TFormID>;
        consentToPrivacyNotice: FormOnyxKeys<TFormID>;
        authorizedToBindClientToAgreement: FormOnyxKeys<TFormID>;
    };
};

function Confirmation<TFormID extends keyof OnyxFormValuesMapping>({onNext, policyCurrency, formID, inputIDs}: ConfirmationProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const isDocusignStepRequired = requiresDocusignStep(policyCurrency);

    const stepFields = useMemo(
        () => [inputIDs.authorizedToBindClientToAgreement, inputIDs.provideTruthfulInformation, inputIDs.agreeToTermsAndConditions, inputIDs.consentToPrivacyNotice],
        [inputIDs],
    );

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = getFieldRequiredErrors(values, stepFields);

            if (!isRequiredFulfilled(values[inputIDs.authorizedToBindClientToAgreement] as string)) {
                errors[inputIDs.authorizedToBindClientToAgreement] = translate('agreementsStep.error.authorized');
            }

            if (!isRequiredFulfilled(values[inputIDs.provideTruthfulInformation] as string)) {
                errors[inputIDs.provideTruthfulInformation] = translate('agreementsStep.error.certify');
            }

            if (!isRequiredFulfilled(values[inputIDs.agreeToTermsAndConditions] as string)) {
                errors[inputIDs.agreeToTermsAndConditions] = translate('common.error.acceptTerms');
            }

            if (!isRequiredFulfilled(values[inputIDs.consentToPrivacyNotice] as string)) {
                errors[inputIDs.consentToPrivacyNotice] = translate('agreementsStep.error.consent');
            }

            return errors;
        },
        [inputIDs.agreeToTermsAndConditions, inputIDs.authorizedToBindClientToAgreement, inputIDs.consentToPrivacyNotice, inputIDs.provideTruthfulInformation, stepFields, translate],
    );

    return (
        <FormProvider
            formID={formID}
            onSubmit={onNext}
            validate={validate}
            submitButtonText={isDocusignStepRequired ? translate('common.confirm') : translate('agreementsStep.accept')}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('agreementsStep.pleaseConfirm')}</Text>
            {!isDocusignStepRequired && <Text style={[styles.pv3, styles.textSupporting]}>{translate('agreementsStep.regulationRequiresUs')}</Text>}
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('agreementsStep.iAmAuthorized')}
                inputID={inputIDs.authorizedToBindClientToAgreement as string}
                style={styles.mt6}
                LabelComponent={IsAuthorizedToUseBankAccountLabel}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('agreementsStep.iCertify')}
                inputID={inputIDs.provideTruthfulInformation as string}
                style={styles.mt6}
                LabelComponent={CertifyTrueAndAccurateLabel}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('agreementsStep.termsAndConditions')}.`}
                inputID={inputIDs.agreeToTermsAndConditions as string}
                style={styles.mt6}
                LabelComponent={TermsAndConditionsLabel}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={`${translate('agreementsStep.iConsentToThe')} ${translate('agreementsStep.privacyNotice')}.`}
                inputID={inputIDs.consentToPrivacyNotice as string}
                style={styles.mt6}
                LabelComponent={ConsentToPrivacyNoticeLabel}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
