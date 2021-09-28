import React from 'react';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import {
    goToWithdrawalAccountSetupStep,
    hideBankAccountErrors,
    setupWithdrawalAccount,
    showBankAccountErrorModal,
    showBankAccountFormValidationError,
    updateReimbursementAccountDraft,
} from '../../libs/actions/BankAccounts';
import IdentityForm from './IdentityForm';
import {isRequiredFulfilled, isValidIdentity} from '../../libs/ValidationUtils';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import {getDefaultStateForField} from '../../libs/ReimbursementAccountUtils';
import Log from '../../libs/Log';
import Growl from '../../libs/Growl';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import ReimbursementAccountForm from './ReimbursementAccountForm';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class RequestorStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            firstName: getDefaultStateForField(props, 'firstName'),
            lastName: getDefaultStateForField(props, 'lastName'),
            requestorAddressStreet: getDefaultStateForField(props, 'requestorAddressStreet'),
            requestorAddressCity: getDefaultStateForField(props, 'requestorAddressCity'),
            requestorAddressState: getDefaultStateForField(props, 'requestorAddressState'),
            requestorAddressZipCode: getDefaultStateForField(props, 'requestorAddressZipCode'),
            dob: getDefaultStateForField(props, 'dob'),
            ssnLast4: getDefaultStateForField(props, 'ssnLast4'),
            isControllingOfficer: getDefaultStateForField(props, 'isControllingOfficer', false),
            onfidoData: lodashGet(props, ['achData', 'onfidoData'], ''),
            isOnfidoSetupComplete: lodashGet(props, ['achData', 'isOnfidoSetupComplete'], false),
        };

        this.requiredFields = [
            'firstName',
            'lastName',
            'requestorAddressStreet',
            'requestorAddressCity',
            'requestorAddressZipCode',
            'dob',
            'ssnLast4',
            'requestorAddressState',
        ];
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
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        if (!this.state.isControllingOfficer) {
            showBankAccountFormValidationError(this.props.translate('requestorStep.isControllingOfficerError'));
            showBankAccountErrorModal();
            return false;
        }

        if (!isValidIdentity({
            street: this.state.requestorAddressStreet,
            state: this.state.requestorAddressState,
            city: this.state.requestorAddressCity,
            zipCode: this.state.requestorAddressZipCode,
            dob: this.state.dob,
            ssnLast4: this.state.ssnLast4,
        })) {
            return false;
        }

        if (!isRequiredFulfilled(this.state.firstName)) {
            showBankAccountFormValidationError(this.props.translate('bankAccount.error.firstName'));
            showBankAccountErrorModal();
            return false;
        }

        if (!isRequiredFulfilled(this.state.lastName)) {
            showBankAccountFormValidationError(this.props.translate('bankAccount.error.lastName'));
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
                    stepCounter={{step: 3, total: 5}}
                    shouldShowBackButton
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {this.props.achData.useOnfido && this.props.achData.sdkToken && !this.state.isOnfidoSetupComplete ? (
                    <Onfido
                        sdkToken={this.props.achData.sdkToken}
                        onUserExit={() => {
                            // We're taking the user back to the company step. They will need to come back to the requestor step to make the Onfido flow appear again.
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                        }}
                        onError={(error) => {
                            // In case of any unexpected error we log it to the server, show a growl, and return the user back to the company step so they can try again.
                            Log.hmmm('Onfido error in RequestorStep', {error});
                            Growl.error(this.props.translate('onfidoStep.genericError'), 10000);
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                        }}
                        onSuccess={(onfidoData) => {
                            this.setState({
                                onfidoData,
                                isOnfidoSetupComplete: true,
                            }, this.submit);
                        }}
                    />
                ) : (
                    <ReimbursementAccountForm
                        onSubmit={this.submit}
                    >
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
                            onFieldChange={(field, value) => this.onFieldChange(field, value)}
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
                            error={this.props.reimbursementAccount.error}
                        />
                        <CheckboxWithLabel
                            isChecked={this.state.isControllingOfficer}
                            onPress={() => {
                                if (this.props.reimbursementAccount.error === this.props.translate('requestorStep.isControllingOfficerError')) {
                                    hideBankAccountErrors();
                                }

                                this.setState((prevState) => {
                                    const newState = {isControllingOfficer: !prevState.isControllingOfficer};
                                    updateReimbursementAccountDraft(newState);
                                    return newState;
                                });
                            }}
                            LabelComponent={() => (
                                <View style={[styles.flex1, styles.pr1]}>
                                    <Text>
                                        {this.props.translate('requestorStep.isControllingOfficer')}
                                    </Text>
                                </View>
                            )}
                            style={[styles.mt4]}
                            hasError={this.props.reimbursementAccount.error === this.props.translate('requestorStep.isControllingOfficerError')}
                            errorText={this.props.reimbursementAccount.error === this.props.translate('requestorStep.isControllingOfficerError')
                                ? this.props.translate('requestorStep.isControllingOfficerError') : ''}
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
                    </ReimbursementAccountForm>
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
