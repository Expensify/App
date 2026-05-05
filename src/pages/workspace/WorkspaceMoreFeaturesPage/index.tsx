import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useIsPolicyConnectedToUberReceiptPartner from '@hooks/useIsPolicyConnectedToUberReceiptPartner';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {enablePolicyTravel} from '@libs/actions/Policy/Travel';
import {filterInactiveCards, getAllCardsForWorkspace, getCardSettings, getCompanyFeeds, isSmartLimitEnabled as isSmartLimitEnabledUtil} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {
    canPolicyAccessFeature,
    getDistanceRateCustomUnit,
    getPerDiemCustomUnit,
    hasAccountingConnections,
    hasAccountingFeatureConnection,
    isControlPolicy,
    isTimeTrackingEnabled,
} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {enablePolicyCategories} from '@userActions/Policy/Category';
import {enablePolicyDistanceRates} from '@userActions/Policy/DistanceRate';
import {enablePerDiem} from '@userActions/Policy/PerDiem';
import {
    clearPolicyErrorField,
    enableCompanyCards,
    enableExpensifyCard,
    enablePolicyConnections,
    enablePolicyHR,
    enablePolicyInvoicing,
    enablePolicyReceiptPartners,
    enablePolicyRules,
    enablePolicyTaxes,
    enablePolicyTimeTracking,
    enablePolicyWorkflows,
    openPolicyMoreFeaturesPage,
} from '@userActions/Policy/Policy';
import {enablePolicyTags} from '@userActions/Policy/Tag';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MoreFeaturesSection from './MoreFeaturesSection';
import MoreFeatureToggle from './MoreFeatureToggle';

type WorkspaceMoreFeaturesPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.MORE_FEATURES>;

