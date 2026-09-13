import useOnyx from '@hooks/useOnyx';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {updateDomainSecurityGroup} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';

import BaseDomainGroupPreferredWorkspacePage from './BaseDomainGroupPreferredWorkspacePage';

type DomainGroupPreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.SECURITY_GROUPS_PREFERRED_WORKSPACE>;

function DomainGroupPreferredWorkspacePage({route}: DomainGroupPreferredWorkspacePageProps) {
    const {domainAccountID, groupID} = route.params;

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [deleteGroupPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('deleteGroup', groupID),
    });

    return (
        <BaseDomainGroupPreferredWorkspacePage
            domainAccountID={domainAccountID}
            testID="DomainGroupPreferredWorkspacePage"
            selectedPolicyID={group?.restrictedPrimaryPolicyID}
            shouldBeBlocked={!group || !!deleteGroupPendingAction}
            fullPageNotFoundViewProps={{
                onBackButtonPress: () => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID)),
            }}
            onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID))}
            onSelectWorkspace={(policyID: string) => {
                if (!group) {
                    return;
                }
                updateDomainSecurityGroup(domainAccountID, groupID, group, {restrictedPrimaryPolicyID: policyID}, 'restrictedPrimaryPolicyID');
                Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID));
            }}
        />
    );
}

export default DomainGroupPreferredWorkspacePage;
