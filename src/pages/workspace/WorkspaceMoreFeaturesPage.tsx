import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {filterInactiveCards, getAllCardsForWorkspace, getCompanyFeeds, isSmartLimitEnabled as isSmartLimitEnabledUtil} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPerDiemCustomUnit, isControlPolicy} from '@libs/PolicyUtils';
import {enablePolicyCategories} from '@userActions/Policy/Category';
import {enablePolicyDistanceRates} from '@userActions/Policy/DistanceRate';
import {enablePerDiem} from '@userActions/Policy/PerDiem';
import {
    clearPolicyErrorField,
    enableCompanyCards,
    enableExpensifyCard,
    enablePolicyConnections,
    enablePolicyInvoicing,
    enablePolicyReportFields,
    enablePolicyRules,
    enablePolicyTaxes,
    enablePolicyWorkflows,
    openPolicyMoreFeaturesPage,
} from '@userActions/Policy/Policy';
import {enablePolicyTags} from '@userActions/Policy/Tag';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import ToggleSettingOptionRow from './workflows/ToggleSettingsOptionRow';

type WorkspaceMoreFeaturesPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.MORE_FEATURES>;

type Item = {
    icon: IconAsset;
    titleTranslationKey: TranslationPaths;
    subtitleTranslationKey: TranslationPaths;
    isActive: boolean;
    disabled?: boolean;
    action: (isEnabled: boolean) => void;
    disabledAction?: () => void;
    pendingAction: PendingAction | undefined;
    errors?: Errors;
    onCloseError?: () => void;
};

type SectionObject = {
    titleTranslationKey: TranslationPaths;
    subtitleTranslationKey: TranslationPaths;
    items: Item[];
};

