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
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CertiniaExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_EXISTING_CONNECTIONS>;

function CertiniaExistingConnectionsPage({route}: CertiniaExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy']);
    const policyID: string = route.params.policyID;
    const {reusablePoliciesConnectedTo: reusablePoliciesConnectedToCertinia} = useReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policyID);

    const menuItems = reusablePoliciesConnectedToCertinia.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.financialforce?.lastSync?.successfulDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
            iconType: CONST.ICON_TYPE_WORKSPACE,
            shouldShowRightIcon: true,
            description: date ? translate('workspace.common.lastSyncDate', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialforce, date) : translate('workspace.certinia.title'),
            onPress: () => {
                copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.CERTINIA);
                Navigation.dismissModal();
            },
        };
    });

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="CertiniaExistingConnectionsPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectTo', {connectionName: CONST.POLICY.CONNECTIONS.NAME.CERTINIA})}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={[styles.flex1]}>
                <Text style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', {connectionName: CONST.POLICY.CONNECTIONS.NAME.CERTINIA})}</Text>
                <MenuItem
                    title={translate('workspace.common.createNewConnection')}
                    icon={icons.LinkCopy}
                    iconStyles={{borderRadius: variables.componentBorderRadiusNormal}}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID))}
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

export default CertiniaExistingConnectionsPage;
