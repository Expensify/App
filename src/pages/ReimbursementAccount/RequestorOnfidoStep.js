import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../../libs/Growl';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import CONST from '../../CONST';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes.isRequired,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string.isRequired,

    /** A callback to call once the user completes the Onfido flow */
    onComplete: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {};

class RequestorOnfidoStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
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

    submit(onfidoData) {
        BankAccounts.verifyIdentityForBankAccount(
            this.getDefaultStateForField('bankAccountID', 0),
            onfidoData,
        );
        this.props.onComplete();
    }

    render() {
        return (
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flex1}>
                    <Onfido
                        sdkToken={this.props.onfidoToken}
                        onUserExit={() => {
                            BankAccounts.clearOnfidoToken();
                            BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                        }}
                        onError={() => {
                            // In case of any unexpected error we log it to the server, show a growl, and return the user back to the requestor step so they can try again.
                            Growl.error(this.props.translate('onfidoStep.genericError'), 10000);
                            BankAccounts.clearOnfidoToken();
                            BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                        }}
                        onSuccess={(onfidoData) => {
                            this.submit(onfidoData);
                        }}
                    />
                </ScrollView>
            </FullPageOfflineBlockingView>
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
    }),
)(RequestorOnfidoStep);
