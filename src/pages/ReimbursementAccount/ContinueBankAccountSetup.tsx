import React from 'react';
import {ScrollView} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ContinueBankAccountStepProps = {
    /** Bank account currently in setup */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Callback to continue to the next step of the setup */
    continueFunction: () => void;

    /* The workspace name */
    policyName?: string;

    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

function ContinueBankAccountSetup({policyName = '', onBackButtonPress, reimbursementAccount, continueFunction}: ContinueBankAccountStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction ?? null;
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ContinueBankAccountSetup.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                subtitle={policyName}
                shouldShowGetAssistanceButton
                onBackButtonPress={onBackButtonPress}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
            />
            <ScrollView style={styles.flex1}>
                <Section
                    title={translate('workspace.bankAccount.almostDone')}
                    icon={Illustrations.BankArrow}
                >
                    <OfflineWithFeedback
                        errors={errors}
                        shouldShowErrorMessages
                        onClose={BankAccounts.resetReimbursementAccount}
                    >
                        <Text>{translate('workspace.bankAccount.youreAlmostDone')}</Text>
                        <Button
                            text={translate('workspace.bankAccount.continueWithSetup')}
                            onPress={continueFunction}
                            icon={Expensicons.Bank}
                            style={styles.mv4}
                            iconStyles={styles.buttonCTAIcon}
                            shouldShowRightIcon
                            large
                            success
                            isDisabled={!!pendingAction || !isEmptyObject(errors)}
                        />
                        <MenuItem
                            title={translate('workspace.bankAccount.startOver')}
                            icon={Expensicons.RotateLeft}
                            onPress={() => BankAccounts.requestResetFreePlanBankAccount()}
                            shouldShowRightIcon
                            wrapperStyle={[styles.cardMenuItem]}
                            disabled={Boolean(pendingAction) || !isEmptyObject(errors)}
                        />
                    </OfflineWithFeedback>
                </Section>
            </ScrollView>

            {reimbursementAccount?.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
        </ScreenWrapper>
    );
}

ContinueBankAccountSetup.displayName = 'ContinueBankAccountSetup';

export default ContinueBankAccountSetup;
