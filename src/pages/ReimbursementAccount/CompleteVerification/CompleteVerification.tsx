import type {ComponentType} from 'react';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import ConfirmAgreements from './substeps/ConfirmAgreements';

type CompleteVerificationOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};

type CompleteVerificationProps = CompleteVerificationOnyxProps & {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: () => void;
};

const COMPLETE_VERIFICATION_KEYS = CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY;
const bodyContent: Array<ComponentType<SubStepProps>> = [ConfirmAgreements];

function CompleteVerification({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, onCloseButtonPress}: CompleteVerificationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const values = useMemo(() => getSubstepValues(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(() => {
        BankAccounts.acceptACHContractForBankAccount(Number(reimbursementAccount?.achData?.bankAccountID ?? '0'), {
            isAuthorizedToUseBankAccount: values.isAuthorizedToUseBankAccount,
            certifyTrueInformation: values.certifyTrueInformation,
            acceptTermsAndConditions: values.acceptTermsAndConditions,
        });
    }, [reimbursementAccount, values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
            testID={CompleteVerification.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('completeVerificationStep.completeVerification')}
                shouldShowCloseButton
                onCloseButtonPress={onCloseButtonPress}
            />
            <View style={[styles.ph5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={5}
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

CompleteVerification.displayName = 'CompleteVerification';

export default withOnyx<CompleteVerificationProps, CompleteVerificationOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(CompleteVerification);
