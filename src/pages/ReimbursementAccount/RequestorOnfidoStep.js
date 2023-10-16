import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Onfido from '../../components/Onfido';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';
import StepPropTypes from './StepPropTypes';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    ...StepPropTypes,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,
};

const defaultProps = {
    onfidoToken: null,
};

const HEADER_STEP_COUNTER = {step: 3, total: 5};
const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function RequestorOnfidoStep({onBackButtonPress, reimbursementAccount, onfidoToken}) {
    const {translate} = useLocalize();

    const submitOnfidoData = (onfidoData) => {
        BankAccounts.verifyIdentityForBankAccount(lodashGet(reimbursementAccount, 'achData.bankAccountID', 0), onfidoData);
        BankAccounts.updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
    };

    const handleOnfidoError = () => {
        // In case of any unexpected error we log it to the server, show a growl, and return the user back to the requestor step so they can try again.
        Growl.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
        BankAccounts.clearOnfidoToken();
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    const handleOnfidoUserExit = () => {
        BankAccounts.clearOnfidoToken();
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicator={false}
            testID={RequestorOnfidoStep.displayName}
        >
            <HeaderWithBackButton
                title={translate('requestorStep.headerTitle')}
                stepCounter={HEADER_STEP_COUNTER}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flex1}>
                    <Onfido
                        sdkToken={onfidoToken}
                        onUserExit={handleOnfidoUserExit}
                        onError={handleOnfidoError}
                        onSuccess={submitOnfidoData}
                    />
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

RequestorOnfidoStep.displayName = 'RequestorOnfidoStep';
RequestorOnfidoStep.propTypes = propTypes;
RequestorOnfidoStep.defaultProps = defaultProps;

export default withOnyx({
    onfidoToken: {
        key: ONYXKEYS.ONFIDO_TOKEN,
    },
})(RequestorOnfidoStep);
