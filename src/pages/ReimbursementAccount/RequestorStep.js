import React, {useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import withLocalize from '../../components/withLocalize';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import IdentityForm from './IdentityForm';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import RequestorOnfidoStep from './RequestorOnfidoStep';
import Form from '../../components/Form';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

const validate = (values) => {
    const requiredFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState', 'requestorAddressZipCode'];
    const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

    if (values.dob) {
        if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.dob';
        } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.age';
        }
    }

    if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
        errors.ssnLast4 = 'bankAccount.error.ssnLast4';
    }

    if (values.requestorAddressStreet && !ValidationUtils.isValidAddress(values.requestorAddressStreet)) {
        errors.requestorAddressStreet = 'bankAccount.error.addressStreet';
    }

    if (values.requestorAddressZipCode && !ValidationUtils.isValidZipCode(values.requestorAddressZipCode)) {
        errors.requestorAddressZipCode = 'bankAccount.error.zipCode';
    }

    if (!ValidationUtils.isRequiredFulfilled(values.isControllingOfficer)) {
        errors.isControllingOfficer = 'requestorStep.isControllingOfficerError';
    }

    return errors;
};

function RequestorStep({reimbursementAccount, shouldShowOnfido, reimbursementAccountDraft, onBackButtonPress, getDefaultStateForField, translate}) {
    const submit = useCallback(
        (values) => {
            const payload = {
                bankAccountID: lodashGet(reimbursementAccount, 'achData.bankAccountID') || 0,
                ...values,
            };

            BankAccounts.updatePersonalInformationForBankAccount(payload);
        },
        [reimbursementAccount],
    );

    if (shouldShowOnfido)
        return (
            <RequestorOnfidoStep
                reimbursementAccount={reimbursementAccount}
                reimbursementAccountDraft={reimbursementAccountDraft}
                onBackButtonPress={onBackButtonPress}
                getDefaultStateForField={getDefaultStateForField}
            />
        );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('requestorStep.headerTitle')}
                stepCounter={{step: 3, total: 5}}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={onBackButtonPress}
                shouldShowGetAssistanceButton
            />
            <Form
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                submitButtonText={translate('common.saveAndContinue')}
                validate={validate}
                onSubmit={submit}
                style={[styles.mh5, styles.flexGrow1]}
                scrollContextEnabled
            >
                <Text>{translate('requestorStep.subtitle')}</Text>
                <View style={[styles.mb5, styles.mt1, styles.dFlex, styles.flexRow]}>
                    <TextLink
                        style={[styles.textMicro]}
                        // eslint-disable-next-line max-len
                        href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account"
                    >
                        {`${translate('requestorStep.learnMore')}`}
                    </TextLink>
                    <Text style={[styles.textMicroSupporting]}>{' | '}</Text>
                    <TextLink
                        style={[styles.textMicro, styles.textLink]}
                        href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information"
                    >
                        {`${translate('requestorStep.isMyDataSafe')}`}
                    </TextLink>
                </View>
                <IdentityForm
                    translate={translate}
                    defaultValues={{
                        firstName: getDefaultStateForField('firstName'),
                        lastName: getDefaultStateForField('lastName'),
                        street: getDefaultStateForField('requestorAddressStreet'),
                        city: getDefaultStateForField('requestorAddressCity'),
                        state: getDefaultStateForField('requestorAddressState'),
                        zipCode: getDefaultStateForField('requestorAddressZipCode'),
                        dob: getDefaultStateForField('dob'),
                        ssnLast4: getDefaultStateForField('ssnLast4'),
                    }}
                    inputKeys={{
                        firstName: 'firstName',
                        lastName: 'lastName',
                        dob: 'dob',
                        ssnLast4: 'ssnLast4',
                        street: 'requestorAddressStreet',
                        city: 'requestorAddressCity',
                        state: 'requestorAddressState',
                        zipCode: 'requestorAddressZipCode',
                    }}
                    shouldSaveDraft
                />
                <CheckboxWithLabel
                    accessibilityLabel={translate('requestorStep.isControllingOfficer')}
                    inputID="isControllingOfficer"
                    defaultValue={getDefaultStateForField('isControllingOfficer', false)}
                    LabelComponent={() => (
                        <View style={[styles.flex1, styles.pr1]}>
                            <Text>{translate('requestorStep.isControllingOfficer')}</Text>
                        </View>
                    )}
                    style={[styles.mt4]}
                    shouldSaveDraft
                />
                <Text style={[styles.mt3, styles.textMicroSupporting]}>
                    {translate('requestorStep.onFidoConditions')}
                    <TextLink
                        href="https://onfido.com/facial-scan-policy-and-release/"
                        style={[styles.textMicro]}
                    >
                        {translate('onfidoStep.facialScan')}
                    </TextLink>
                    {', '}
                    <TextLink
                        href="https://onfido.com/privacy/"
                        style={[styles.textMicro]}
                    >
                        {translate('common.privacy')}
                    </TextLink>
                    {` ${translate('common.and')} `}
                    <TextLink
                        href="https://onfido.com/terms-of-service/"
                        style={[styles.textMicro]}
                    >
                        {translate('common.termsOfService')}
                    </TextLink>
                </Text>
            </Form>
        </ScreenWrapper>
    );
}

RequestorStep.propTypes = propTypes;

export default withLocalize(RequestorStep);
