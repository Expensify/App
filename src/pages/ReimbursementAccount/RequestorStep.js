import React from 'react';
import lodashGet from 'lodash/get';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import {
    showBankAccountErrorModal,
    goToWithdrawalAccountSetupStep,
    setBankAccountFormValidationErrors,
    setupWithdrawalAccount,
    updateReimbursementAccountDraft,
} from '../../libs/actions/BankAccounts';
import Button from '../../components/Button';
import IdentityForm from './IdentityForm';
import {isRequiredFulfilled, validateIdentity} from '../../libs/ValidationUtils';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Error set when handling the API response */
        error: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class RequestorStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);

        this.state = {
            firstName: ReimbursementAccountUtils.getDefaultStateForField(props, 'firstName'),
            lastName: ReimbursementAccountUtils.getDefaultStateForField(props, 'lastName'),
            requestorAddressStreet: ReimbursementAccountUtils.getDefaultStateForField(props, 'requestorAddressStreet'),
            requestorAddressCity: ReimbursementAccountUtils.getDefaultStateForField(props, 'requestorAddressCity'),
            requestorAddressState: ReimbursementAccountUtils.getDefaultStateForField(props, 'requestorAddressState'),
            requestorAddressZipCode: ReimbursementAccountUtils.getDefaultStateForField(props, 'requestorAddressZipCode'),
            dob: ReimbursementAccountUtils.getDefaultStateForField(props, 'dob'),
            ssnLast4: ReimbursementAccountUtils.getDefaultStateForField(props, 'ssnLast4'),
            isControllingOfficer: ReimbursementAccountUtils.getDefaultStateForField(props, 'isControllingOfficer', false),
            onfidoData: lodashGet(props, ['achData', 'onfidoData'], ''),
            isOnfidoSetupComplete: lodashGet(props, ['achData', 'isOnfidoSetupComplete'], false),
        };

        // Required fields not validated by `validateIdentity`
        this.requiredFields = [
            'firstName',
            'lastName',
            'isControllingOfficer',
        ];

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            firstName: 'bankAccount.error.firstName',
            lastName: 'bankAccount.error.lastName',
            isControllingOfficer: 'requestorStep.isControllingOfficerError',
        };

        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
    }

    onFieldChange(field, value) {
        const renamedFields = {
            street: 'requestorAddressStreet',
            city: 'requestorAddressCity',
            state: 'requestorAddressState',
            zipCode: 'requestorAddressZipCode',
        };
        const fieldName = lodashGet(renamedFields, field, field);
        const newState = {[fieldName]: value};
        this.setState(newState);
        updateReimbursementAccountDraft(newState);

        this.clearError(field);
    }

    getErrors() {
        return lodashGet(this.props, ['reimbursementAccount', 'errors'], {});
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        const renamedFields = {
            street: 'requestorAddressStreet',
            city: 'requestorAddressCity',
            state: 'requestorAddressState',
            zipCode: 'requestorAddressZipCode',
        };
        const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
        const newState = {[renamedInputKey]: value};
        this.setState(newState);
        updateReimbursementAccountDraft(newState);

        // Errors are stored using IdentityForm field names (no renaming)
        const errors = this.getErrors();
        if (!errors[inputKey]) {
            // No error found for this inputKey
            return;
        }

        // Clear the existing error for this inputKey
        const newErrors = {...errors};
        delete newErrors[inputKey];
        setBankAccountFormValidationErrors(newErrors);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = validateIdentity({
            street: this.state.requestorAddressStreet,
            state: this.state.requestorAddressState,
            city: this.state.requestorAddressCity,
            zipCode: this.state.requestorAddressZipCode,
            dob: this.state.dob,
            ssnLast4: this.state.ssnLast4,
        });

        _.each(this.requiredFields, (inputKey) => {
            if (!isRequiredFulfilled(this.state[inputKey])) {
                errors[inputKey] = this.props.translate(this.errorTranslationKeys[inputKey]);
            }
        });
        if (_.size(errors)) {
            setBankAccountFormValidationErrors(errors);
            showBankAccountErrorModal();
            return false;
        }
        return true;
    }

    submit() {
        if (!this.validate()) {
            return;
        }
        setupWithdrawalAccount({...this.state});
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('requestorStep.headerTitle')}
                    shouldShowBackButton
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {this.props.achData.useOnfido && this.props.achData.sdkToken ? (
                    <Onfido
                        sdkToken={this.props.achData.sdkToken}
                        onUserExit={() => {
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                        }}
                        onSuccess={(onfidoData) => {
                            this.setState({
                                onfidoData,
                                isOnfidoSetupComplete: true,
                            }, this.submit);
                        }}
                    />
                ) : (
                    <>
                        <ScrollView style={[styles.flex1, styles.w100]} contentContainerStyle={styles.flexGrow1}>
                            <View style={[styles.p4]}>
                                <Text>{this.props.translate('requestorStep.subtitle')}</Text>
                                <View style={[styles.mb5, styles.mt1, styles.dFlex, styles.flexRow]}>
                                    <TextLink
                                        style={[styles.textMicro]}
                                        // eslint-disable-next-line max-len
                                        href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account"
                                    >
                                        {`${this.props.translate('requestorStep.learnMore')}`}
                                    </TextLink>
                                    <Text style={[styles.textMicroSupporting]}>{' | '}</Text>
                                    <TextLink
                                        style={[styles.textMicro, styles.textLink]}
                                        // eslint-disable-next-line max-len
                                        href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information"
                                    >
                                        {`${this.props.translate('requestorStep.isMyDataSafe')}`}
                                    </TextLink>
                                </View>
                                <IdentityForm
                                    onFieldChange={this.clearErrorAndSetValue}
                                    values={{
                                        firstName: this.state.firstName,
                                        lastName: this.state.lastName,
                                        street: this.state.requestorAddressStreet,
                                        city: this.state.requestorAddressCity,
                                        state: this.state.requestorAddressState,
                                        zipCode: this.state.requestorAddressZipCode,
                                        dob: this.state.dob,
                                        ssnLast4: this.state.ssnLast4,
                                    }}
                                    errors={this.props.reimbursementAccount.errors}
                                />
                                <CheckboxWithLabel
                                    isChecked={this.state.isControllingOfficer}
                                    onPress={() => {
                                        this.setState((prevState) => {
                                            const newState = {isControllingOfficer: !prevState.isControllingOfficer};
                                            updateReimbursementAccountDraft(newState);
                                            return newState;
                                        });
                                        this.clearError('isControllingOfficer');
                                    }}
                                    LabelComponent={() => (
                                        <View style={[styles.flex1, styles.pr1]}>
                                            <Text>
                                                {this.props.translate('requestorStep.isControllingOfficer')}
                                            </Text>
                                        </View>
                                    )}
                                    style={[styles.mt4]}
                                    hasError={Boolean(this.getErrors().isControllingOfficer)}
                                    errorText={this.getErrors().isControllingOfficer || ''}
                                />
                                <Text style={[styles.textMicroSupporting, styles.mt5]}>
                                    {this.props.translate('requestorStep.financialRegulations')}
                                </Text>
                                <Text style={[styles.mt3, styles.textMicroSupporting]}>
                                    {this.props.translate('requestorStep.onFidoConditions')}
                                    <TextLink
                                        style={styles.textMicro}
                                        href="https://onfido.com/facial-scan-policy-and-release/"
                                    >
                                        {`${this.props.translate('requestorStep.onFidoFacialScan')}`}
                                    </TextLink>
                                    {', '}
                                    <TextLink
                                        style={styles.textMicro}
                                        href="https://onfido.com/privacy/"
                                    >
                                        {`${this.props.translate('common.privacyPolicy')}`}
                                    </TextLink>
                                    {` ${this.props.translate('common.and')} `}
                                    <TextLink
                                        style={styles.textMicro}
                                        href="https://onfido.com/terms-of-service/"
                                    >
                                        {`${this.props.translate('common.termsOfService')}`}
                                    </TextLink>
                                </Text>
                            </View>
                            <View style={[styles.flex1, styles.justifyContentEnd, styles.ph4, styles.pb4]}>
                                <Button
                                    success
                                    onPress={this.submit}
                                    style={[styles.w100, styles.mt4]}
                                    text={this.props.translate('common.saveAndContinue')}
                                />
                            </View>
                        </ScrollView>
                    </>
                )}
            </>
        );
    }
}

RequestorStep.propTypes = propTypes;
RequestorStep.displayName = 'RequestorStep';

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
    }),
)(RequestorStep);
