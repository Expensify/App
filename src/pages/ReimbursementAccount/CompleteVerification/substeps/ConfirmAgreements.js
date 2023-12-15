import React from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';

const validate = (values) => {
    const errors = {};

    if (!ValidationUtils.isRequiredFulfilled(values.acceptTermsAndConditions)) {
        errors.acceptTermsAndConditions = 'common.error.acceptTerms';
    }

    if (!ValidationUtils.isRequiredFulfilled(values.certifyTrueInformation)) {
        errors.certifyTrueInformation = 'completeVerificationStep.certifyTrueAndAccurateError';
    }

    if (!ValidationUtils.isRequiredFulfilled(values.isControllingOfficer)) {
        errors.isControllingOfficer = 'completeVerificationStep.isControllingOfficerError';
    }

    return errors;
};

function ConfirmAgreements() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            testID={ConfirmAgreements.displayName}
            style={[styles.pt10]}
            scrollEnabled
        >
            <Text style={[styles.textHeadline, styles.ph5, styles.mb3]}>{translate('completeVerificationStep.confirmAgreements')}</Text>
            <FormProvider
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                validate={validate}
                onSubmit={() => {}}
                submitButtonText={translate('common.saveAndContinue')}
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('completeVerificationStep.isControllingOfficer')}
                    inputID="isControllingOfficer"
                    style={styles.mt4}
                    LabelComponent={() => <Text>{translate('completeVerificationStep.isControllingOfficer')}</Text>}
                    defaultValue={false}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('completeVerificationStep.certifyTrueAndAccurate')}
                    inputID="certifyTrueInformation"
                    style={styles.mt4}
                    LabelComponent={() => <Text>{translate('completeVerificationStep.certifyTrueAndAccurate')}</Text>}
                    defaultValue={false}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('completeVerificationStep.termsAndConditions')}`}
                    inputID="acceptTermsAndConditions"
                    style={styles.mt4}
                    LabelComponent={() => (
                        <Text>
                            {translate('common.iAcceptThe')}
                            <TextLink href="https://use.expensify.com/achterms">{`${translate('completeVerificationStep.termsAndConditions')}`}</TextLink>
                        </Text>
                    )}
                    defaultValue={false}
                    shouldSaveDraft
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

ConfirmAgreements.displayName = 'ConfirmAgreements';

export default ConfirmAgreements;
