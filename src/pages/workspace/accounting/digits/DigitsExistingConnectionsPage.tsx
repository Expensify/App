import Header from '@components/Header';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
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

import openDigitsSignIn from './openDigitsSignIn';

type DigitsExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DIGITS_EXISTING_CONNECTIONS>;

function DigitsExistingConnectionsPage({route}: DigitsExistingConnectionsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy']);
    const policyID: string = route.params.policyID;
    const {reusablePoliciesConnectedTo: reusablePoliciesConnectedToDigits} = useReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.DIGITS, policyID);

    const menuItems = reusablePoliciesConnectedToDigits.map((policy) => ({
        title: policy.name,
        key: policy.id,
        avatarID: policy.id,
        icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
        iconType: CONST.ICON_TYPE_WORKSPACE,
        shouldShowRightIcon: true,
        // Each Digits sign-in covers one company, so the company tells the admin which connection they're copying
        description: policy.connections?.digits?.data?.company?.name ?? translate('workspace.accounting.digits'),
        onPress: () => {
            copyExistingPolicyConnection(policy.id, policyID, CONST.POLICY.CONNECTIONS.NAME.DIGITS);
            Navigation.dismissModal();
        },
    }));

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="DigitsExistingConnectionsPage"
        >
            <Header>
                <Header.BackButton onPress={() => Navigation.goBack()} />
                <Header.Title title={translate('workspace.common.connectTo', CONST.POLICY.CONNECTIONS.NAME.DIGITS)} />
            </Header>
            <ScrollView style={[styles.flex1]}>
                <Text style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', CONST.POLICY.CONNECTIONS.NAME.DIGITS)}</Text>
                <MenuItemNavigation
                    title={translate('workspace.common.createNewConnection')}
                    icon={icons.LinkCopy}
                    onPress={() => openDigitsSignIn(policyID, environmentURL)}
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

export default DigitsExistingConnectionsPage;
