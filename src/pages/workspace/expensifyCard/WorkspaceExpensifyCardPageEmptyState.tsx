import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useDismissModalForUSD from '@hooks/useDismissModalForUSD';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {isCurrencySupportedForDirectReimbursement, updateGeneralSettings as updatePolicyGeneralSettings} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const expensifyCardFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.cashBack',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.unlimited',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.spend',
    },
];

type WorkspaceExpensifyCardPageEmptyStateProps = {
    route: PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route'];
} & WithPolicyAndFullscreenLoadingProps;

function WorkspaceExpensifyCardPageEmptyState({route, policy}: WorkspaceExpensifyCardPageEmptyStateProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useDismissModalForUSD(policy?.outputCurrency);

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList ?? {});

    const reimbursementAccountStatus = reimbursementAccount?.achData?.state ?? '';
    const isSetupUnfinished = isEmptyObject(bankAccountList) && reimbursementAccountStatus && reimbursementAccountStatus !== CONST.BANK_ACCOUNT.STATE.OPEN;

    const startFlow = useCallback(() => {
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policy?.id, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy?.id)));
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(policy?.id));
        }
    }, [eligibleBankAccounts.length, isSetupUnfinished, policy?.id]);

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }
        updatePolicyGeneralSettings(policy.id, policy.name, CONST.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        startFlow();
    }, [policy, startFlow, setIsCurrencyModalOpen]);

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            icon={Illustrations.HandCard}
            headerText={translate('workspace.common.expensifyCard')}
            route={route}
            showLoadingAsFirstRender={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList
                    menuItems={expensifyCardFeatures}
                    title={translate('workspace.moreFeatures.expensifyCard.feed.title')}
                    subtitle={translate('workspace.moreFeatures.expensifyCard.feed.subTitle')}
                    ctaText={translate(isSetupUnfinished ? 'workspace.expensifyCard.finishSetup' : 'workspace.expensifyCard.issueNewCard')}
                    ctaAccessibilityLabel={translate('workspace.moreFeatures.expensifyCard.feed.ctaTitle')}
                    onCtaPress={() => {
                        if (isActingAsDelegate) {
                            setIsNoDelegateAccessMenuVisible(true);
                            return;
                        }
                        if (!isCurrencySupportedForDirectReimbursement(policy?.outputCurrency ?? '')) {
                            setIsCurrencyModalOpen(true);
                            return;
                        }
                        startFlow();
                    }}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    illustration={Illustrations.ExpensifyCardIllustration}
                    illustrationStyle={styles.expensifyCardIllustrationContainer}
                    titleStyles={styles.textHeadlineH1}
                />
                <ConfirmModal
                    title={translate('workspace.common.expensifyCard')}
                    isVisible={isCurrencyModalOpen}
                    onConfirm={confirmCurrencyChangeAndHideModal}
                    onCancel={() => setIsCurrencyModalOpen(false)}
                    prompt={translate('workspace.bankAccount.updateCurrencyPrompt')}
                    confirmText={translate('workspace.bankAccount.updateToUSD')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text>
            </View>
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </WorkspacePageWithSections>
    );
}

WorkspaceExpensifyCardPageEmptyState.displayName = 'WorkspaceExpensifyCardPageEmptyState';

export default withPolicyAndFullscreenLoading(WorkspaceExpensifyCardPageEmptyState);
