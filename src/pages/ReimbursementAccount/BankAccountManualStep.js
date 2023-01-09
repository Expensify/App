import React from 'react';
import {Image, View} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import withLocalize from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import exampleCheckImage from './exampleCheckImage';
import Form from '../../components/Form';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,
};

class BankAccountManualStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
        this.getDefaultStateForField = this.getDefaultStateForField.bind(this);
    }

    /**
     * @param {String} fieldName
     * @param {*} defaultValue
     *
     * @returns {*}
     */
    getDefaultStateForField(fieldName, defaultValue = '') {
        return ReimbursementAccountUtils.getDefaultStateForField(this.props.reimbursementAccountDraft, this.props.reimbursementAccount, fieldName, defaultValue);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    validate(values) {
        const errorFields = {};
        const routingNumber = values.routingNumber && values.routingNumber.trim();

        if (
            !values.accountNumber
            || (!CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) && !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim()))
        ) {
            errorFields.accountNumber = this.props.translate('bankAccount.error.accountNumber');
        }
        if (!routingNumber || !CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber)) {
            errorFields.routingNumber = this.props.translate('bankAccount.error.routingNumber');
        }
        if (!values.acceptedTerms) {
            errorFields.acceptedTerms = this.props.translate('common.error.acceptedTerms');
        }

        return errorFields;
    }

    submit(values) {
        BankAccounts.connectBankAccountManually(
            this.getDefaultStateForField('bankAccountID', 0),
            values.accountNumber,
            values.routingNumber,
            this.getDefaultStateForField('plaidMask'),
        );
    }

    render() {
        const shouldDisableInputs = Boolean(this.getDefaultStateForField('bankAccountID'));

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    stepCounter={{step: 1, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={this.props.onBackButtonPress}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    onSubmit={this.submit}
                    validate={this.validate}
                    submitButtonText={this.props.translate('common.continue')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <Text style={[styles.mb5]}>
                        {this.props.translate('bankAccount.checkHelpLine')}
                    </Text>
                    <Image
                        resizeMode="contain"
                        style={[styles.exampleCheckImage, styles.mb5]}
                        source={exampleCheckImage(this.props.preferredLocale)}
                    />
                    <TextInput
                        autoFocus
                        shouldDelayFocus={shouldDelayFocus}
                        inputID="routingNumber"
                        label={this.props.translate('bankAccount.routingNumber')}
                        defaultValue={this.getDefaultStateForField('routingNumber', '')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableInputs}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID="accountNumber"
                        containerStyles={[styles.mt4]}
                        label={this.props.translate('bankAccount.accountNumber')}
                        defaultValue={this.getDefaultStateForField('accountNumber', '')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableInputs}
                        shouldSaveDraft
                    />
                    <CheckboxWithLabel
                        style={styles.mt4}
                        inputID="acceptedTerms"
                        LabelComponent={() => (
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <Text>
                                    {this.props.translate('common.iAcceptThe')}
                                </Text>
                                <TextLink
                                    href="https://use.expensify.com/terms"

                                    // to call the onPress in the TextLink before the input blur is fired and shift the link element
                                    onMouseDown={e => e.preventDefault()}
                                >
                                    {`Expensify ${this.props.translate('common.termsOfService')}`}
                                </TextLink>
                            </View>
                        )}
                        defaultValue={this.getDefaultStateForField('acceptTerms', false)}
                        shouldSaveDraft
                    />
                </Form>
            </ScreenWrapper>
        );
    }
}

BankAccountManualStep.propTypes = propTypes;
export default withLocalize(BankAccountManualStep);
