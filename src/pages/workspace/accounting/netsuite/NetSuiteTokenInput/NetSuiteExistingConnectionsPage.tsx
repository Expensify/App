import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ConnectionUtils from '@libs/actions/connections';
import {getPoliciesConnectedToNetSuite} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExistingConnectionsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS>;

function NetSuiteExistingConnectionsPage({route}: ExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const policiesConnectedToSageNetSuite = getPoliciesConnectedToNetSuite();
    const policyID: string = route.params.policyID;

    const reuseExistingConnection = useCallback(
        (connectedPolicyID: string) => {
            ConnectionUtils.reuseExistingConnection(connectedPolicyID, policyID, CONST.POLICY.CONNECTIONS.NAME.NETSUITE);
        },
        [policyID],
    );

    const menuItems = policiesConnectedToSageNetSuite.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.netsuite.lastSyncDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_WORKSPACE,
            description: date ? translate('workspace.common.lastSyncDate', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite, date) : translate('workspace.accounting.netsuite'),
            onPress: () => {
                reuseExistingConnection(policy.id);
                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));
            },
        };
    });

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={NetSuiteExistingConnectionsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.existingConnections')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID))}
            />
            <View style={[styles.flex1]}>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </View>
        </ScreenWrapper>
    );
}

NetSuiteExistingConnectionsPage.displayName = 'NetSuiteExistingConnectionsPage';

export default NetSuiteExistingConnectionsPage;
