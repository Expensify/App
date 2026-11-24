/**
 * Row on the workspace Travel page that opens the Members page and counts how many members can book travel. It's its own
 * component so the member and personal details subscriptions behind the count only mount while the row is shown.
 */
import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useWorkspaceMembers from '@hooks/useWorkspaceMembers';

import Navigation from '@libs/Navigation/Navigation';
import {canMemberUseTravel} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TravelManageMembersRowProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
};

function TravelManageMembersRow({policy, policyID}: TravelManageMembersRowProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Users']);

    // Counts the same members the Members page lists
    const workspaceMembers = useWorkspaceMembers(policy);
    const membersWithTravelCount = workspaceMembers.filter(({email}) => canMemberUseTravel(policy, email)).length;

    return (
        <MenuItemSectionRoot
            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID))}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.MANAGE_MEMBERS_BUTTON}
        >
            <MenuItem.Row>
                <MenuItem.Icon src={icons.Users} />
                <MenuItem.Content>
                    <MenuItem.Title>{translate('workspace.moreFeatures.travel.members.manageMembers')}</MenuItem.Title>
                    <MenuItem.Description>
                        {translate('workspace.moreFeatures.travel.members.membersWithTravelAccess', {
                            enabledCount: membersWithTravelCount,
                            totalCount: workspaceMembers.length,
                        })}
                    </MenuItem.Description>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItemSectionRoot>
    );
}

export default TravelManageMembersRow;
