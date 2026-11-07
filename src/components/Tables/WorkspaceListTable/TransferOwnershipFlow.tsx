import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {clearWorkspaceOwnerChangeFlow} from '@libs/actions/Policy/Member';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import {useEffect, useRef} from 'react';

type TransferOwnershipFlowProps = {
    /** ID of the workspace whose ownership is being transferred */
    policyID: string;

    /** Called once the ownership change flow has started, so the parent can unmount this component */
    onDismiss: () => void;
};

/**
 * Kicks off the "transfer owner" flow, mounted only after the user picks Transfer owner in the row menu.
 * The owner change page starts the transfer itself, since it may first ask to take over all of the owner's workspaces.
 */
function TransferOwnershipFlow({policyID, onDismiss}: TransferOwnershipFlowProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current) {
            return;
        }
        hasStartedRef.current = true;

        clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.navigate(
            createDynamicRoute(
                DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, currentUserPersonalDetails.accountID, 'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>),
                ROUTES.WORKSPACES_LIST.route,
            ),
        );
        onDismiss();
    });

    return null;
}

export default TransferOwnershipFlow;
