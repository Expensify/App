import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemList from '@components/MenuItemList';
import useAdminPoliciesConnectedToQBD from '@hooks/useAdminPoliciesConnectedToQBD';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {copyExistingPolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type QuickbooksDesktopExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_REUSE_EXISTING_CONNECTIONS>;

function QuickbooksDesktopExistingConnectionsPage({route}: QuickbooksDesktopExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const policiesConnectedToQBD = useAdminPoliciesConnectedToQBD();
    const policyID: string = route.params.policyID;

    const menuItems = useMemo(
        () =>
            policiesConnectedToQBD.map((policy) => {
                const lastSuccessfulSyncDate = policy.connections?.quickbooksDesktop?.lastSync?.successfulDate;
                const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
                return {
                    title: policy.name,
                    key: policy.id,
                    avatarID: policy.id,
                    icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                    iconType: CONST.ICON_TYPE_WORKSPACE,
                    description: date
                        ? translate('workspace.common.lastSyncDate', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksDesktop, date)
                        : translate('workspace.accounting.qbd'),
                    onPress: () => {
                        copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.QBD);
                        Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));
                    },
                };
            }),
        [policiesConnectedToQBD, policyID, translate, datetimeToRelative],
    );

    return (
        <ConnectionLayout
            displayName="QuickbooksDesktopExistingConnectionsPage"
            headerTitle="workspace.common.existingConnections"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            shouldLoadForEmptyConnection
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID))}
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

export default QuickbooksDesktopExistingConnectionsPage;
