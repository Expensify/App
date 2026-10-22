import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import UserPills from '@components/UserPills';

import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';

import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

import {useMergeATSApprovalDraftState} from './MergeATSApprovalDraftContext';

type MergeATSFinalApproverMenuItemProps = {
    /** The workspace whose Merge ATS connection the final approver belongs to. */
    policyID: string;

    /** Label shown above the approver. Each approval mode names this approver differently. */
    description: string;
};

function MergeATSFinalApproverMenuItem({policyID, description}: MergeATSFinalApproverMenuItemProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {finalApprover} = useMergeATSApprovalDraftState(policyID);
    const finalApproverDetails = usePersonalDetailByLogin(finalApprover);

    return (
        <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.WORKSPACE_RECRUITING_MERGE_FINAL_APPROVER.getRoute(policyID)), false, session)}>
            <MenuItem.Row>
                <MenuItemField.Content name={description}>
                    {!!finalApprover && (
                        <UserPills
                            users={[
                                {
                                    avatar: finalApproverDetails?.avatar,
                                    displayName: finalApproverDetails?.displayName ?? finalApprover,
                                    accountID: finalApproverDetails?.accountID,
                                    email: finalApprover,
                                },
                            ]}
                        />
                    )}
                </MenuItemField.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

export default MergeATSFinalApproverMenuItem;
