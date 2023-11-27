import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Onfido from '@components/Onfido';
import useLocalize from '@hooks/useLocalize';
import Growl from '@libs/Growl';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,

    ...subStepPropTypes,
};

const defaultProps = {
    onfidoToken: null,
};

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function OnfidoInitialize({onfidoToken, onNext}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
        <FullPageOfflineBlockingView>
            <ScrollView contentContainerStyle={styles.flex1}>
                <Onfido
                    sdkToken={onfidoToken}
                    onUserExit={handleOnfidoUserExit}
                    onError={handleOnfidoError}
                    onSuccess={onNext}
                />
            </ScrollView>
        </FullPageOfflineBlockingView>
    );
}

OnfidoInitialize.propTypes = propTypes;
OnfidoInitialize.defaultProps = defaultProps;
OnfidoInitialize.displayName = 'OnfidoInitialize';

export default withOnyx({
    onfidoToken: {
        key: ONYXKEYS.ONFIDO_TOKEN,
    },
})(OnfidoInitialize);
