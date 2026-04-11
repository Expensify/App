import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReusablePoliciesConnectedToQBD from '@hooks/useReusablePoliciesConnectedToQBD';
import useThemeStyles from '@hooks/useThemeStyles';
import {copyExistingPolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getIntegrationLastSuccessfulDate} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import getQuickbooksDesktopSetupEntryRoute from './utils';

type QuickbooksDesktopExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_REUSE_EXISTING_CONNECTIONS>;

function QuickbooksDesktopExistingConnectionsPage({route}: QuickbooksDesktopExistingConnectionsPageProps) {
    const {translate, datetimeToRelative, getLocalDateFromDatetime} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy']);
    const policyID: string = route.params.policyID;
    const {connectionSyncProgressCollection, reusablePoliciesConnectedToQBD} = useReusablePoliciesConnectedToQBD(policyID);

    const menuItems = useMemo(
        () =>
            reusablePoliciesConnectedToQBD.map((policy) => {
                const syncProgress = connectionSyncProgressCollection?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`];
                const lastSuccessfulSyncDate = getIntegrationLastSuccessfulDate(getLocalDateFromDatetime, policy.connections?.quickbooksDesktop, syncProgress);
                const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
                return {
                    title: policy.name,
                    key: policy.id,
                    avatarID: policy.id,
                    icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                    iconType: CONST.ICON_TYPE_WORKSPACE,
                    shouldShowRightIcon: true,
                    description: date
                        ? translate('workspace.common.lastSyncDate', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksDesktop, date)
                        : translate('workspace.accounting.qbd'),
                    onPress: () => {
                        copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.QBD);
                        Navigation.dismissModal();
                    },
                };
            }),
        [reusablePoliciesConnectedToQBD, connectionSyncProgressCollection, policyID, translate, datetimeToRelative, getLocalDateFromDatetime],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="QuickbooksDesktopExistingConnectionsPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectTo', {connectionName: CONST.POLICY.CONNECTIONS.NAME.QBD})}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={[styles.flex1]}>
                <Text style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', {connectionName: CONST.POLICY.CONNECTIONS.NAME.QBD})}</Text>
                <MenuItem
                    title={translate('workspace.common.createNewConnection')}
                    icon={icons.LinkCopy}
                    iconStyles={{borderRadius: variables.componentBorderRadiusNormal}}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(getQuickbooksDesktopSetupEntryRoute(policyID))}
                />
                <Text style={[styles.sectionTitle, styles.pl5, styles.pr5, styles.pb2, styles.mt3]}>{translate('workspace.common.existingConnections')}</Text>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default QuickbooksDesktopExistingConnectionsPage;
