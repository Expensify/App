/* eslint-disable no-console */
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import AdminPolicyAccessOrNotFoundWrapper from './AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from './PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {ToggleSettingOptionRowProps} from './workflows/ToggleSettingsOptionRow';
import ToggleSettingOptionRow from './workflows/ToggleSettingsOptionRow';

type WorkspaceMoreFeaturesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceMoreFeaturesPage({policy, route}: WorkspaceMoreFeaturesPageProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const spendItems: ToggleSettingOptionRowProps[] = useMemo(
        () => [
            {
                icon: Illustrations.Car,
                title: translate('workspace.moreFeatures.distanceRates.title'),
                subtitle: translate('workspace.moreFeatures.distanceRates.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.areDistanceRatesEnabled ?? false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Workflows,
                title: translate('workspace.moreFeatures.workflows.title'),
                subtitle: translate('workspace.moreFeatures.workflows.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.areWorkflowsEnabled ?? false,
                pendingAction: undefined,
            },
        ],
        [policy?.areDistanceRatesEnabled, policy?.areWorkflowsEnabled, translate],
    );

    const organizeItems: ToggleSettingOptionRowProps[] = useMemo(
        () => [
            {
                icon: Illustrations.FolderOpen,
                title: translate('workspace.moreFeatures.categories.title'),
                subtitle: translate('workspace.moreFeatures.categories.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.areCategoriesEnabled ?? false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Tag,
                title: translate('workspace.moreFeatures.tags.title'),
                subtitle: translate('workspace.moreFeatures.tags.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.areTagsEnabled ?? false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Coins,
                title: translate('workspace.moreFeatures.taxes.title'),
                subtitle: translate('workspace.moreFeatures.taxes.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.tax?.trackingEnabled ?? false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Pencil,
                title: translate('workspace.moreFeatures.reportFields.title'),
                subtitle: translate('workspace.moreFeatures.reportFields.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.areReportFieldsEnabled ?? false,
                pendingAction: undefined,
            },
        ],
        [policy?.areCategoriesEnabled, policy?.areReportFieldsEnabled, policy?.areTagsEnabled, policy?.tax?.trackingEnabled, translate],
    );

    const integrateItems: ToggleSettingOptionRowProps[] = useMemo(
        () => [
            {
                icon: Illustrations.Accounting,
                title: translate('workspace.moreFeatures.connections.title'),
                subtitle: translate('workspace.moreFeatures.connections.subtitle'),
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: policy?.areConnectionsEnabled ?? false,
                pendingAction: undefined,
            },
        ],
        [policy?.areConnectionsEnabled, translate],
    );

    const sections = useMemo(
        () => [
            {
                title: translate('workspace.moreFeatures.spendSection.title'),
                subtitle: translate('workspace.moreFeatures.spendSection.subtitle'),
                items: spendItems,
            },
            {
                title: translate('workspace.moreFeatures.organizeSection.title'),
                subtitle: translate('workspace.moreFeatures.organizeSection.subtitle'),
                items: organizeItems,
            },
            {
                title: translate('workspace.moreFeatures.integrateSection.title'),
                subtitle: translate('workspace.moreFeatures.integrateSection.subtitle'),
                items: integrateItems,
            },
        ],
        [integrateItems, organizeItems, spendItems, translate],
    );

    const renderItem = (item: ToggleSettingOptionRowProps) => (
        <View
            key={item.title}
            style={styles.mt7}
        >
            <ToggleSettingOptionRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onToggle={item.onToggle}
                isActive={item.isActive}
                pendingAction={item.pendingAction}
            />
        </View>
    );

    const renderSection = (section: (typeof sections)[0]) => (
        <View
            key={section.title}
            style={[styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}
        >
            <Section
                containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                title={section.title}
                titleStyles={styles.textStrong}
                subtitle={section.subtitle}
                subtitleMuted
            >
                {section.items.map(renderItem)}
            </Section>
        </View>
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

                    <ScrollView>{sections.map(renderSection)}</ScrollView>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default withPolicyAndFullscreenLoading(WorkspaceMoreFeaturesPage);
