import useOnyx from '@hooks/useOnyx';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {setDomainGroupCreatePreferredPolicyID} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import BaseDomainGroupPreferredWorkspacePage from './BaseDomainGroupPreferredWorkspacePage';

type DomainGroupCreatePreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_CREATE_PREFERRED_WORKSPACE>;

function DomainGroupCreatePreferredWorkspacePage({route}: DomainGroupCreatePreferredWorkspacePageProps) {
    const {domainAccountID} = route.params;

    const [currentPolicyID] = useOnyx(ONYXKEYS.DOMAIN_GROUP_CREATE_PREFERRED_POLICY_ID);

    return (
        <BaseDomainGroupPreferredWorkspacePage
            domainAccountID={domainAccountID}
            testID="DomainGroupCreatePreferredWorkspacePage"
            selectedPolicyID={currentPolicyID}
            onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID))}
            onSelectWorkspace={(policyID: string) => {
                setDomainGroupCreatePreferredPolicyID(policyID);
                Navigation.goBack(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID));
            }}
        />
    );
}

export default DomainGroupCreatePreferredWorkspacePage;
