import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
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
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import {isControlPolicy} from '@libs/PolicyUtils';
import * as Category from '@userActions/Policy/Category';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import * as Policy from '@userActions/Policy/Policy';
import * as Tag from '@userActions/Policy/Tag';
import * as Report from '@userActions/Report';
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

type WorkspaceMoreFeaturesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.MORE_FEATURES>;

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {canUseWorkspaceFeeds, canUseWorkspaceRules, canUseCompanyCardFeeds} = usePermissions();
    const hasAccountingConnection = !isEmptyObject(policy?.connections);
    const isAccountingEnabled = !!policy?.areConnectionsEnabled || !isEmptyObject(policy?.connections);
    const isSyncTaxEnabled =
        !!policy?.connections?.quickbooksOnline?.config?.syncTax ||
        !!policy?.connections?.xero?.config?.importTaxRates ||
        !!policy?.connections?.netsuite?.options?.config?.syncOptions?.syncTax;
    const policyID = policy?.id;
    const workspaceAccountID = policy?.workspaceAccountID;
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID.toString()}_${CONST.EXPENSIFY_CARD.BANK}`);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID.toString()}`);
    const [isOrganizeWarningModalOpen, setIsOrganizeWarningModalOpen] = useState(false);
    const [isIntegrateWarningModalOpen, setIsIntegrateWarningModalOpen] = useState(false);
    const [isReportFieldsWarningModalOpen, setIsReportFieldsWarningModalOpen] = useState(false);
    const [isDisableExpensifyCardWarningModalOpen, setIsDisableExpensifyCardWarningModalOpen] = useState(false);
    const [isDisableCompanyCardsWarningModalOpen, setIsDisableCompanyCardsWarningModalOpen] = useState(false);

    const onDisabledOrganizeSwitchPress = useCallback(() => {
        if (!hasAccountingConnection) {
            return;
        }
        setIsOrganizeWarningModalOpen(true);
    }, [hasAccountingConnection]);

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
                DistanceRate.enablePolicyDistanceRates(policyID, isEnabled);
            },
        },
    ];

    // TODO remove this when feature will be fully done, and move spend item inside spendItems array
    if (canUseWorkspaceFeeds) {
        spendItems.push({
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
                Policy.enableExpensifyCard(policyID, isEnabled);
            },
            disabledAction: () => {
                setIsDisableExpensifyCardWarningModalOpen(true);
            },
        });
    }

    if (canUseCompanyCardFeeds) {
        spendItems.push({
            icon: Illustrations.CompanyCard,
            titleTranslationKey: 'workspace.moreFeatures.companyCards.title',
            subtitleTranslationKey: 'workspace.moreFeatures.companyCards.subtitle',
            isActive: policy?.areCompanyCardsEnabled ?? false,
            pendingAction: policy?.pendingFields?.areCompanyCardsEnabled,
            disabled: !isEmptyObject(cardFeeds?.companyCards),
            action: (isEnabled: boolean) => {
                if (!policyID) {
                    return;
                }
                if (isEnabled && !isControlPolicy(policy)) {
                    Navigation.navigate(
                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)),
                    );
                    return;
                }
                Policy.enableCompanyCards(policyID, isEnabled);
            },
            disabledAction: () => {
                setIsDisableCompanyCardsWarningModalOpen(true);
            },
        });
    }

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
                Policy.enablePolicyWorkflows(policyID, isEnabled);
            },
        },
    ];

    // TODO remove this when feature will be fully done, and move manage item inside manageItems array
    if (canUseWorkspaceRules) {
        manageItems.splice(1, 0, {
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
                Policy.enablePolicyRules(policyID, isEnabled);
            },
        });
    }

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
                Policy.enablePolicyInvoicing(policyID, isEnabled);
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
                Category.enablePolicyCategories(policyID, isEnabled);
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
                Tag.enablePolicyTags(policyID, isEnabled);
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
                Policy.enablePolicyTaxes(policyID, isEnabled);
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

                    Policy.enablePolicyReportFields(policyID, true);
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
                Policy.enablePolicyConnections(policyID, isEnabled);
            },
            disabled: hasAccountingConnection,
            errors: ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED),
            onCloseError: () => {
                if (!policyID) {
                    return;
                }
                Policy.clearPolicyErrorField(policyID, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED);
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
            titleTranslationKey: 'workspace.moreFeatures.manageSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.manageSection.subtitle',
            items: manageItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.earnSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.earnSection.subtitle',
            items: earnItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.organizeSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.organizeSection.subtitle',
            items: organizeItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.integrateSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.integrateSection.subtitle',
            items: integrateItems,
        },
    ];

    const renderItem = useCallback(
        (item: Item) => (
            <View
                key={item.titleTranslationKey}
                style={styles.mt7}
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
        [styles, translate],
    );

    const renderSection = useCallback(
        (section: SectionObject) => (
            <View
                key={section.titleTranslationKey}
                style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}
            >
                <Section
                    containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                    title={translate(section.titleTranslationKey)}
                    titleStyles={styles.textStrong}
                    subtitle={translate(section.subtitleTranslationKey)}
                    subtitleMuted
                >
                    {section.items.map(renderItem)}
                </Section>
            </View>
        ),
        [shouldUseNarrowLayout, styles, renderItem, translate],
    );

    const fetchFeatures = useCallback(() => {
        Policy.openPolicyMoreFeaturesPage(route.params.policyID);
    }, [route.params.policyID]);

    useNetwork({onReconnect: fetchFeatures});

    useFocusEffect(
        useCallback(() => {
            fetchFeatures();
        }, [fetchFeatures]),
    );

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
                    title={translate('workspace.common.moreFeatures')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.mb4, styles.mt3, styles.textSupporting, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        {translate('workspace.moreFeatures.subtitle')}
                    </Text>
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
                        Policy.enablePolicyReportFields(policyID, false);
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
                        Report.navigateToConciergeChat(true);
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
                        Report.navigateToConciergeChat(true);
                    }}
                    onCancel={() => setIsDisableCompanyCardsWarningModalOpen(false)}
                    prompt={translate('workspace.moreFeatures.companyCards.disableCardPrompt')}
                    confirmText={translate('workspace.moreFeatures.companyCards.disableCardButton')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default withPolicyAndFullscreenLoading(WorkspaceMoreFeaturesPage);
