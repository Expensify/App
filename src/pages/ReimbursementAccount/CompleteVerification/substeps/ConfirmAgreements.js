import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,
    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

const validate = (values) => {
    const errors = {};

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

const COMPLETE_VERIFICATION_KEYS = CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY;

function ConfirmAgreements({onNext, reimbursementAccount}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultValues = {
        [COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT]: getDefaultValueForReimbursementAccountField(
            reimbursementAccount,
            COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT,
            false,
        ),
        [COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION]: getDefaultValueForReimbursementAccountField(reimbursementAccount, COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION, false),
        [COMPLETE_VERIFICATION_KEYS.ACCEPT_TERMS_AND_CONDITIONS]: getDefaultValueForReimbursementAccountField(
            reimbursementAccount,
            COMPLETE_VERIFICATION_KEYS.ACCEPT_TERMS_AND_CONDITIONS,
            false,
        ),
    };

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
                onSubmit={onNext}
                submitButtonText={translate('common.saveAndContinue')}
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('completeVerificationStep.isAuthorizedToUseBankAccount')}
                    inputID={COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT}
                    style={styles.mt4}
                    LabelComponent={() => <Text>{translate('completeVerificationStep.isAuthorizedToUseBankAccount')}</Text>}
                    defaultValue={defaultValues[COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT]}
                    shouldSaveDraft
                />
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={translate('completeVerificationStep.certifyTrueAndAccurate')}
                    inputID={COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION}
                    style={styles.mt4}
                    LabelComponent={() => <Text>{translate('completeVerificationStep.certifyTrueAndAccurate')}</Text>}
                    defaultValue={defaultValues[COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION]}
                    shouldSaveDraft
                />
                <InputWrapper
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
                    defaultValue={defaultValues[COMPLETE_VERIFICATION_KEYS.ACCEPT_TERMS_AND_CONDITIONS]}
                    shouldSaveDraft
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

ConfirmAgreements.displayName = 'ConfirmAgreements';
ConfirmAgreements.propTypes = propTypes;
ConfirmAgreements.defaultProps = defaultProps;

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(ConfirmAgreements);
