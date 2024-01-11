import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {reimbursementAccountDefaultProps} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {OnfidoData} from '@src/types/onyx/ReimbursementAccountDraft';
import OnfidoInitialize from './substeps/OnfidoInitialize';

type VerifyIdentityOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type VerifyIdentityProps = VerifyIdentityOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: () => void;
};

const bodyContent: Array<React.ComponentType<SubStepProps>> = [OnfidoInitialize];

function VerifyIdentity({reimbursementAccount = reimbursementAccountDefaultProps, onBackButtonPress, onCloseButtonPress}: VerifyIdentityProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const submit = useCallback(
        (onfidoData?: OnfidoData) => {
            if (!onfidoData) {
                return;
            }

            BankAccounts.verifyIdentityForBankAccount(reimbursementAccount?.achData?.bankAccountID ?? 0, onfidoData);
            BankAccounts.updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
        },
        [reimbursementAccount],
    );

    const {componentToRender: SubStep, isEditing, moveTo, nextScreen} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

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
                    startStepIndex={3}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

VerifyIdentity.displayName = 'VerifyIdentity';

export default withOnyx<VerifyIdentityProps, VerifyIdentityOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(VerifyIdentity);
