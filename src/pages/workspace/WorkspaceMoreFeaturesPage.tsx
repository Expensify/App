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
import type {ToggleSettingOptionRowProps} from './workflows/ToggleSettingsOptionRow';
import ToggleSettingOptionRow from './workflows/ToggleSettingsOptionRow';

/**
areCategoriesEnabled
areTagsEnabled
areDistanceRatesEnabled
areWorkflowsEnabled
areReportFieldsEnabled
areConnectionsEnabled
tax.trackingEnabled (see above)
*/

type WorkspaceMoreFeaturesPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceMoreFeaturesPage({route}: WorkspaceMoreFeaturesPageProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const spendItems: ToggleSettingOptionRowProps[] = useMemo(
        () => [
            {
                icon: Illustrations.Car,
                title: 'Distance rates',
                subtitle: 'Add, update and enforce rates',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.HandCard,
                title: 'Expensify card',
                subtitle: 'Gain insights and control over spend',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Workflows,
                title: 'Workflows',
                subtitle: 'Configure how spend is approved and paid',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
        ],
        [],
    );

    const organizeItems: ToggleSettingOptionRowProps[] = useMemo(
        () => [
            {
                icon: Illustrations.FolderOpen,
                title: 'Categories',
                subtitle: 'Track and organize spend',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Tag,
                title: 'Tags',
                subtitle: 'Add additional ways to classify spend',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Coins,
                title: 'Taxes',
                subtitle: 'Document and reclaim eligible taxes.',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Pencil,
                title: 'Report fields',
                subtitle: 'Subtitle...',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
            {
                icon: Illustrations.Accounting,
                title: 'Connections',
                subtitle: 'Subtitle...',
                onToggle: (isEnabled: boolean) => {
                    console.log('isEnabled', isEnabled);
                },
                isActive: false,
                pendingAction: undefined,
            },
        ],
        [],
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

                    <ScrollView>
                        <View style={[styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <Section
                                containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                                title="Spend"
                                titleStyles={styles.textStrong}
                                subtitle="Enable optional functionality that helps you scale your team."
                                subtitleMuted
                            >
                                {spendItems.map(renderItem)}
                            </Section>
                        </View>

                        <View style={[styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <Section
                                containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                                title="Organize"
                                titleStyles={styles.textStrong}
                                subtitle="Group and analyze spend, record every tax paid."
                                subtitleMuted
                            >
                                {organizeItems.map(renderItem)}
                            </Section>
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default WorkspaceMoreFeaturesPage;
