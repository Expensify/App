import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LinkCopy} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {copyExistingPolicyConnection} from '@libs/actions/connections';
import {getAdminPoliciesConnectedToSageIntacct} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS>;

function ExistingConnectionsPage({route}: ExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policiesConnectedToSageIntacct = getAdminPoliciesConnectedToSageIntacct();
    const policyID: string = route.params.policyID;

    const menuItems = policiesConnectedToSageIntacct.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.intacct.lastSync?.successfulDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_WORKSPACE,
            shouldShowRightIcon: true,
            description: date
                ? translate('workspace.common.lastSyncDate', {
                      connectionName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.intacct,
                      formattedDate: date,
                  })
                : translate('workspace.accounting.intacct'),
            onPress: () => {
                copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);
                Navigation.dismissModal();
            },
        };
    });

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={ExistingConnectionsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectTo', {connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT})}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1]}>
                <Text style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', {connectionName: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT})}</Text>
                <MenuItem
                    title={translate('workspace.common.createNewConnection')}
                    icon={LinkCopy}
                    iconFill={theme.white}
                    iconStyles={{borderRadius: variables.componentBorderRadiusNormal, backgroundColor: theme.icon}}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID, Navigation.getActiveRoute()))}
                />
                <Text style={[styles.sectionTitle, styles.pl5, styles.pr5, styles.pb2, styles.mt3]}>{translate('workspace.common.existingConnections')}</Text>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </View>
        </ScreenWrapper>
    );
}

ExistingConnectionsPage.displayName = 'ExistingConnectionsPage';

export default ExistingConnectionsPage;
