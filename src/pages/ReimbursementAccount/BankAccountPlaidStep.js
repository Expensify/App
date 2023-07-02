import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import withLocalize from '../../components/withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import Text from '../../components/Text';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';
import Form from '../../components/Form';
import styles from '../../styles/styles';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as PlaidDataProps from './plaidDataPropTypes';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** Contains plaid data */
    plaidData: PlaidDataProps.plaidDataPropTypes,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,
};

const defaultProps = {
    plaidData: PlaidDataProps.plaidDataDefaultProps,
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
};

class BankAccountPlaidStep extends React.Component {
    constructor(props) {
        super(props);
        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
    }

    validate(values) {
        const errorFields = {};
        if (!values.acceptTerms) {
            errorFields.acceptTerms = 'common.error.acceptTerms';
        }

        return errorFields;
    }

    submit() {
        const selectedPlaidBankAccount = _.findWhere(lodashGet(this.props.plaidData, 'bankAccounts', []), {
            plaidAccountID: lodashGet(this.props.reimbursementAccountDraft, 'plaidAccountID', ''),
        });

        const bankAccountData = {
            routingNumber: selectedPlaidBankAccount.routingNumber,
            accountNumber: selectedPlaidBankAccount.accountNumber,
            plaidMask: selectedPlaidBankAccount.mask,
            isSavings: selectedPlaidBankAccount.isSavings,
            bankName: lodashGet(this.props.plaidData, 'bankName') || '',
            plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
            plaidAccessToken: lodashGet(this.props.plaidData, 'plaidAccessToken') || '',
        };
        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);

        const bankAccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0;
        BankAccounts.connectBankAccountWithPlaid(bankAccountID, bankAccountData);
    }

    render() {
        const bankAccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0;
        const selectedPlaidAccountID = lodashGet(this.props.reimbursementAccountDraft, 'plaidAccountID', '');

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicator={false}
            >
                <HeaderWithBackButton
                    title={this.props.translate('workspace.common.connectBankAccount')}
                    stepCounter={{step: 1, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    onBackButtonPress={this.props.onBackButtonPress}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    validate={this.validate}
                    onSubmit={this.submit}
                    scrollContextEnabled
                    submitButtonText={this.props.translate('common.saveAndContinue')}
                    style={[styles.mh5, styles.flexGrow1]}
                    isSubmitButtonVisible={Boolean(selectedPlaidAccountID) && !_.isEmpty(lodashGet(this.props.plaidData, 'bankAccounts'))}
                >
                    <AddPlaidBankAccount
                        text={this.props.translate('bankAccount.plaidBodyCopy')}
                        onSelect={(plaidAccountID) => {
                            ReimbursementAccount.updateReimbursementAccountDraft({plaidAccountID});
                        }}
                        plaidData={this.props.plaidData}
                        onExitPlaid={() => BankAccounts.setBankAccountSubStep(null)}
                        receivedRedirectURI={this.props.receivedRedirectURI}
                        plaidLinkOAuthToken={this.props.plaidLinkOAuthToken}
                        allowDebit
                        bankAccountID={bankAccountID}
                        selectedPlaidAccountID={selectedPlaidAccountID}
                    />
                    {Boolean(selectedPlaidAccountID) && !_.isEmpty(lodashGet(this.props.plaidData, 'bankAccounts')) && (
                        <CheckboxWithLabel
                            accessibilityLabel={`${this.props.translate('common.iAcceptThe')} ${this.props.translate('common.expensifyTermsOfService')}`}
                            style={styles.mt4}
                            inputID="acceptTerms"
                            LabelComponent={() => (
                                <Text>
                                    {this.props.translate('common.iAcceptThe')}
                                    <TextLink href={CONST.TERMS_URL}>{this.props.translate('common.expensifyTermsOfService')}</TextLink>
                                </Text>
                            )}
                            defaultValue={this.props.getDefaultStateForField('acceptTerms', false)}
                            shouldSaveDraft
                        />
                    )}
                </Form>
            </ScreenWrapper>
        );
    }
}

BankAccountPlaidStep.propTypes = propTypes;
BankAccountPlaidStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
    }),
)(BankAccountPlaidStep);
