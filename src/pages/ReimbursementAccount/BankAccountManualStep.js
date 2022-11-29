import React from 'react';
import {Image, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
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
import exampleCheckImage from './exampleCheckImage';
import Form from '../../components/Form';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import shouldDelayFocus from '../../libs/shouldDelayFocus';

const propTypes = {
    onBack: PropTypes.func,
    ...withLocalizePropTypes,
};

const defaultProps = {
    onBack: () => {},
};

class BankAccountManualStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
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
            ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0),
            values.accountNumber,
            values.routingNumber,
            ReimbursementAccountUtils.getDefaultStateForField(this.props, 'plaidMask'),
        );
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
                    onBackButtonPress={this.props.onBack}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    onSubmit={this.submit}
                    validate={this.validate}
                    submitButtonText={this.props.translate('common.saveAndContinue')}
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
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'routingNumber', '')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableInputs}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID="accountNumber"
                        containerStyles={[styles.mt4]}
                        label={this.props.translate('bankAccount.accountNumber')}
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'accountNumber', '')}
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
                                <TextLink href="https://use.expensify.com/terms">
                                    {`Expensify ${this.props.translate('common.termsOfService')}`}
                                </TextLink>
                            </View>
                        )}
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'acceptTerms', false)}
                    />
                </Form>
            </>
        );
    }
}

BankAccountManualStep.propTypes = propTypes;
BankAccountManualStep.defaultProps = defaultProps;
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
