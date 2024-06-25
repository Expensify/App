import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import connectToSageIntacct from '@libs/actions/connections/SageIntacct';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPoliciesConnectedToSageIntacct} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExistingConnectionsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS>;

function ExistingConnectionsPage({route}: ExistingConnectionsPageProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const policiesConnectedToSageIntacct = getPoliciesConnectedToSageIntacct(policies);
    const policyID: string = route.params.policyID;

    const menuItems = policiesConnectedToSageIntacct.map((policy) => {
        const lastSuccessfulSyncDate = policy.connections?.intacct.lastSync?.successfulDate;
        const date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
            iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_WORKSPACE,
            description: date ? translate('workspace.intacct.sageIntacctLastSync', date) : translate('workspace.accounting.intacct'),
            onPress: () => {
                // waiting for backend for reusing existing connections
                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));
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
                title={translate('workspace.intacct.existingConnections')}
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

ExistingConnectionsPage.displayName = 'ExistingConnectionsPage';

export default ExistingConnectionsPage;
