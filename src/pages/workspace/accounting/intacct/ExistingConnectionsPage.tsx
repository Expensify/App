import type {StackScreenProps} from '@react-navigation/stack';
import {formatDistanceToNow} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPoliciesConnectedToSageIntacct} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ExistingConnectionsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS>;

function ExistingConnectionsPage({route}: ExistingConnectionsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const policiesConnectedToSageIntacct = getPoliciesConnectedToSageIntacct(policies);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const policyID = route.params.policyID; // we'll need this when connecting to policy

    const menuItemsBetter = policiesConnectedToSageIntacct.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.intacct.lastSync?.successfulDate;
        const formattedDate = lastSuccessfulSyncDate ? new Date(lastSuccessfulSyncDate) : undefined;
        const date = formattedDate ? formatDistanceToNow(formattedDate, {addSuffix: true}) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_WORKSPACE,
            description: date ? `Sage Intacct - Last synced ${date}` : 'Sage Intacct',
        };
    });

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={ExistingConnectionsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.existingConnections')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1]}>
                <MenuItemList
                    menuItems={menuItemsBetter}
                    shouldUseSingleExecution
                />
            </View>
        </ScreenWrapper>
    );
}

ExistingConnectionsPage.displayName = 'IntacctPrerequisitesPage';

export default ExistingConnectionsPage;
