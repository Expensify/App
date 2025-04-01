import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import {Close} from '@components/Icon/Expensicons';
import {ThumbsUpStars} from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {requestResetBankAccount, resetReimbursementAccount} from '@userActions/ReimbursementAccount';
import type {ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ConnectedVerifiedBankAccountProps = {
    /** Bank account currently in setup */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: () => void;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setShouldShowConnectedVerifiedBankAccount: (shouldShowConnectedVerifiedBankAccount: boolean) => void;

    /** Method to set the state of USD bank account step */
    setUSDBankAccountStep: (step: string | null) => void;

    /** Method to set the state of setNonUSDBankAccountStep */
    setNonUSDBankAccountStep?: (step: string | null) => void;

    /** Whether the workspace currency is set to non USD currency */
    isNonUSDWorkspace: boolean;
};

function ConnectedVerifiedBankAccount({
    reimbursementAccount,
    onBackButtonPress,
    setShouldShowConnectedVerifiedBankAccount,
    setUSDBankAccountStep,
    setNonUSDBankAccountStep,
    isNonUSDWorkspace,
}: ConnectedVerifiedBankAccountProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {icon, iconSize, iconStyles} = getBankIcon({bankName: reimbursementAccount?.achData?.bankName, styles});

    const formattedBankAccountNumber = reimbursementAccount?.achData?.accountNumber
        ? `${translate('bankAccount.accountEnding')} ${reimbursementAccount?.achData?.accountNumber.slice(-4)}`
        : '';
    const bankAccountOwnerName = reimbursementAccount?.achData?.addressName;
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction;
    const shouldShowResetModal = reimbursementAccount?.shouldShowResetModal ?? false;

    return (
        <ScreenWrapper
            testID={ConnectedVerifiedBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            style={[styles.flex1, styles.justifyContentBetween, styles.mh2]}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                onBackButtonPress={onBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={translate('workspace.bankAccount.allSet')}
                    icon={ThumbsUpStars}
                >
                    <OfflineWithFeedback
                        pendingAction={pendingAction}
                        errors={errors}
                        shouldShowErrorMessages
                        onClose={resetReimbursementAccount}
                    >
                        <MenuItem
                            title={bankAccountOwnerName}
                            description={formattedBankAccountNumber}
                            icon={icon}
                            iconStyles={iconStyles}
                            iconWidth={iconSize}
                            iconHeight={iconSize}
                            interactive={false}
                            displayInDefaultIconColor
                            wrapperStyle={[styles.ph0, styles.mv3, styles.h13]}
                        />
                        <Text style={[styles.mv3]}>{translate('workspace.bankAccount.accountDescriptionWithCards')}</Text>
                        <MenuItem
                            title={translate('workspace.bankAccount.disconnectBankAccount')}
                            icon={Close}
                            onPress={requestResetBankAccount}
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                            disabled={!!pendingAction || !isEmptyObject(errors)}
                        />
                    </OfflineWithFeedback>
                </Section>
            </ScrollView>
            {shouldShowResetModal && (
                <WorkspaceResetBankAccountModal
                    reimbursementAccount={reimbursementAccount}
                    setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
                    isNonUSDWorkspace={isNonUSDWorkspace}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                    setNonUSDBankAccountStep={setNonUSDBankAccountStep}
                />
            )}
        </ScreenWrapper>
    );
}

ConnectedVerifiedBankAccount.displayName = 'ConnectedVerifiedBankAccount';

export default ConnectedVerifiedBankAccount;
