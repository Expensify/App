import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResetBankAccountModal from '@hooks/useResetBankAccountModal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {goToWithdrawalAccountSetupStep, requestResetBankAccount, setBankAccountSubStep} from '@userActions/BankAccounts';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy, ReimbursementAccount} from '@src/types/onyx';
import Enable2FACard from './Enable2FACard';

type FinishChatCardProps = {
    /** Bank account currently in setup */
    reimbursementAccount?: ReimbursementAccount;

    /** Boolean required to display Enable2FACard component */
    requiresTwoFactorAuth: boolean;

    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** Method to set the state of USD bank account step */
    setUSDBankAccountStep?: (step: string | null) => void;

    /** Route to return to when navigating back out of the flow */
    backTo?: Route;
};

function FinishChatCard({requiresTwoFactorAuth, reimbursementAccount, policy, setUSDBankAccountStep, backTo}: FinishChatCardProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    useResetBankAccountModal({
        reimbursementAccount,
        isNonUSDWorkspace: false,
        setUSDBankAccountStep,
    });

    const handleNavigateToConciergeChat = () =>
        navigateToConciergeChat(
            conciergeReportID,
            introSelected,
            currentUserAccountID,
            isSelfTourViewed,
            betas,
            true,
            undefined,
            undefined,
            reimbursementAccount?.achData?.ACHRequestReportActionID,
        );

    const icons = useMemoizedLazyExpensifyIcons(['ChatBubble', 'Pencil', 'RotateLeft']);
    const illustrations = useMemoizedLazyIllustrations(['ConciergeBubble']);

    return (
        <ScrollView style={[styles.flex1]}>
            <Section
                title={translate('workspace.bankAccount.letsFinishInChat')}
                icon={illustrations.ConciergeBubble}
                containerStyles={[styles.mb8, styles.mh5]}
                titleStyles={[styles.mb3]}
            >
                <Text style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text>
                <MenuItem
                    icon={icons.ChatBubble}
                    title={translate('workspace.bankAccount.finishInChat')}
                    onPress={handleNavigateToConciergeChat}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
                <MenuItem
                    icon={icons.Pencil}
                    title={translate('workspace.bankAccount.updateDetails')}
                    onPress={() => {
                        setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL).then(() => {
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                            Navigation.navigate(
                                ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({
                                    policyID: policy?.id,
                                    page: CONST.BANK_ACCOUNT.PAGE_NAMES.REQUESTOR,
                                    subPage: CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.SUB_PAGE_NAMES.FULL_NAME,
                                    backTo,
                                }),
                            );
                        });
                    }}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
                <MenuItem
                    icon={icons.RotateLeft}
                    title={translate('workspace.bankAccount.startOver')}
                    onPress={requestResetBankAccount}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
            </Section>
            {!requiresTwoFactorAuth && <Enable2FACard />}
        </ScrollView>
    );
}

export default FinishChatCard;
