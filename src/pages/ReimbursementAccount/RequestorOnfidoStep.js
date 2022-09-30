import React from 'react';
import lodashGet from 'lodash/get';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import Navigation from '../../libs/Navigation/Navigation';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import Growl from '../../libs/Growl';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,
    onfidoToken: PropTypes.string,
    ...withLocalizePropTypes,
};

const defaultProps = {
    onfidoToken: '',
};

class RequestorOnfidoStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.state = {
            onfidoData: lodashGet(props, ['reimbursementAccount', 'achData', 'onfidoData'], ''),
        };
    }

    submit() {
        BankAccounts.verifyIdentityForBankAccount(
            ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0),
            {
                ...this.state,
            },
        );
    }

    render() {
        const achData = this.props.reimbursementAccount.achData;
        const shouldShowOnfido = achData.useOnfido && this.props.onfidoToken && !this.state.isOnfidoSetupComplete;

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('requestorStep.headerTitle')}
                    stepCounter={{step: 3, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        if (shouldShowOnfido) {
                            BankAccounts.clearOnfidoToken();
                        } else {
                            BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                        }
                    }}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {
                    <ScrollView contentContainerStyle={styles.flex1}>
                        <Onfido
                            sdkToken={this.props.onfidoToken}
                            onUserExit={() => {
                            // We're taking the user back to the company step. They will need to come back to the requestor step to make the Onfido flow appear again.
                                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                            }}
                            onError={() => {
                            // In case of any unexpected error we log it to the server, show a growl, and return the user back to the company step so they can try again.
                                Growl.error(this.props.translate('onfidoStep.genericError'), 10000);
                                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                            }}
                            onSuccess={(onfidoData) => {
                                this.setState({
                                    onfidoData,
                                    isOnfidoSetupComplete: true,
                                }, this.submitOnfidoVerification);
                            }}
                        />
                    </ScrollView>
                }
            </>
        );
    }
}

RequestorOnfidoStep.propTypes = propTypes;
RequestorOnfidoStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        onfidoToken: {
            key: ONYXKEYS.ONFIDO_TOKEN,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
    }),
)(RequestorOnfidoStep);
