import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';

import useCanEnrollNewExpensifyCardProgram from '@hooks/useCanEnrollNewExpensifyCardProgram';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {clearIssueNewCardFormData} from '@libs/actions/Card';
import {getEligibleBankAccountsForCard, getEligibleBankAccountsForUkEuCard} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canEditWorkspaceSettings} from '@libs/PolicyUtils';
import {hasInProgressUSDVBBA} from '@libs/ReimbursementAccountUtils';

import Navigation from '@navigation/Navigation';

import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type WorkspaceExpensifyCardPageEmptyStateProps = {
    route: PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route'];
} & WithPolicyAndFullscreenLoadingProps;

function WorkspaceExpensifyCardPageEmptyState({route, policy}: WorkspaceExpensifyCardPageEmptyStateProps) {
    const illustrations = useMemoizedLazyIllustrations(['MoneyReceipts', 'CreditCardsNew', 'MoneyWings', 'ExpensifyCardIllustration']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [supportedCountriesByCurrency] = useOnyx(ONYXKEYS.CARD_SUPPORTED_COUNTRIES);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const {showConfirmModal, closeModal} = useConfirmModal();
    const {windowHeight} = useWindowDimensions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {canWrite: canWriteExpensifyCard, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const {canEnrollNewCardProgram, isUkEuCurrencySupported} = useCanEnrollNewExpensifyCardProgram(policy?.id);
    const {isBetaEnabled} = usePermissions();
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policy?.id);

    // Dismiss the currency modal if the workspace currency becomes a supported one externally (e.g. from another device)
    const isCurrencyModalOpen = useRef(false);
    useEffect(() => {
        if (!canEnrollNewCardProgram || !isCurrencyModalOpen.current) {
            return;
        }
        closeModal();
        isCurrencyModalOpen.current = false;
    }, [canEnrollNewCardProgram, closeModal]);

    const {allFeeds} = useExpensifyCardFeedsForFeedSelector(policy?.id);
    const hasAccessibleFeeds = allFeeds.length > 0;
    const setupCtaTranslationKey = isSetupUnfinished ? 'workspace.expensifyCard.finishSetup' : 'workspace.expensifyCard.issueNewCard';
    const ctaTextTranslationKey = hasAccessibleFeeds ? 'workspace.moreFeatures.expensifyCard.feed.viewCards' : setupCtaTranslationKey;

    const eligibleBankAccounts = isUkEuCurrencySupported
        ? getEligibleBankAccountsForUkEuCard(bankAccountList, supportedCountriesByCurrency, policy?.outputCurrency)
        : getEligibleBankAccountsForCard(bankAccountList);
    const shouldStartBankAccountSetup = !eligibleBankAccounts.length || isSetupUnfinished;
    const canEditSettings = canEditWorkspaceSettings(policy, currentUserLogin);
    // Without an existing feed the only path forward is enrolling a new card program, and both the
    // bank account setup page and the currency page are admin only
    const shouldDisableCTA = !canWriteExpensifyCard || (!hasAccessibleFeeds && !canEditSettings);

    const startFlow = () => {
        if (hasAccessibleFeeds && policy?.id) {
            clearIssueNewCardFormData();
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.path, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy.id)));
            return;
        }
        if (shouldStartBankAccountSetup) {
            Navigation.navigate(
                ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                    policyID: policy?.id,
                    backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy?.id),
                }),
            );
            return;
        }
        if (policy?.id) {
            clearIssueNewCardFormData();
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.path, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy.id)));
        }
    };

    const expensifyCardFeatures: FeatureListItem[] = [
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

    const promptCurrencyChange = async () => {
        isCurrencyModalOpen.current = true;
        // An open or partially set up bank account blocks the currency page, so only offer the change when it can be completed
        const result = await showConfirmModal({
            title: translate('workspace.bankAccount.updateCurrencyForExpensifyCardTitle'),
            prompt: translate(
                isBetaEnabled(CONST.BETAS.EXPENSIFY_CARD_EU_UK) ? 'workspace.bankAccount.euUkUpdateCurrencyForExpensifyCard' : 'workspace.bankAccount.updateCurrencyForExpensifyCard',
            ),
            confirmText: translate(shouldBlockCurrencyChange ? 'common.buttonConfirm' : 'workspace.bankAccount.updateWorkspaceCurrency'),
            cancelText: shouldBlockCurrencyChange ? undefined : translate('common.cancel'),
            shouldShowCancelButton: !shouldBlockCurrencyChange,
        });
        isCurrencyModalOpen.current = false;
        if (shouldBlockCurrencyChange || result.action !== ModalActions.CONFIRM || !policy) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id));
    };

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.expensifyCard')}
            route={route}
            showLoadingAsFirstRender={false}
            shouldShowOfflineIndicatorInWideScreen
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            addBottomSafeAreaPadding
        >
            <View style={[styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, {minHeight: windowHeight - variables.contentHeaderHeight}]}>
                <FeatureList
                    menuItems={isUkEuCurrencySupported ? expensifyCardFeatures.slice(1) : expensifyCardFeatures}
                    title={translate(hasAccessibleFeeds ? 'workspace.moreFeatures.expensifyCard.feed.existingFeedTitle' : 'workspace.moreFeatures.expensifyCard.feed.title')}
                    subtitle={translate('workspace.moreFeatures.expensifyCard.feed.subTitle')}
                    ctaText={translate(ctaTextTranslationKey)}
                    ctaAccessibilityLabel={translate(hasAccessibleFeeds ? 'workspace.moreFeatures.expensifyCard.feed.viewCards' : 'workspace.moreFeatures.expensifyCard.feed.ctaTitle')}
                    onCtaPress={() => {
                        if (shouldDisableCTA) {
                            showReadOnlyModal();
                            return;
                        }
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }
                        if (isAccountLocked) {
                            showLockedAccountModal();
                            return;
                        }
                        // The supported currency restriction only applies to enrolling a brand-new card program.
                        // If hasAccessibleFeeds is true, allow the flow to start in order to link an existing feed
                        if (!hasAccessibleFeeds && !canEnrollNewCardProgram) {
                            promptCurrencyChange();
                            return;
                        }
                        startFlow();
                    }}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    illustration={illustrations.ExpensifyCardIllustration}
                    illustrationStyle={styles.expensifyCardIllustrationContainer}
                    titleStyles={styles.textHeadlineH1}
                    buttonInnerStyles={shouldDisableCTA ? styles.buttonOpacityDisabled : undefined}
                    buttonHoverStyles={shouldDisableCTA ? styles.buttonOpacityDisabled : undefined}
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
