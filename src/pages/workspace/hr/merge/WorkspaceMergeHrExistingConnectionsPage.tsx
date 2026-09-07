/** Lets workspace admins reuse a matching HR provider or start a new connection. */
import ConnectToHRFlow from '@components/ConnectToHRFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {copyExistingPolicyConnection} from '@libs/actions/connections';
import {getMergeSetupLink} from '@libs/actions/connections/merge';
import {getConnectedHRProvider, isAnyHRConnected} from '@libs/merge/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import reusableMergeHRPoliciesSelector from '@src/selectors/HR';

import React, {useState} from 'react';

type WorkspaceMergeHrExistingConnectionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS>;

function WorkspaceMergeHrExistingConnectionsPage({route}: WorkspaceMergeHrExistingConnectionsPageProps) {
    const {policyID, providerSlug} = route.params;
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Building']);
    const policy = usePolicy(policyID);
    const [reusablePolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => reusableMergeHRPoliciesSelector(policies, policyID, providerSlug),
    });
    const {isOffline} = useNetwork();
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const [connectionAttempt, setConnectionAttempt] = useState(0);
    const isValidProvider = !!providerSlug && Object.hasOwn(MERGE_HR_PROVIDERS, providerSlug);
    const isHRConnected = isAnyHRConnected(policy);
    // Keep the active flow mounted if its connection arrives in Onyx before the completion redirect.
    const shouldBeBlocked = !isValidProvider || (isHRConnected && connectionAttempt === 0);

    const handleConnect = (sourcePolicyID?: string) => {
        if (!policy || isOffline || !isValidProvider || isHRConnected) {
            return;
        }
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }
        if (sourcePolicyID) {
            copyExistingPolicyConnection(sourcePolicyID, policyID, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);
            Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID));
            return;
        }
        setConnectionAttempt((previousAttempt) => previousAttempt + 1);
    };

    const menuItems: MenuItemWithLink[] = (reusablePolicies ?? []).map((sourcePolicy) => {
        const provider = getConnectedHRProvider(sourcePolicy);
        const successfulDate = sourcePolicy.connections?.merge_hris?.lastSync?.successfulDate;
        const providerName = provider?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_hris;
        return {
            key: sourcePolicy.id,
            title: sourcePolicy.name,
            icon: provider?.iconUrl ?? icons.Building,
            iconType: CONST.ICON_TYPE_AVATAR,
            description: successfulDate ? translate('workspace.common.lastSyncDate', providerName, datetimeToRelative(successfulDate)) : providerName,
            disabled: isOffline,
            onPress: () => handleConnect(sourcePolicy.id),
        };
    });
    menuItems.push({
        title: translate('workspace.common.createNewConnection'),
        icon: icons.Plus,
        disabled: isOffline,
        onPress: () => handleConnect(),
    });

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={shouldBeBlocked}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceMergeHrExistingConnectionsPage"
            >
                {connectionAttempt > 0 && isValidProvider && (
                    <ConnectToHRFlow
                        key={connectionAttempt}
                        setupLink={getMergeSetupLink(policyID, providerSlug)}
                        onDone={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                    />
                )}
                <HeaderWithBackButton
                    title={translate('workspace.common.existingConnections')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
                <ScrollView
                    contentContainerStyle={styles.pt3}
                    addBottomSafeAreaPadding
                >
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceMergeHrExistingConnectionsPage;
