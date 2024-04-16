import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {WorkspacesCentralPaneNavigatorParamList} from '@libs/Navigation/types';
import * as Policy from '@userActions/Policy';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import AdminPolicyAccessOrNotFoundWrapper from './AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from './PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import ToggleSettingOptionRow from './workflows/ToggleSettingsOptionRow';

type WorkspaceMoreFeaturesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.MORE_FEATURES>;

type Item = {
    icon: IconAsset;
    titleTranslationKey: TranslationPaths;
    subtitleTranslationKey: TranslationPaths;
    isActive: boolean;
    disabled?: boolean;
    action: (isEnabled: boolean) => void;
    pendingAction: PendingAction | undefined;
};

type SectionObject = {
    titleTranslationKey: TranslationPaths;
    subtitleTranslationKey: TranslationPaths;
    items: Item[];
};

function WorkspaceMoreFeaturesPage({policy, route}: WorkspaceMoreFeaturesPageProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {canUseAccountingIntegrations} = usePermissions();
    const hasAccountingConnection = !!policy?.areConnectionsEnabled && !!policy?.connections;
    const isSyncTaxEnabled = !!policy?.connections?.quickbooksOnline.config.syncTax;

    const spendItems: Item[] = [
        {
            icon: Illustrations.Car,
            titleTranslationKey: 'workspace.moreFeatures.distanceRates.title',
            subtitleTranslationKey: 'workspace.moreFeatures.distanceRates.subtitle',
            isActive: policy?.areDistanceRatesEnabled ?? false,
            pendingAction: policy?.pendingFields?.areDistanceRatesEnabled,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyDistanceRates(policy?.id ?? '', isEnabled);
            },
        },
        {
            icon: Illustrations.Workflows,
            titleTranslationKey: 'workspace.moreFeatures.workflows.title',
            subtitleTranslationKey: 'workspace.moreFeatures.workflows.subtitle',
            isActive: policy?.areWorkflowsEnabled ?? false,
            pendingAction: policy?.pendingFields?.areWorkflowsEnabled,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyWorkflows(policy?.id ?? '', isEnabled);
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
            pendingAction: policy?.pendingFields?.areCategoriesEnabled,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyCategories(policy?.id ?? '', isEnabled);
            },
        },
        {
            icon: Illustrations.Tag,
            titleTranslationKey: 'workspace.moreFeatures.tags.title',
            subtitleTranslationKey: 'workspace.moreFeatures.tags.subtitle',
            isActive: policy?.areTagsEnabled ?? false,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.areTagsEnabled,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyTags(policy?.id ?? '', isEnabled);
            },
        },
        {
            icon: Illustrations.Coins,
            titleTranslationKey: 'workspace.moreFeatures.taxes.title',
            subtitleTranslationKey: 'workspace.moreFeatures.taxes.subtitle',
            isActive: (policy?.tax?.trackingEnabled ?? false) || isSyncTaxEnabled,
            disabled: isSyncTaxEnabled,
            pendingAction: policy?.pendingFields?.tax,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyTaxes(policy?.id ?? '', isEnabled);
            },
        },
    ];

    const integrateItems: Item[] = [
        {
            icon: Illustrations.Accounting,
            titleTranslationKey: 'workspace.moreFeatures.connections.title',
            subtitleTranslationKey: 'workspace.moreFeatures.connections.subtitle',
            isActive: !!policy?.areConnectionsEnabled,
            pendingAction: policy?.pendingFields?.areConnectionsEnabled,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyConnections(policy?.id ?? '', isEnabled);
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
            titleTranslationKey: 'workspace.moreFeatures.organizeSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.organizeSection.subtitle',
            items: organizeItems,
        },
    ];

    if (canUseAccountingIntegrations) {
        sections.push({
            titleTranslationKey: 'workspace.moreFeatures.integrateSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.integrateSection.subtitle',
            items: integrateItems,
        });
    }

    const renderItem = useCallback(
        (item: Item) => (
            <View
                key={item.titleTranslationKey}
                style={styles.mt7}
            >
                <ToggleSettingOptionRow
                    icon={item.icon}
                    title={translate(item.titleTranslationKey)}
                    subtitle={translate(item.subtitleTranslationKey)}
                    isActive={item.isActive}
                    pendingAction={item.pendingAction}
                    onToggle={item.action}
                    disabled={item.disabled}
                />
            </View>
        ),
        [styles, translate],
    );

    const renderSection = useCallback(
        (section: SectionObject) => (
            <View
                key={section.titleTranslationKey}
                style={[styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}
            >
                <Section
                    containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                    title={translate(section.titleTranslationKey)}
                    titleStyles={styles.textStrong}
                    subtitle={translate(section.subtitleTranslationKey)}
                    subtitleMuted
                >
                    {section.items.map(renderItem)}
                </Section>
            </View>
        ),
        [isSmallScreenWidth, styles, renderItem, translate],
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
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceMoreFeaturesPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.Gears}
                        title={translate('workspace.common.moreFeatures')}
                        shouldShowBackButton={isSmallScreenWidth}
                    />

                    <ScrollView contentContainerStyle={styles.pb2}>{sections.map(renderSection)}</ScrollView>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default withPolicyAndFullscreenLoading(WorkspaceMoreFeaturesPage);
