import React, {useCallback, useMemo} from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isRequiredFulfilled} from '@libs/ValidationUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmAgreementsProps = SubStepProps;

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
    return <RenderHTML html={translate('common.acceptTermsAndConditions')} />;
}

function ConfirmAgreements({onNext}: ConfirmAgreementsProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const confirmAgreementsValues = useMemo(
        () => getSubStepValues(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount),
        [reimbursementAccount, reimbursementAccountDraft],
    );
    const defaultValues = {
        isAuthorizedToUseBankAccount: confirmAgreementsValues.isAuthorizedToUseBankAccount ?? false,
        certifyTrueInformation: confirmAgreementsValues.certifyTrueInformation ?? false,
        acceptTermsAndConditions: confirmAgreementsValues.acceptTermsAndConditions ?? false,
    };
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (!isRequiredFulfilled(values.acceptTermsAndConditions)) {
                errors.acceptTermsAndConditions = translate('common.error.acceptTerms');
            }

            if (!isRequiredFulfilled(values.certifyTrueInformation)) {
                errors.certifyTrueInformation = translate('completeVerificationStep.certifyTrueAndAccurateError');
            }

            if (!isRequiredFulfilled(values.isAuthorizedToUseBankAccount)) {
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

export default ConfirmAgreements;
