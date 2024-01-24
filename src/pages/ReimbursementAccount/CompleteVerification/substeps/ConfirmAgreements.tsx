import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type ConfirmAgreementsOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type ConfirmAgreementsProps = SubStepProps & ConfirmAgreementsOnyxProps;

const COMPLETE_VERIFICATION_KEYS = CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY;
const STEP_FIELDS = [
    CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT,
    CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY.ACCEPT_TERMS_AND_CONDITIONS,
    CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY.CERTIFY_TRUE_INFORMATION,
];

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    if (!ValidationUtils.isRequiredFulfilled(values.acceptTermsAndConditions)) {
        errors.acceptTermsAndConditions = 'common.error.acceptTerms';
    }

    if (!ValidationUtils.isRequiredFulfilled(values.certifyTrueInformation)) {
        errors.certifyTrueInformation = 'completeVerificationStep.certifyTrueAndAccurateError';
    }

    if (!ValidationUtils.isRequiredFulfilled(values.isAuthorizedToUseBankAccount)) {
        errors.isAuthorizedToUseBankAccount = 'completeVerificationStep.isAuthorizedToUseBankAccountError';
    }

    return errors;
};
function ConfirmAgreements({onNext, reimbursementAccount}: ConfirmAgreementsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultValues = {
        isAuthorizedToUseBankAccount: reimbursementAccount?.achData?.isAuthorizedToUseBankAccount ?? false,
        certifyTrueInformation: reimbursementAccount?.achData?.certifyTrueInformation ?? false,
        acceptTermsAndConditions: reimbursementAccount?.achData?.acceptTermsAndConditions ?? false,
    };

    return (
        <ScreenWrapper
            testID={ConfirmAgreements.displayName}
            style={[styles.pt3]}
        >
            <Text style={[styles.textHeadline, styles.ph5, styles.mb3]}>{translate('completeVerificationStep.confirmAgreements')}</Text>
            {/* @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript. */}
            <FormProvider
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                validate={validate}
                onSubmit={onNext}
                submitButtonText={translate('common.saveAndContinue')}
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('completeVerificationStep.isAuthorizedToUseBankAccount')}
                    inputID={COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT}
                    style={styles.mt4}
                    LabelComponent={() => <Text>{translate('completeVerificationStep.isAuthorizedToUseBankAccount')}</Text>}
                    defaultValue={defaultValues.isAuthorizedToUseBankAccount}
                    shouldSaveDraft
                />
                <InputWrapper
                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('completeVerificationStep.certifyTrueAndAccurate')}
                    inputID={COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION}
                    style={styles.mt4}
                    LabelComponent={() => <Text>{translate('completeVerificationStep.certifyTrueAndAccurate')}</Text>}
                    defaultValue={defaultValues.certifyTrueInformation}
                    shouldSaveDraft
                />
                <InputWrapper
                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('completeVerificationStep.termsAndConditions')}`}
                    inputID={COMPLETE_VERIFICATION_KEYS.ACCEPT_TERMS_AND_CONDITIONS}
                    style={styles.mt4}
                    LabelComponent={() => (
                        <Text>
                            {translate('common.iAcceptThe')}
                            <TextLink href="https://use.expensify.com/achterms">{`${translate('completeVerificationStep.termsAndConditions')}`}</TextLink>
                        </Text>
                    )}
                    defaultValue={defaultValues.acceptTermsAndConditions}
                    shouldSaveDraft
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

ConfirmAgreements.displayName = 'ConfirmAgreements';

export default withOnyx<ConfirmAgreementsProps, ConfirmAgreementsOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(ConfirmAgreements);
