import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemList from '@components/MenuItemList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {copyExistingPolicyConnection} from '@libs/actions/connections';
import {getAdminPoliciesConnectedToNetSuite} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REUSE_EXISTING_CONNECTIONS>;

function NetSuiteExistingConnectionsPage({route}: ExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const policiesConnectedToSageNetSuite = getAdminPoliciesConnectedToNetSuite();
    const policyID: string = route.params.policyID;

    const menuItems = policiesConnectedToSageNetSuite.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.netsuite.lastSyncDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_WORKSPACE,
            description: date
                ? translate('workspace.common.lastSyncDate', {
                      connectionName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite,
                      formattedDate: date,
                  })
                : translate('workspace.accounting.netsuite'),
            onPress: () => {
                copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.NETSUITE);
                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));
            },
        };
    });

    return (
        <ConnectionLayout
            displayName={NetSuiteExistingConnectionsPage.displayName}
            headerTitle="workspace.common.existingConnections"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            shouldLoadForEmptyConnection
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID))}
            shouldIncludeSafeAreaPaddingBottom
        >
            <View style={[styles.flex1]}>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteExistingConnectionsPage.displayName = 'NetSuiteExistingConnectionsPage';

export default NetSuiteExistingConnectionsPage;
