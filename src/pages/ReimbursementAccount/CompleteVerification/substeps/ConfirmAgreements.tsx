import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type ConfirmAgreementsOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type ConfirmAgreementsProps = SubStepProps & ConfirmAgreementsOnyxProps;

const COMPLETE_VERIFICATION_KEYS = INPUT_IDS.COMPLETE_VERIFICATION;
const STEP_FIELDS = [
    INPUT_IDS.COMPLETE_VERIFICATION.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT,
    INPUT_IDS.COMPLETE_VERIFICATION.ACCEPT_TERMS_AND_CONDITIONS,
    INPUT_IDS.COMPLETE_VERIFICATION.CERTIFY_TRUE_INFORMATION,
];

function IsAuthorizedToUseBankAccountLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('completeVerificationStep.isAuthorizedToUseBankAccount')}</Text>;
}

function CertifyTrueAndAccurateLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('completeVerificationStep.certifyTrueAndAccurate')}</Text>;
}

function TermsAndConditionsLabel() {
    const {translate} = useLocalize();
    return (
        <Text>
            {translate('common.iAcceptThe')}
            <TextLink href={CONST.ACH_TERMS_URL}>{translate('completeVerificationStep.termsAndConditions')}</TextLink>
        </Text>
    );
}

function ConfirmAgreements({onNext, reimbursementAccount}: ConfirmAgreementsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultValues = {
        isAuthorizedToUseBankAccount: reimbursementAccount?.achData?.isAuthorizedToUseBankAccount ?? false,
        certifyTrueInformation: reimbursementAccount?.achData?.certifyTrueInformation ?? false,
        acceptTermsAndConditions: reimbursementAccount?.achData?.acceptTermsAndConditions ?? false,
    };
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (!ValidationUtils.isRequiredFulfilled(values.acceptTermsAndConditions)) {
                errors.acceptTermsAndConditions = translate('common.error.acceptTerms');
            }

            if (!ValidationUtils.isRequiredFulfilled(values.certifyTrueInformation)) {
                errors.certifyTrueInformation = translate('completeVerificationStep.certifyTrueAndAccurateError');
            }

            if (!ValidationUtils.isRequiredFulfilled(values.isAuthorizedToUseBankAccount)) {
                errors.isAuthorizedToUseBankAccount = translate('completeVerificationStep.isAuthorizedToUseBankAccountError');
            }

            return errors;
        },
        [translate],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            validate={validate}
            onSubmit={onNext}
            submitButtonText={translate('common.saveAndContinue')}
            style={[styles.mh5, styles.flexGrow1]}
            enabledWhenOffline={false}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('completeVerificationStep.confirmAgreements')}</Text>
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('completeVerificationStep.isAuthorizedToUseBankAccount')}
                inputID={COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT}
                style={styles.mt6}
                LabelComponent={IsAuthorizedToUseBankAccountLabel}
                defaultValue={defaultValues.isAuthorizedToUseBankAccount}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('completeVerificationStep.certifyTrueAndAccurate')}
                inputID={COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION}
                style={styles.mt6}
                LabelComponent={CertifyTrueAndAccurateLabel}
                defaultValue={defaultValues.certifyTrueInformation}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('completeVerificationStep.termsAndConditions')}`}
                inputID={COMPLETE_VERIFICATION_KEYS.ACCEPT_TERMS_AND_CONDITIONS}
                style={styles.mt6}
                LabelComponent={TermsAndConditionsLabel}
                defaultValue={defaultValues.acceptTermsAndConditions}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

ConfirmAgreements.displayName = 'ConfirmAgreements';

export default withOnyx<ConfirmAgreementsProps, ConfirmAgreementsOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(ConfirmAgreements);
