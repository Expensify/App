import MenuItem from '@components/MenuItem';
import UserPills from '@components/UserPills';

import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';

import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import ROUTES from '@src/ROUTES';

import React from 'react';

import {useMergeATSApprovalDraftState} from './MergeATSApprovalDraftContext';

type MergeATSFinalApproverMenuItemProps = {
    /** The workspace whose Merge ATS connection the final approver belongs to. */
    policyID: string;

    /** Label shown above the approver. Each approval mode names this approver differently. */
    description: string;
};

function MergeATSFinalApproverMenuItem({policyID, description}: MergeATSFinalApproverMenuItemProps) {
    const {finalApprover} = useMergeATSApprovalDraftState(policyID);
    const finalApproverDetails = usePersonalDetailByLogin(finalApprover);
    const finalApproverDisplayName = finalApproverDetails?.displayName ?? finalApprover ?? '';

    return (
        <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.WORKSPACE_RECRUITING_MERGE_FINAL_APPROVER.getRoute(policyID)))}>
            <MenuItem.Row>
                <MenuItem.Content>
                    {finalApprover ? (
                        <>
                            <MenuItem.FieldName>{description}</MenuItem.FieldName>
                            <UserPills
                                users={[
                                    {
                                        avatar: finalApproverDetails?.avatar,
                                        displayName: finalApproverDisplayName,
                                        accountID: finalApproverDetails?.accountID,
                                        email: finalApprover,
                                    },
                                ]}
                            />
                        </>
                    ) : (
                        <MenuItem.FieldNamePlaceholder>{description}</MenuItem.FieldNamePlaceholder>
                    )}
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

export default MergeATSFinalApproverMenuItem;
