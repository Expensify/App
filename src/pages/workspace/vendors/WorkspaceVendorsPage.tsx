import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import ScreenWrapper from '@components/ScreenWrapper';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getConnectedIntegration, getCurrentConnectionName, getMatchingVendors, hasVendorFeature} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type VendorTableColumnKey = 'name';

type VendorTableRowData = TableData & {
    name: string;
};

type WorkspaceVendorsPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VENDORS>;

function WorkspaceVendorsPage({policy, route}: WorkspaceVendorsPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();

    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.vendors');

    const isFeatureAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const vendors = getMatchingVendors(policy);
    const connectedIntegration = getConnectedIntegration(policy);
    const currentConnectionName = getCurrentConnectionName(policy);

    const vendorRows: VendorTableRowData[] = useMemo(
        () =>
            vendors.map((vendor) => ({
                keyForList: vendor.id,
                name: vendor.name,
            })),
        [vendors],
    );

    const columns: Array<TableColumn<VendorTableColumnKey>> = useMemo(
        () => [
            {
                key: 'name',
                label: translate('common.name'),
                sortable: true,
            },
        ],
        [translate],
    );

    const compareItems: CompareItemsCallback<VendorTableRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<VendorTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue.toLowerCase(), (option) => [option.name]);
        return results.length > 0;
    };

    const renderVendorItem = ({item, index}: ListRenderItemInfo<VendorTableRowData>) => (
        <Table.Row
            interactive={false}
            rowIndex={index}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INITIAL.VENDORS}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <TextWithTooltip
                    shouldShowTooltip
                    numberOfLines={1}
                    text={item.name}
                />
            </View>
        </Table.Row>
    );

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
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={translate('workspace.common.vendors')}
                    shouldUseHeadlineHeader
                    onBackButtonPress={() => Navigation.goBack()}
                />
                {vendorRows.length > 0 && !!currentConnectionName && (
                    <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <ImportedFromAccountingSoftware
                            policyID={policyID}
                            currentConnectionName={currentConnectionName}
                            connectedIntegration={connectedIntegration}
                            translatedText={translate('workspace.vendors.managedInAccountingSoftware')}
                        />
                    </View>
                )}
                <Table
                    data={vendorRows}
                    initialSortColumn="name"
                    title={translate('workspace.common.vendors')}
                    columns={columns}
                    compareItems={compareItems}
                    isItemInSearch={isItemInSearch}
                    renderItem={renderVendorItem}
                    keyExtractor={(item) => item.keyForList}
                >
                    <Table.FilterBar label={translate('workspace.vendors.findVendor')} />
                    <Table.EmptyState
                        title={translate('workspace.vendors.emptyTitle')}
                        subtitleText={translate('workspace.vendors.emptySubtitle')}
                    />
                    <Table.NoResultsState />
                    <Table.Header />
                    <Table.Body />
                </Table>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceVendorsPage.displayName = 'WorkspaceVendorsPage';

export default withPolicyConnections(WorkspaceVendorsPage);
