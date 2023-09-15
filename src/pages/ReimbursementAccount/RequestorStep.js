import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
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
import StepPropTypes from './StepPropTypes';
import useLocalize from '../../hooks/useLocalize';

const {reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, getDefaultStateForField} = StepPropTypes;

const propTypes = {
    ...{reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, getDefaultStateForField},

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

const STYLES = {
    Label: [styles.flex1, styles.pr1],
    Form: [styles.mh5, styles.flexGrow1],
    LearnMoreContainer: [styles.mb5, styles.mt1, styles.dFlex, styles.flexRow],
    LearnMoreLink: [styles.textMicro],
    LearnMoreSeparator: [styles.textMicroSupporting],
    DataSafeLink: [styles.textMicro, styles.textLink],
    ControllingOfficerCheckbox: [styles.mt4],
    ConditionsContainer: [styles.mt3, styles.textMicroSupporting],
    ConditionsLink: [styles.textMicro],
};

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

function InnerRequestorStep({reimbursementAccount, shouldShowOnfido, reimbursementAccountDraft, onBackButtonPress, getDefaultStateForField}, ref) {
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
                bankAccountID: lodashGet(reimbursementAccount, 'achData.bankAccountID', 0),
                ...values,
            };

            BankAccounts.updatePersonalInformationForBankAccount(payload);
        },
        [reimbursementAccount],
    );

    const LabelComponent = useCallback(
        () => (
            <View style={STYLES.Label}>
                <Text>{translate('requestorStep.isControllingOfficer')}</Text>
            </View>
        ),
        [translate],
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
                style={STYLES.Form}
                scrollContextEnabled
            >
                <Text>{translate('requestorStep.subtitle')}</Text>
                <View style={STYLES.LearnMoreContainer}>
                    <TextLink
                        style={STYLES.LearnMoreLink}
                        // eslint-disable-next-line max-len
                        href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account"
                    >
                        {translate('requestorStep.learnMore')}
                    </TextLink>
                    <Text style={STYLES.LearnMoreSeparator}>{' | '}</Text>
                    <TextLink
                        style={STYLES.DataSafeLink}
                        href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information"
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
                    LabelComponent={LabelComponent}
                    style={STYLES.ControllingOfficerCheckbox}
                    shouldSaveDraft
                />
                <Text style={STYLES.ConditionsContainer}>
                    {translate('requestorStep.onFidoConditions')}
                    <TextLink
                        href="https://onfido.com/facial-scan-policy-and-release/"
                        style={STYLES.ConditionsLink}
                    >
                        {translate('onfidoStep.facialScan')}
                    </TextLink>
                    {', '}
                    <TextLink
                        href="https://onfido.com/privacy/"
                        style={STYLES.ConditionsLink}
                    >
                        {translate('common.privacy')}
                    </TextLink>
                    {` ${translate('common.and')} `}
                    <TextLink
                        href="https://onfido.com/terms-of-service/"
                        style={STYLES.ConditionsLink}
                    >
                        {translate('common.termsOfService')}
                    </TextLink>
                </Text>
            </Form>
        </ScreenWrapper>
    );
}

const RequestorStep = React.forwardRef(InnerRequestorStep);

RequestorStep.propTypes = propTypes;
RequestorStep.displayName = 'RequestorStep';

export default RequestorStep;