function WorkspaceMoreFeaturesPage({policy, route}: WorkspaceMoreFeaturesPageProps) {
    const styles = useThemeStyles();
    const stylesutils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const {translate} = useLocalize();
    const hasAccountingConnection = !isEmptyObject(policy?.connections);
    const isAccountingEnabled = !!policy?.areConnectionsEnabled || !isEmptyObject(policy?.connections);
    const isSyncTaxEnabled =
        !!policy?.connections?.quickbooksOnline?.config?.syncTax ||
        !!policy?.connections?.xero?.config?.importTaxRates ||
        !!policy?.connections?.netsuite?.options?.config?.syncOptions?.syncTax;
    const policyID = policy?.id;
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID.toString()}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID.toString()}`);
    const [isOrganizeWarningModalOpen, setIsOrganizeWarningModalOpen] = useState(false);
    const [isIntegrateWarningModalOpen, setIsIntegrateWarningModalOpen] = useState(false);
    const [isReportFieldsWarningModalOpen, setIsReportFieldsWarningModalOpen] = useState(false);
    const [isDisableExpensifyCardWarningModalOpen, setIsDisableExpensifyCardWarningModalOpen] = useState(false);
    const [isDisableCompanyCardsWarningModalOpen, setIsDisableCompanyCardsWarningModalOpen] = useState(false);
    const [isDisableWorkflowWarningModalOpen, setIsDisableWorkflowWarningModalOpen] = useState(false);

    const perDiemCustomUnit = getPerDiemCustomUnit(policy);

    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const workspaceCards = getAllCardsForWorkspace(workspaceAccountID, cardList);
    const isSmartLimitEnabled = isSmartLimitEnabledUtil(workspaceCards);

    const onDisabledOrganizeSwitchPress = useCallback(() => {
        if (!hasAccountingConnection) {
            return;
        }
        setIsOrganizeWarningModalOpen(true);
    }, [hasAccountingConnection]);

    const onDisabledWorkflowPress = useCallback(() => {
        if (!isSmartLimitEnabled) {
            return;
        }
        setIsDisableWorkflowWarningModalOpen(true);
    }, [isSmartLimitEnabled]);

    const spendItems: Item[] = [
        {
            icon: Illustrations.Car,
            titleTranslationKey: 'workspace.moreFeatures.distanceRates.title',
            subtitleTranslationKey: 'workspace.moreFeatures.distanceRates.subtitle',
            isActive: policy?.areDistanceRatesEnabled ?? false,
            pendingAction: policy?.pendingFields?.areDistanceRatesEnabled,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyDistanceRates(policyID, isEnabled);
            },
        },
        {
            icon: Illustrations.HandCard,
            titleTranslationKey: 'workspace.moreFeatures.expensifyCard.title',
            subtitleTranslationKey: 'workspace.moreFeatures.expensifyCard.subtitle',
            isActive: policy?.areExpensifyCardsEnabled ?? false,
            pendingAction: policy?.pendingFields?.areExpensifyCardsEnabled,
            disabled: !isEmptyObject(cardsList),
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enableExpensifyCard(policyID, isEnabled);
            },
            disabledAction: () => {
                setIsDisableExpensifyCardWarningModalOpen(true);
            },
        },
    ];

    spendItems.push({
        icon: Illustrations.CompanyCard,
        titleTranslationKey: 'workspace.moreFeatures.companyCards.title',
        subtitleTranslationKey: 'workspace.moreFeatures.companyCards.subtitle',
        isActive: policy?.areCompanyCardsEnabled ?? false,
        pendingAction: policy?.pendingFields?.areCompanyCardsEnabled,
        disabled: !isEmptyObject(getCompanyFeeds(cardFeeds)),
        action: (isEnabled: boolean) => {
            if (!policyID) {
                return;
            }
            enableCompanyCards(policyID, isEnabled, true);
        },
        disabledAction: () => {
            setIsDisableCompanyCardsWarningModalOpen(true);
        },
    });

    spendItems.push({
        icon: Illustrations.PerDiem,
        titleTranslationKey: 'workspace.moreFeatures.perDiem.title',
        subtitleTranslationKey: 'workspace.moreFeatures.perDiem.subtitle',
        isActive: policy?.arePerDiemRatesEnabled ?? false,
        pendingAction: policy?.pendingFields?.arePerDiemRatesEnabled,
        action: (isEnabled: boolean) => {
            if (!policyID) {
                return;
            }
            if (isEnabled && !isControlPolicy(policy)) {
                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)));
                return;
            }
            enablePerDiem(policyID, isEnabled, perDiemCustomUnit?.customUnitID, true);
        },
    });

    const manageItems: Item[] = [
        {
            icon: Illustrations.Workflows,
            titleTranslationKey: 'workspace.moreFeatures.workflows.title',
            subtitleTranslationKey: 'workspace.moreFeatures.workflows.subtitle',
            isActive: policy?.areWorkflowsEnabled ?? false,
            pendingAction: policy?.pendingFields?.areWorkflowsEnabled,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyWorkflows(policyID, isEnabled);
            },
            disabled: isSmartLimitEnabled,
            disabledAction: onDisabledWorkflowPress,
        },
        {
            icon: Illustrations.Rules,
            titleTranslationKey: 'workspace.moreFeatures.rules.title',
            subtitleTranslationKey: 'workspace.moreFeatures.rules.subtitle',
            isActive: policy?.areRulesEnabled ?? false,
            pendingAction: policy?.pendingFields?.areRulesEnabled,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }

                if (isEnabled && !isControlPolicy(policy)) {
                    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)));
                    return;
                }
                enablePolicyRules(policyID, isEnabled);
            },
        },
    ];

    const earnItems: Item[] = [
        {
            icon: Illustrations.InvoiceBlue,
            titleTranslationKey: 'workspace.moreFeatures.invoices.title',
            subtitleTranslationKey: 'workspace.moreFeatures.invoices.subtitle',
            isActive: policy?.areInvoicesEnabled ?? false,
            pendingAction: policy?.pendingFields?.areInvoicesEnabled,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyInvoicing(policyID, isEnabled);
            },
        },
    ];

    const organizeItems: Item[] = [
        {
            icon: Illustrations.FolderOpen,
            titleTranslationKey: 'workspace.moreFeatures.categories.title',
            subtitleTranslationKey: 'workspace.moreFeatures.categories.subtitle',
            isActive: policy?.areCategoriesEnabled ?? false,
            disabled: hasAccountingConnection,
            disabledAction: onDisabledOrganizeSwitchPress,
            pendingAction: policy?.pendingFields?.areCategoriesEnabled,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyCategories(policyID, isEnabled, true);
            },
        },
        {
            icon: Illustrations.Tag,
            titleTranslationKey: 'workspace.moreFeatures.tags.title',
            subtitleTranslationKey: 'workspace.moreFeatures.tags.subtitle',
            isActive: policy?.areTagsEnabled ?? false,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.areTagsEnabled,
            disabledAction: onDisabledOrganizeSwitchPress,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyTags(policyID, isEnabled);
            },
        },
        {
            icon: Illustrations.Coins,
            titleTranslationKey: 'workspace.moreFeatures.taxes.title',
            subtitleTranslationKey: 'workspace.moreFeatures.taxes.subtitle',
            isActive: (policy?.tax?.trackingEnabled ?? false) || isSyncTaxEnabled,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.tax,
            disabledAction: onDisabledOrganizeSwitchPress,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyTaxes(policyID, isEnabled);
            },
        },
        {
            icon: Illustrations.Pencil,
            titleTranslationKey: 'workspace.moreFeatures.reportFields.title',
            subtitleTranslationKey: 'workspace.moreFeatures.reportFields.subtitle',
            isActive: policy?.areReportFieldsEnabled ?? false,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.areReportFieldsEnabled,
            disabledAction: onDisabledOrganizeSwitchPress,
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                if (isEnabled) {
                    if (!isControlPolicy(policy)) {
                        Navigation.navigate(
                            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)),
                        );
                        return;
                    }

                    enablePolicyReportFields(policyID, true, true);
                    return;
                }
                setIsReportFieldsWarningModalOpen(true);
            },
        },
    ];

    const integrateItems: Item[] = [
        {
            icon: Illustrations.Accounting,
            titleTranslationKey: 'workspace.moreFeatures.connections.title',
            subtitleTranslationKey: 'workspace.moreFeatures.connections.subtitle',
            isActive: isAccountingEnabled,
            pendingAction: policy?.pendingFields?.areConnectionsEnabled,
            disabledAction: () => {
                if (!hasAccountingConnection) {
                    return;
                }
                setIsIntegrateWarningModalOpen(true);
            },
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                enablePolicyConnections(policyID, isEnabled);
            },
            disabled: hasAccountingConnection,
            errors: getLatestErrorField(policy ?? {}, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED),
            onCloseError: () => {
                if (!policyID) {
                    return;
                }
                clearPolicyErrorField(policyID, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED);
            },
        },
    ];

    const sections: SectionObject[] = [
        {
            titleTranslationKey: 'workspace.moreFeatures.spendSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.spendSection.subtitle',
            items: spendItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.integrateSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.integrateSection.subtitle',
            items: integrateItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.organizeSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.organizeSection.subtitle',
            items: organizeItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.manageSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.manageSection.subtitle',
            items: manageItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.earnSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.earnSection.subtitle',
            items: earnItems,
        },
    ];

    const renderItem = useCallback(
        (item: Item) => (
            <View
                key={item.titleTranslationKey}
                style={[styles.workspaceSectionMoreFeaturesItem, shouldUseNarrowLayout && styles.flexBasis100, shouldUseNarrowLayout && stylesutils.getMinimumWidth(0)]}
            >
                <ToggleSettingOptionRow
                    icon={item.icon}
                    disabled={item.disabled}
                    disabledAction={item.disabledAction}
                    title={translate(item.titleTranslationKey)}
                    titleStyle={styles.textStrong}
                    subtitle={translate(item.subtitleTranslationKey)}
                    switchAccessibilityLabel={translate(item.subtitleTranslationKey)}
                    isActive={item.isActive}
                    pendingAction={item.pendingAction}
                    onToggle={item.action}
                    showLockIcon={item.disabled}
                    errors={item.errors}
                    onCloseError={item.onCloseError}
                />
            </View>
        ),
        [styles, stylesutils, shouldUseNarrowLayout, translate],
    );

    /** Used to fill row space in the Section items when there are odd number of items to create equal margins for last odd item. */
    const sectionRowFillerItem = useCallback(
        (section: SectionObject) => {
            if (section.items.length % 2 === 0) {
                return null;
            }

            return (
                <View
                    key="section-filler-col"
                    aria-hidden
                    accessibilityElementsHidden
                    style={[
                        styles.workspaceSectionMoreFeaturesItem,
                        shouldUseNarrowLayout && stylesutils.getMinimumWidth(0),
                        styles.p0,
                        styles.mt0,
                        styles.visibilityHidden,
                        styles.bgTransparent,
                    ]}
                />
            );
        },
        [styles, stylesutils, shouldUseNarrowLayout],
    );

    const renderSection = useCallback(
        (section: SectionObject) => (
            <View
                key={section.titleTranslationKey}
                style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : {}]}
            >
                <Section
                    containerStyles={[styles.ph1, styles.pv0, styles.bgTransparent, styles.noBorderRadius]}
                    childrenStyles={[styles.flexRow, styles.flexWrap, styles.columnGap3]}
                    renderTitle={() => <Text style={styles.mutedNormalTextLabel}>{translate(section.titleTranslationKey)}</Text>}
                    subtitleMuted
                >
                    {section.items.map(renderItem)}
                    {sectionRowFillerItem(section)}
                </Section>
            </View>
        ),
        [shouldUseNarrowLayout, styles, renderItem, translate, sectionRowFillerItem],
    );

    const fetchFeatures = useCallback(() => {
        openPolicyMoreFeaturesPage(route.params.policyID);
    }, [route.params.policyID]);

    useEffect(() => {
        fetchFeatures();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useNetwork({onReconnect: fetchFeatures});

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceMoreFeaturesPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    icon={Illustrations.Gears}
                    shouldUseHeadlineHeader
                    title={translate('workspace.common.moreFeatures')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                    <Text style={[styles.ph5, styles.mb5, styles.mt3, styles.textSupporting, styles.workspaceSectionMobile]}>{translate('workspace.moreFeatures.subtitle')}</Text>
                    {sections.map(renderSection)}
                </ScrollView>

                <ConfirmModal
                    title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsOrganizeWarningModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                    }}
                    onCancel={() => setIsOrganizeWarningModalOpen(false)}
                    isVisible={isOrganizeWarningModalOpen}
                    prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')}
                    confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsIntegrateWarningModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                    }}
                    onCancel={() => setIsIntegrateWarningModalOpen(false)}
                    isVisible={isIntegrateWarningModalOpen}
                    prompt={translate('workspace.moreFeatures.connectionsWarningModal.disconnectText')}
                    confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={translate('workspace.reportFields.disableReportFields')}
                    isVisible={isReportFieldsWarningModalOpen}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsReportFieldsWarningModalOpen(false);
                        enablePolicyReportFields(policyID, false, true);
                    }}
                    onCancel={() => setIsReportFieldsWarningModalOpen(false)}
                    prompt={translate('workspace.reportFields.disableReportFieldsConfirmation')}
                    confirmText={translate('common.disable')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.expensifyCard.disableCardTitle')}
                    isVisible={isDisableExpensifyCardWarningModalOpen}
                    onConfirm={() => {
                        setIsDisableExpensifyCardWarningModalOpen(false);
                        navigateToConciergeChat(true);
                    }}
                    onCancel={() => setIsDisableExpensifyCardWarningModalOpen(false)}
                    prompt={translate('workspace.moreFeatures.expensifyCard.disableCardPrompt')}
                    confirmText={translate('workspace.moreFeatures.expensifyCard.disableCardButton')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.companyCards.disableCardTitle')}
                    isVisible={isDisableCompanyCardsWarningModalOpen}
                    onConfirm={() => {
                        setIsDisableCompanyCardsWarningModalOpen(false);
                        navigateToConciergeChat(true);
                    }}
                    onCancel={() => setIsDisableCompanyCardsWarningModalOpen(false)}
                    prompt={translate('workspace.moreFeatures.companyCards.disableCardPrompt')}
                    confirmText={translate('workspace.moreFeatures.companyCards.disableCardButton')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.workflowWarningModal.featureEnabledTitle')}
                    isVisible={isDisableWorkflowWarningModalOpen}
                    onConfirm={() => {
                        setIsDisableWorkflowWarningModalOpen(false);
                        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
                    }}
                    onCancel={() => setIsDisableWorkflowWarningModalOpen(false)}
                    prompt={translate('workspace.moreFeatures.workflowWarningModal.featureEnabledText')}
                    confirmText={translate('workspace.moreFeatures.workflowWarningModal.confirmText')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default withPolicyAndFullscreenLoading(WorkspaceMoreFeaturesPage);
