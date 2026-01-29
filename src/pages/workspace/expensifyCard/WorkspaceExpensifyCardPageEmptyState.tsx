import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import Text from '@components/Text';
import useDismissModalForUSD from '@hooks/useDismissModalForUSD';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getEligibleBankAccountsForCard, getEligibleBankAccountsForUkEuCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {hasInProgressUSDVBBA, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import variables from '@styles/variables';
import {updateGeneralSettings as updatePolicyGeneralSettings} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardPageEmptyStateProps = {
    route: PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route'];
} & WithPolicyAndFullscreenLoadingProps;

function WorkspaceExpensifyCardPageEmptyState({route, policy}: WorkspaceExpensifyCardPageEmptyStateProps) {
    const illustrations = useMemoizedLazyIllustrations(['MoneyReceipts', 'CreditCardsNew', 'MoneyWings', 'HandCard', 'ExpensifyCardIllustration']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: false});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useDismissModalForUSD(policy?.outputCurrency);
    const {windowHeight} = useWindowDimensions();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policy?.id);

    const eligibleBankAccounts = isUkEuCurrencySupported ? getEligibleBankAccountsForUkEuCard(bankAccountList, policy?.outputCurrency) : getEligibleBankAccountsForCard(bankAccountList);

    const startFlow = useCallback(() => {
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policy?.id, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy?.id)));
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(policy?.id));
        }
    }, [eligibleBankAccounts.length, isSetupUnfinished, policy?.id]);

    const expensifyCardFeatures: FeatureListItem[] = useMemo(() => {
        const features = [
            {
                icon: illustrations.MoneyReceipts,
                translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.cashBack' as const,
            },
            {
                icon: illustrations.CreditCardsNew,
                translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.unlimited' as const,
            },
            {
                icon: illustrations.MoneyWings,
                translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.spend' as const,
            },
        ];
        return features
            .filter((feature) => feature.icon !== null)
            .map((feature) => ({
                icon: feature.icon,
                translationKey: feature.translationKey,
            }));
    }, [illustrations.CreditCardsNew, illustrations.MoneyReceipts, illustrations.MoneyWings]);

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
            icon={illustrations.HandCard}
            headerText={translate('workspace.common.expensifyCard')}
            route={route}
            showLoadingAsFirstRender={false}
            shouldShowOfflineIndicatorInWideScreen
            addBottomSafeAreaPadding
        >
            <View style={[styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, {minHeight: windowHeight - variables.contentHeaderHeight}]}>
                <FeatureList
                    menuItems={isUkEuCurrencySupported ? expensifyCardFeatures.slice(1) : expensifyCardFeatures}
                    title={translate('workspace.moreFeatures.expensifyCard.feed.title')}
                    subtitle={translate('workspace.moreFeatures.expensifyCard.feed.subTitle')}
                    ctaText={translate(isSetupUnfinished ? 'workspace.expensifyCard.finishSetup' : 'workspace.expensifyCard.issueNewCard')}
                    ctaAccessibilityLabel={translate('workspace.moreFeatures.expensifyCard.feed.ctaTitle')}
                    onCtaPress={() => {
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }
                        if (isAccountLocked) {
                            showLockedAccountModal();
                            return;
                        }
                        if (!(policy?.outputCurrency === CONST.CURRENCY.USD || isUkEuCurrencySupported)) {
                            setIsCurrencyModalOpen(true);
                            return;
                        }
                        startFlow();
                    }}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    illustration={illustrations.ExpensifyCardIllustration}
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
            </View>
            <View style={[shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <Text style={[styles.textMicroSupporting, styles.m5]}>
                    {translate(isUkEuCurrencySupported ? 'workspace.expensifyCard.euUkDisclaimer' : 'workspace.expensifyCard.disclaimer')}
                </Text>
            </View>
        </WorkspacePageWithSections>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceExpensifyCardPageEmptyState);
