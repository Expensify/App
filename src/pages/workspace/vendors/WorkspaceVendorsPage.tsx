import Header from '@components/Header';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import ScreenWrapper from '@components/ScreenWrapper';
import SidePanelButton from '@components/SidePanel/SidePanelButton';
import type {WorkspaceVendorTableRowData} from '@components/Tables/WorkspaceVendorsTable';
import WorkspaceVendorsTable from '@components/Tables/WorkspaceVendorsTable';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getActiveVendorMatchingIntegration, getMatchingVendors, hasVendorFeature, sortVendors} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type WorkspaceVendorsPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VENDORS>;

function WorkspaceVendorsPage({policy, route}: WorkspaceVendorsPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();

    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.vendors');

    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const isFeatureAvailable = hasVendorFeature(policy, isVendorMatchingBetaEnabled);
    const vendors = getMatchingVendors(policy);
    const sortedVendors = sortVendors(vendors, localeCompare);
    const connectedIntegration = getActiveVendorMatchingIntegration(policy);
    const currentConnectionName = connectedIntegration ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectedIntegration] : undefined;

    const vendorRows: WorkspaceVendorTableRowData[] = useMemo(
        () =>
            sortedVendors.map((vendor) => ({
                keyForList: vendor.id,
                name: vendor.name,
            })),
        [sortedVendors],
    );

    const headerContent = currentConnectionName ? (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <ImportedFromAccountingSoftware
                policyID={policyID}
                currentConnectionName={currentConnectionName}
                connectedIntegration={connectedIntegration}
                translatedText={translate('workspace.vendors.managedInAccountingSoftware')}
            />
        </View>
    ) : undefined;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.VENDORS}
            shouldBeBlocked={!isFeatureAvailable}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="WorkspaceVendorsPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <Header>
                    {shouldUseNarrowLayout && <Header.BackButton onPress={() => Navigation.goBack()} />}
                    <Header.Title
                        title={translate('workspace.common.vendors')}
                        shouldUseHeadlineHeader
                    />
                    <Header.Right>
                        <SidePanelButton />
                    </Header.Right>
                </Header>
                <WorkspaceVendorsTable
                    vendors={vendorRows}
                    headerComponent={headerContent}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceVendorsPage.displayName = 'WorkspaceVendorsPage';

export default withPolicyConnections(WorkspaceVendorsPage);
