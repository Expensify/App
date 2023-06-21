import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import withLocalize from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Onfido from '../../components/Onfido';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';
import StepPropTypes from './StepPropTypes';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ScreenWrapper from '../../components/ScreenWrapper';

const propTypes = {
    ...StepPropTypes,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,
};

const defaultProps = {
    onfidoToken: null,
};

class RequestorOnfidoStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    submit(onfidoData) {
        BankAccounts.verifyIdentityForBankAccount(lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0, onfidoData);

        BankAccounts.updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
    }

    render() {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldShowOfflineIndicator={false}
            >
                <HeaderWithBackButton
                    title={this.props.translate('requestorStep.headerTitle')}
                    stepCounter={{step: 3, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    onBackButtonPress={this.props.onBackButtonPress}
                />
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
            </ScreenWrapper>
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
