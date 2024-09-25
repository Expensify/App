import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import * as BankAccounts from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import type {ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type EnableBankAccountProps = {
    /** Bank account currently in setup */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: () => void;
};

function EnableBankAccount({reimbursementAccount, onBackButtonPress}: EnableBankAccountProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const achData = reimbursementAccount?.achData ?? {};
    const {icon, iconSize, iconStyles} = getBankIcon({bankName: achData.bankName, styles});

    const formattedBankAccountNumber = achData.accountNumber ? `${translate('bankAccount.accountEnding')} ${achData.accountNumber.slice(-4)}` : '';
    const bankAccountOwnerName = achData.addressName;
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction;
    const shouldShowResetModal = reimbursementAccount?.shouldShowResetModal ?? false;

    return (
        <ScreenWrapper
            testID={EnableBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            style={[styles.flex1, styles.justifyContentBetween, styles.mh2]}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={onBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={translate('workspace.bankAccount.allSet')}
                    icon={Illustrations.ThumbsUpStars}
                >
                    <OfflineWithFeedback
                        pendingAction={pendingAction}
                        errors={errors}
                        shouldShowErrorMessages
                        onClose={BankAccounts.resetReimbursementAccount}
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
                            icon={Expensicons.Close}
                            onPress={BankAccounts.requestResetFreePlanBankAccount}
                            wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                            disabled={!!pendingAction || !isEmptyObject(errors)}
                        />
                    </OfflineWithFeedback>
                </Section>
            </ScrollView>
            {shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
        </ScreenWrapper>
    );
}

EnableBankAccount.displayName = 'EnableStep';

export default EnableBankAccount;
