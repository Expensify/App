import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {updateDomainSecurityGroup} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React, {useState} from 'react';

import BaseDomainGroupPreferredWorkspacePage from './BaseDomainGroupPreferredWorkspacePage';

type DomainGroupPreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.SECURITY_GROUPS_PREFERRED_WORKSPACE>;

function DomainGroupPreferredWorkspacePage({route}: DomainGroupPreferredWorkspacePageProps) {
    const {domainAccountID, groupID} = route.params;

    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [deleteGroupPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('deleteGroup', groupID),
    });

    const currentPolicyID = group?.restrictedPrimaryPolicyID;

    const [draftPolicyID, setDraftPolicyID] = useState<string>();
    const currentSelection = draftPolicyID ?? currentPolicyID;

    const saveWorkspace = () => {
        if (!group || !currentSelection) {
            return;
        }
        updateDomainSecurityGroup(domainAccountID, groupID, group, {restrictedPrimaryPolicyID: currentSelection}, 'restrictedPrimaryPolicyID');
        Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID));
    };

    return (
        <BaseDomainGroupPreferredWorkspacePage
            domainAccountID={domainAccountID}
            testID="DomainGroupPreferredWorkspacePage"
            selectedPolicyID={currentPolicyID}
            draftPolicyID={draftPolicyID}
            shouldBeBlocked={!group || !!deleteGroupPendingAction}
            fullPageNotFoundViewProps={{
                onBackButtonPress: () => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID)),
            }}
            onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID))}
            onSelectWorkspace={setDraftPolicyID}
            confirmButtonOptions={{
                showButton: true,
                text: translate('common.save'),
                onConfirm: saveWorkspace,
                isDisabled: currentSelection === currentPolicyID,
            }}
        />
    );
}

export default DomainGroupPreferredWorkspacePage;
