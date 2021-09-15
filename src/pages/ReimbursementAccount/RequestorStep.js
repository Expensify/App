import React from 'react';
import lodashGet from 'lodash/get';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
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
    setupWithdrawalAccount,
    showBankAccountErrorModal,
    updateReimbursementAccountDraft,
} from '../../libs/actions/BankAccounts';
import Button from '../../components/Button';
import IdentityForm from './IdentityForm';
import {isValidIdentity} from '../../libs/ValidationUtils';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import {getDefaultStateForField} from '../../libs/ReimbursementAccountUtils';

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
            showBankAccountErrorModal(this.props.translate('requestorStep.isControllingOfficerError'));
            return false;
        }

        if (!isValidIdentity({
            street: this.state.requestorAddressStreet,
            state: this.state.requestorAddressState,
            zipCode: this.state.requestorAddressZipCode,
            dob: this.state.dob,
            ssnLast4: this.state.ssnLast4,
        })) {
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
        const shouldDisableSubmitButton = this.requiredFields
            .reduce((acc, curr) => acc || !this.state[curr].trim(), false) || !this.state.isControllingOfficer;

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
                                    onPress={() => this.setState((prevState) => {
                                        const newState = {isControllingOfficer: !prevState.isControllingOfficer};
                                        updateReimbursementAccountDraft(newState);
                                        return newState;
                                    })}
                                    LabelComponent={() => (
                                        <View style={[styles.flex1, styles.pr1]}>
                                            <Text>
                                                {this.props.translate('requestorStep.isControllingOfficer')}
                                            </Text>
                                        </View>
                                    )}
                                    style={[styles.mt4]}
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
                                    isDisabled={shouldDisableSubmitButton}
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
