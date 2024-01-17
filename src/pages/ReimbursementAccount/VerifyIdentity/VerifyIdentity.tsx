import React, {useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
// @ts-expect-error TODO: Remove this once Onfido (https://github.com/Expensify/App/issues/25136) is migrated to TypeScript.
import Onfido from '@components/Onfido';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {OnfidoData} from '@src/types/onyx/ReimbursementAccountDraft';

type VerifyIdentityOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Onfido applicant ID from ONYX */
    onfidoApplicantID: OnyxEntry<string>;

    /** The token required to initialize the Onfido SDK */
    onfidoToken: OnyxEntry<string>;
};

type VerifyIdentityProps = VerifyIdentityOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: () => void;
};

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function VerifyIdentity({reimbursementAccount, onBackButtonPress, onCloseButtonPress, onfidoApplicantID, onfidoToken}: VerifyIdentityProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleOnfidoSuccess = useCallback(
        (onfidoData: OnfidoData) => {
            BankAccounts.verifyIdentityForBankAccount(Number(reimbursementAccount?.achData?.bankAccountID ?? '0'), {...onfidoData, applicantID: onfidoApplicantID});
            BankAccounts.updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
        },
        [reimbursementAccount, onfidoApplicantID],
    );

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
        <ScreenWrapper testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton
                title={translate('onfidoStep.verifyIdentity')}
                onBackButtonPress={onBackButtonPress}
                onCloseButtonPress={onCloseButtonPress}
                shouldShowCloseButton
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    startStepIndex={2}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flex1}>
                    <Onfido
                        sdkToken={onfidoToken}
                        onUserExit={handleOnfidoUserExit}
                        onError={handleOnfidoError}
                        onSuccess={handleOnfidoSuccess}
                    />
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

VerifyIdentity.displayName = 'VerifyIdentity';

export default withOnyx<VerifyIdentityProps, VerifyIdentityOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    onfidoApplicantID: {
        key: ONYXKEYS.ONFIDO_APPLICANT_ID,
    },
    onfidoToken: {
        key: ONYXKEYS.ONFIDO_TOKEN,
    },
})(VerifyIdentity);
