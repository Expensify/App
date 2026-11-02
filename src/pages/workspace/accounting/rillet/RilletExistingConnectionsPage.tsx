import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReusablePoliciesConnectedTo from '@hooks/useReusablePoliciesConnectedTo';
import useThemeStyles from '@hooks/useThemeStyles';
import {copyExistingPolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RilletExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RILLET_EXISTING_CONNECTIONS>;

function RilletExistingConnectionsPage({route}: RilletExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy']);
    const policyID: string = route.params.policyID;
    const {reusablePoliciesConnectedTo: reusablePoliciesConnectedToRillet} = useReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.RILLET, policyID);

    const menuItems = reusablePoliciesConnectedToRillet.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.rillet?.lastSync?.successfulDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
            iconType: CONST.ICON_TYPE_WORKSPACE,
            shouldShowRightIcon: true,
            description: date ? translate('workspace.common.lastSyncDate', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.rillet, date) : translate('workspace.accounting.rillet'),
            onPress: () => {
                copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.RILLET);
                Navigation.dismissModal();
            },
        };
    });

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="RilletExistingConnectionsPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectTo', {connectionName: CONST.POLICY.CONNECTIONS.NAME.RILLET})}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={[styles.flex1]}>
                <Text style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', {connectionName: CONST.POLICY.CONNECTIONS.NAME.RILLET})}</Text>
                <MenuItem
                    title={translate('workspace.common.createNewConnection')}
                    icon={icons.LinkCopy}
                    iconStyles={styles.br2}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_SETUP.getRoute(policyID))}
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

export default RilletExistingConnectionsPage;
