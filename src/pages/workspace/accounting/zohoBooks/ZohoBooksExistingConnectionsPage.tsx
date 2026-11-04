import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
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
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useStartZohoBooksOAuth from './useStartZohoBooksOAuth';

type ZohoBooksExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_EXISTING_CONNECTIONS>;

function ZohoBooksExistingConnectionsPage({route}: ZohoBooksExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy']);
    const policyID: string = route.params.policyID;
    const {reusablePoliciesConnectedTo: reusablePoliciesConnectedToZohoBooks} = useReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS, policyID);
    const startZohoBooksOAuth = useStartZohoBooksOAuth();

    const menuItems = reusablePoliciesConnectedToZohoBooks.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.zohoBooks?.lastSync?.successfulDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
            iconType: CONST.ICON_TYPE_WORKSPACE,
            shouldShowRightIcon: true,
            description: date ? translate('workspace.common.lastSyncDate', CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.zohoBooks, date) : translate('workspace.accounting.zohoBooks'),
            onPress: () => {
                copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS);
                Navigation.dismissModal();
            },
        };
    });

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="ZohoBooksExistingConnectionsPage"
        >
            <HeaderWithBackButtonAndTitle
                title={translate('workspace.common.connectTo', CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS)}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={[styles.flex1]}>
                <Text style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS)}</Text>
                <MenuItemNavigation
                    title={translate('workspace.common.createNewConnection')}
                    icon={icons.LinkCopy}
                    onPress={() => startZohoBooksOAuth(policyID)}
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

export default ZohoBooksExistingConnectionsPage;
