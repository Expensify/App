import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styles from '../../styles/styles';
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
import useLocalize from '../../hooks/useLocalize';
import {reimbursementAccountPropTypes} from './reimbursementAccountPropTypes';

const propTypes = {
    onBackButtonPress: PropTypes.func.isRequired,
    getDefaultStateForField: PropTypes.func.isRequired,
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

const REQUIRED_FIELDS = ['firstName', 'lastName', 'dob', 'ssnLast4', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState', 'requestorAddressZipCode'];
const INPUT_KEYS = {
    firstName: 'firstName',
    lastName: 'lastName',
    dob: 'dob',
    ssnLast4: 'ssnLast4',
    street: 'requestorAddressStreet',
    city: 'requestorAddressCity',
    state: 'requestorAddressState',
    zipCode: 'requestorAddressZipCode',
};
const STEP_COUNTER = {step: 3, total: 5};

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

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

function RequestorStep({reimbursementAccount, shouldShowOnfido, onBackButtonPress, getDefaultStateForField}) {
    const {translate} = useLocalize();

    const defaultValues = useMemo(
        () => ({
            firstName: getDefaultStateForField(INPUT_KEYS.firstName),
            lastName: getDefaultStateForField(INPUT_KEYS.lastName),
            street: getDefaultStateForField(INPUT_KEYS.street),
            city: getDefaultStateForField(INPUT_KEYS.city),
            state: getDefaultStateForField(INPUT_KEYS.state),
            zipCode: getDefaultStateForField(INPUT_KEYS.zipCode),
            dob: getDefaultStateForField(INPUT_KEYS.dob),
            ssnLast4: getDefaultStateForField(INPUT_KEYS.ssnLast4),
        }),
        [getDefaultStateForField],
    );

    const submit = useCallback(
        (values) => {
            const payload = {
                bankAccountID: _.get(reimbursementAccount, 'achData.bankAccountID', 0),
                ...values,
            };

            BankAccounts.updatePersonalInformationForBankAccount(payload);
        },
        [reimbursementAccount],
    );

    const renderLabelComponent = () => (
        <View style={[styles.flex1, styles.pr1]}>
            <Text>{translate('requestorStep.isControllingOfficer')}</Text>
        </View>
    );

    if (shouldShowOnfido) {
        return (
            <RequestorOnfidoStep
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={RequestorStep.displayName}
        >
            <HeaderWithBackButton
                title={translate('requestorStep.headerTitle')}
                stepCounter={STEP_COUNTER}
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
                        href={CONST.BANK_ACCOUNT_PERSONAL_DOCUMENTATION_INFO_URL}
                    >
                        {translate('requestorStep.learnMore')}
                    </TextLink>
                    <Text style={[styles.textMicroSupporting]}>{' | '}</Text>
                    <TextLink
                        style={[styles.textMicro, styles.textLink]}
                        href={CONST.PERSONAL_DATA_PROTECTION_INFO_URL}
                    >
                        {translate('requestorStep.isMyDataSafe')}
                    </TextLink>
                </View>
                <IdentityForm
                    translate={translate}
                    defaultValues={defaultValues}
                    inputKeys={INPUT_KEYS}
                    shouldSaveDraft
                />
                <CheckboxWithLabel
                    accessibilityLabel={translate('requestorStep.isControllingOfficer')}
                    inputID="isControllingOfficer"
                    defaultValue={getDefaultStateForField('isControllingOfficer', false)}
                    LabelComponent={renderLabelComponent}
                    style={[styles.mt4]}
                    shouldSaveDraft
                />
                <Text style={[styles.mt3, styles.textMicroSupporting]}>
                    {translate('requestorStep.onFidoConditions')}
                    <TextLink
                        href={CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}
                        style={[styles.textMicro]}
                    >
                        {translate('onfidoStep.facialScan')}
                    </TextLink>
                    {', '}
                    <TextLink
                        href={CONST.ONFIDO_PRIVACY_POLICY_URL}
                        style={[styles.textMicro]}
                    >
                        {translate('common.privacy')}
                    </TextLink>
                    {` ${translate('common.and')} `}
                    <TextLink
                        href={CONST.ONFIDO_TERMS_OF_SERVICE_URL}
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
RequestorStep.displayName = 'RequestorStep';

export default React.forwardRef(RequestorStep);
