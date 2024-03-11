import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Onfido from '@components/Onfido';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';

const propTypes = {
    /** The bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,

    /** The application ID for our Onfido instance */
    onfidoApplicantID: PropTypes.string,
};

const defaultProps = {
    onfidoToken: null,
    onfidoApplicantID: null,
};

const HEADER_STEP_COUNTER = {step: 3, total: 5};
const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function RequestorOnfidoStep({onBackButtonPress, reimbursementAccount, onfidoToken, onfidoApplicantID}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const submitOnfidoData = (onfidoData) => {
        BankAccounts.verifyIdentityForBankAccount(lodashGet(reimbursementAccount, 'achData.bankAccountID', 0), {
            ...onfidoData,
            applicantID: onfidoApplicantID,
        });
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
RequestorOnfidoStep.displayName = 'RequestorOnfidoStep';

export default withOnyx({
    onfidoToken: {
        key: ONYXKEYS.ONFIDO_TOKEN,
    },
    onfidoApplicantID: {
        key: ONYXKEYS.ONFIDO_APPLICANT_ID,
    },
})(RequestorOnfidoStep);