function WorkspaceMoreFeaturesPage({policy, route}: WorkspaceMoreFeaturesPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.moreFeatures');
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations([
        'FolderOpen',
        'Accounting',
        'CompanyCard',
        'Workflows',
        'InvoiceBlue',
        'Rules',
        'Tag',
        'PerDiem',
        'HandCard',
        'Coins',
        'Luggage',
        'Car',
        'Gears',
        'ReceiptPartners',
        'Clock',
        'Members',
    ]);

    const policyID = policy?.id;
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const hasAccountingConnection = hasAccountingConnections(policy);
    const isAccountingEnabled = !!policy?.areConnectionsEnabled || hasAccountingFeatureConnection(policy);
    const isSyncTaxEnabled =
        !!policy?.connections?.quickbooksOnline?.config?.syncTax ||
        !!policy?.connections?.xero?.config?.importTaxRates ||
        !!policy?.connections?.netsuite?.options?.config?.syncOptions?.syncTax;
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const distanceRateCustomUnit = getDistanceRateCustomUnit(policy);

    const isUberConnected = useIsPolicyConnectedToUberReceiptPartner({policyID});
    const [cardFeeds] = useCardFeeds(policyID);
    const policyData = usePolicyData(policyID);
    const defaultFundID = useDefaultFundID(policyID);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID.toString()}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
    });
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);

    const workspaceCards = getAllCardsForWorkspace(workspaceAccountID, cardList, cardFeeds);
    const isSmartLimitEnabled = isSmartLimitEnabledUtil(workspaceCards);
    const settings = getCardSettings(cardSettings);
    const paymentBankAccountID = settings?.paymentBankAccountID;

    const warnAccountingManagesOrganizeFeature = async () => {
        if (!hasAccountingConnection || !policyID) {
            return;
        }
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
            prompt: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText'),
            confirmText: translate('workspace.moreFeatures.connectionsWarningModal.manageSettings'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
    };

    const warnDisconnectAccountingFirst = async () => {
        if (!hasAccountingConnection || !policyID) {
            return;
        }
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
            prompt: translate('workspace.moreFeatures.connectionsWarningModal.disconnectText'),
            confirmText: translate('workspace.moreFeatures.connectionsWarningModal.manageSettings'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
    };

    const warnReceiptPartnersStillConnected = async () => {
        if (!isUberConnected) {
            return;
        }
        await showConfirmModal({
            title: translate('workspace.moreFeatures.receiptPartnersWarningModal.featureEnabledTitle'),
            prompt: translate('workspace.moreFeatures.receiptPartnersWarningModal.disconnectText'),
            confirmText: translate('workspace.moreFeatures.receiptPartnersWarningModal.confirmText'),
            shouldShowCancelButton: false,
        });
    };

    const promptDisableExpensifyCardViaConcierge = async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.expensifyCard.disableCardTitle'),
            prompt: translate('workspace.moreFeatures.expensifyCard.disableCardPrompt'),
            confirmText: translate('workspace.moreFeatures.expensifyCard.disableCardButton'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
    };

    const promptDisableCompanyCardsViaConcierge = async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.companyCards.disableCardTitle'),
            prompt: translate('workspace.moreFeatures.companyCards.disableCardPrompt'),
            confirmText: translate('workspace.moreFeatures.companyCards.disableCardButton'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
    };

    const promptDisableSmartLimitForWorkflows = async () => {
        if (!isSmartLimitEnabled || !policyID) {
            return;
        }
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.workflowWarningModal.featureEnabledTitle'),
            prompt: translate('workspace.moreFeatures.workflowWarningModal.featureEnabledText'),
            confirmText: translate('workspace.moreFeatures.workflowWarningModal.confirmText'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
    };

    useEffect(() => {
        openPolicyMoreFeaturesPage(route.params.policyID);
    }, [route.params.policyID]);

    useNetwork({onReconnect: () => openPolicyMoreFeaturesPage(route.params.policyID)});

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceMoreFeaturesPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    icon={illustrations.Gears}
                    shouldUseHeadlineHeader
                    title={translate('workspace.common.moreFeatures')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldDisplayHelpButton
                    onBackButtonPress={() => Navigation.goBack()}
                />

                <ScrollView addBottomSafeAreaPadding>
                    <Text style={[styles.ph5, styles.mb5, styles.mt3, styles.textSupporting, styles.workspaceSectionMobile]}>{translate('workspace.moreFeatures.subtitle')}</Text>

                    <MoreFeaturesSection title={translate('workspace.moreFeatures.integrateSection.title')}>
                        <MoreFeatureToggle
                            icon={illustrations.Accounting}
                            title={translate('workspace.moreFeatures.connections.title')}
                            subtitle={translate('workspace.moreFeatures.connections.subtitle')}
                            isActive={isAccountingEnabled}
                            pendingAction={policy?.pendingFields?.areConnectionsEnabled}
                            disabled={hasAccountingConnection}
                            disabledAction={warnDisconnectAccountingFirst}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyConnections(policyID, isEnabled);
                            }}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED)}
                            onCloseError={() => {
                                if (!policyID) {
                                    return;
                                }
                                clearPolicyErrorField(policyID, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.ReceiptPartners}
                            title={translate('workspace.moreFeatures.receiptPartners.title')}
                            subtitle={translate('workspace.moreFeatures.receiptPartners.subtitle')}
                            isActive={policy?.receiptPartners?.enabled ?? false}
                            pendingAction={policy?.pendingFields?.receiptPartners}
                            disabled={isUberConnected}
                            disabledAction={warnReceiptPartnersStillConnected}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyReceiptPartners(policyID, isEnabled);
                            }}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED)}
                            onCloseError={() => {
                                if (!policyID) {
                                    return;
                                }
                                clearPolicyErrorField(policyID, CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(policyID));
                            }}
                        />
                        {isBetaEnabled(CONST.BETAS.GUSTO) && (
                            <MoreFeatureToggle
                                icon={illustrations.Members}
                                title={translate('workspace.hr.title')}
                                subtitle={translate('workspace.hr.subtitle')}
                                isActive={
                                    ((policy?.isHREnabled === true || !!policy?.connections?.gusto) && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED)) ?? false
                                }
                                pendingAction={policy?.pendingFields?.isHREnabled}
                                disabled={!!policy?.connections?.gusto}
                                onToggle={(isEnabled) => {
                                    if (!policyID) {
                                        return;
                                    }
                                    if (isEnabled && !isControlPolicy(policy)) {
                                        Navigation.navigate(
                                            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.hr.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)),
                                        );
                                        return;
                                    }
                                    enablePolicyHR(policyID, isEnabled);
                                }}
                                onPress={() => {
                                    if (!policyID) {
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.WORKSPACE_HR.getRoute(policyID));
                                }}
                            />
                        )}
                    </MoreFeaturesSection>

                    <MoreFeaturesSection title={translate('workspace.moreFeatures.organizeSection.title')}>
                        <MoreFeatureToggle
                            icon={illustrations.FolderOpen}
                            title={translate('workspace.moreFeatures.categories.title')}
                            subtitle={translate('workspace.moreFeatures.categories.subtitle')}
                            isActive={policy?.areCategoriesEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areCategoriesEnabled}
                            disabled={hasAccountingConnection}
                            disabledAction={warnAccountingManagesOrganizeFeature}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyCategories(policyData, isEnabled, true);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.Tag}
                            title={translate('workspace.moreFeatures.tags.title')}
                            subtitle={translate('workspace.moreFeatures.tags.subtitle')}
                            isActive={policy?.areTagsEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areTagsEnabled}
                            disabled={hasAccountingConnection}
                            disabledAction={warnAccountingManagesOrganizeFeature}
                            onToggle={(isEnabled) => {
                                enablePolicyTags(policyData, isEnabled);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.Coins}
                            title={translate('workspace.moreFeatures.taxes.title')}
                            subtitle={translate('workspace.moreFeatures.taxes.subtitle')}
                            isActive={(policy?.tax?.trackingEnabled ?? false) || isSyncTaxEnabled}
                            pendingAction={policy?.pendingFields?.tax}
                            disabled={hasAccountingConnection}
                            disabledAction={warnAccountingManagesOrganizeFeature}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                if (isEnabled) {
                                    enablePolicyTaxes(policyID, true, policy?.taxRates);
                                    return;
                                }
                                enablePolicyTaxes(policyID, false);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_TAXES.getRoute(policyID));
                            }}
                        />
                    </MoreFeaturesSection>

                    <MoreFeaturesSection title={translate('workspace.moreFeatures.manageSection.title')}>
                        <MoreFeatureToggle
                            icon={illustrations.Workflows}
                            title={translate('workspace.moreFeatures.workflows.title')}
                            subtitle={translate('workspace.moreFeatures.workflows.subtitle')}
                            isActive={policy?.areWorkflowsEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areWorkflowsEnabled}
                            disabled={isSmartLimitEnabled}
                            disabledAction={promptDisableSmartLimitForWorkflows}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyWorkflows(policyID, isEnabled, policy?.approvalMode, policy?.autoReporting, policy?.harvesting, policy?.reimbursementChoice);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.Rules}
                            title={translate('workspace.moreFeatures.rules.title')}
                            subtitle={translate('workspace.moreFeatures.rules.subtitle')}
                            isActive={policy?.areRulesEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areRulesEnabled}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                if (isEnabled && !isControlPolicy(policy)) {
                                    Navigation.navigate(
                                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)),
                                    );
                                    return;
                                }
                                enablePolicyRules(policy, isEnabled, undefined, policyData);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_RULES.getRoute(policyID));
                            }}
                        />
                    </MoreFeaturesSection>

                    <MoreFeaturesSection title={translate('workspace.moreFeatures.spendSection.title')}>
                        <MoreFeatureToggle
                            icon={illustrations.Car}
                            title={translate('workspace.moreFeatures.distanceRates.title')}
                            subtitle={translate('workspace.moreFeatures.distanceRates.subtitle')}
                            isActive={policy?.areDistanceRatesEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areDistanceRatesEnabled}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyDistanceRates(policyID, isEnabled, distanceRateCustomUnit);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.Luggage}
                            title={translate('workspace.moreFeatures.travel.title')}
                            subtitle={translate('workspace.moreFeatures.travel.subtitle')}
                            isActive={policy?.isTravelEnabled ?? false}
                            pendingAction={policy?.pendingFields?.isTravelEnabled}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyTravel(policyID, isEnabled);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_TRAVEL.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.HandCard}
                            title={translate('workspace.moreFeatures.expensifyCard.title')}
                            subtitle={translate('workspace.moreFeatures.expensifyCard.subtitle')}
                            isActive={policy?.areExpensifyCardsEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areExpensifyCardsEnabled}
                            disabled={(!!policy?.areExpensifyCardsEnabled && !!paymentBankAccountID) || !isEmptyObject(cardsList)}
                            disabledAction={promptDisableExpensifyCardViaConcierge}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enableExpensifyCard(policyID, isEnabled);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.CompanyCard}
                            title={translate('workspace.moreFeatures.companyCards.title')}
                            subtitle={translate('workspace.moreFeatures.companyCards.subtitle')}
                            isActive={policy?.areCompanyCardsEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areCompanyCardsEnabled}
                            disabled={!isEmptyObject(getCompanyFeeds(cardFeeds))}
                            disabledAction={promptDisableCompanyCardsViaConcierge}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enableCompanyCards(policyID, isEnabled, true);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.PerDiem}
                            title={translate('workspace.moreFeatures.perDiem.title')}
                            subtitle={translate('workspace.moreFeatures.perDiem.subtitle')}
                            isActive={(policy?.arePerDiemRatesEnabled && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED)) ?? false}
                            pendingAction={policy?.pendingFields?.arePerDiemRatesEnabled}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                if (isEnabled && !isControlPolicy(policy)) {
                                    Navigation.navigate(
                                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)),
                                    );
                                    return;
                                }
                                enablePerDiem(policyID, isEnabled, perDiemCustomUnit?.customUnitID, true, quickAction);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID));
                            }}
                        />
                        <MoreFeatureToggle
                            icon={illustrations.Clock}
                            title={translate('workspace.moreFeatures.timeTracking.title')}
                            subtitle={translate('workspace.moreFeatures.timeTracking.subtitle')}
                            isActive={isTimeTrackingEnabled(policy)}
                            pendingAction={policy?.pendingFields?.isTimeTrackingEnabled}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyTimeTracking(policyID, isEnabled);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_TIME_TRACKING.getRoute(policyID));
                            }}
                        />
                    </MoreFeaturesSection>

                    <MoreFeaturesSection title={translate('workspace.moreFeatures.earnSection.title')}>
                        <MoreFeatureToggle
                            icon={illustrations.InvoiceBlue}
                            title={translate('workspace.moreFeatures.invoices.title')}
                            subtitle={translate('workspace.moreFeatures.invoices.subtitle')}
                            isActive={policy?.areInvoicesEnabled ?? false}
                            pendingAction={policy?.pendingFields?.areInvoicesEnabled}
                            onToggle={(isEnabled) => {
                                if (!policyID) {
                                    return;
                                }
                                enablePolicyInvoicing(policyID, isEnabled);
                            }}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policyID));
                            }}
                        />
                    </MoreFeaturesSection>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMoreFeaturesPage);
