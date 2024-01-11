import React from 'react';
import {ScrollView} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
// @ts-expect-error TODO: Remove this once Onfido (https://github.com/Expensify/App/issues/25136) is migrated to TypeScript.
import Onfido from '@components/Onfido';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type OnfidoInitializeOnyxProps = {
    /** The token required to initialize the Onfido SDK */
    onfidoToken: OnyxEntry<string>;
};

type OnfidoInitializeProps = SubStepProps & OnfidoInitializeOnyxProps;

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function OnfidoInitialize({onfidoToken, onNext}: OnfidoInitializeProps) {
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

OnfidoInitialize.displayName = 'OnfidoInitialize';

export default withOnyx<OnfidoInitializeProps, OnfidoInitializeOnyxProps>({
    onfidoToken: {
        key: ONYXKEYS.ONFIDO_TOKEN,
    },
})(OnfidoInitialize);
