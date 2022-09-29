import _ from 'underscore';
import React from 'react';
import {Image, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';
import exampleCheckImage from './exampleCheckImage';
import ReimbursementAccountForm from './ReimbursementAccountForm';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    ...withLocalizePropTypes,
};

class BankAccountManualStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
        this.state = {
            acceptTerms: ReimbursementAccountUtils.getDefaultStateForField(props, 'acceptTerms', true),
            routingNumber: ReimbursementAccountUtils.getDefaultStateForField(props, 'routingNumber'),
            accountNumber: ReimbursementAccountUtils.getDefaultStateForField(props, 'accountNumber'),
        };

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            routingNumber: 'bankAccount.error.routingNumber',
            accountNumber: 'bankAccount.error.accountNumber',
            acceptTerms: 'common.error.acceptedTerms',
        };
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errorFields = {};
        const routingNumber = this.state.routingNumber.trim();

        if (!CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(this.state.accountNumber.trim())) {
            errorFields.accountNumber = true;
        }
        if (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber)) {
            errorFields.routingNumber = true;
        }
        if (!this.state.acceptTerms) {
            errorFields.acceptTerms = true;
        }

        ReimbursementAccount.setBankAccountFormValidationErrors(errorFields);

        return _.size(errorFields) === 0;
    }

    submit() {
        if (!this.validate()) {
            return;
        }
        BankAccounts.connectBankAccountManually(
            ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0),
            this.state.accountNumber,
            this.state.routingNumber,
            ReimbursementAccountUtils.getDefaultStateForField(this.props, 'plaidMask'),
        );
    }

    /**
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        const newState = {[inputKey]: value};
        this.setState(newState);
        ReimbursementAccount.updateReimbursementAccountDraft(newState);
        ReimbursementAccountUtils.clearError(this.props, inputKey);
    }

    render() {
        const shouldDisableInputs = Boolean(ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID'));

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    stepCounter={{step: 1, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={() => BankAccounts.setBankAccountSubStep(null)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ReimbursementAccountForm onSubmit={this.submit}>
                    <Text style={[styles.mb5]}>
                        {this.props.translate('bankAccount.checkHelpLine')}
                    </Text>
                    <Image
                        resizeMode="contain"
                        style={[styles.exampleCheckImage, styles.mb5]}
                        source={exampleCheckImage(this.props.preferredLocale)}
                    />
                    <TextInput
                        label={this.props.translate('bankAccount.routingNumber')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        defaultValue={this.state.routingNumber}
                        onChangeText={value => this.clearErrorAndSetValue('routingNumber', value)}
                        disabled={shouldDisableInputs}
                        errorText={this.getErrorText('routingNumber')}
                    />
                    <TextInput
                        containerStyles={[styles.mt4]}
                        label={this.props.translate('bankAccount.accountNumber')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        defaultValue={this.state.accountNumber}
                        onChangeText={value => this.clearErrorAndSetValue('accountNumber', value)}
                        disabled={shouldDisableInputs}
                        errorText={this.getErrorText('accountNumber')}
                    />
                    <CheckboxWithLabel
                        style={styles.mt4}
                        isChecked={this.state.acceptTerms}
                        onInputChange={value => this.clearErrorAndSetValue('acceptTerms', value)}
                        LabelComponent={() => (
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <Text>
                                    {this.props.translate('common.iAcceptThe')}
                                </Text>
                                <TextLink href="https://use.expensify.com/terms">
                                    {`Expensify ${this.props.translate('common.termsOfService')}`}
                                </TextLink>
                            </View>
                        )}
                        errorText={this.getErrorText('acceptTerms')}
                    />
                </ReimbursementAccountForm>
            </>
        );
    }
}

BankAccountManualStep.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        // Needed to retrieve errorFields
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
    }),
)(BankAccountManualStep);
