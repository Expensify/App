import {useEffect, useRef} from 'react';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type TransferOwnershipActionProps = {
    /** ID of the workspace whose ownership is being transferred */
    policyID: string;

    /** Called once the ownership change flow has started, so the parent can unmount this component */
    onDismiss: () => void;
};

/**
 * Kicks off the "transfer owner" flow, mounted only after the user picks Transfer owner in the row menu.
 * The full policy entry needed by requestWorkspaceOwnerChange is subscribed to only for the moment
 * the flow starts, so the workspaces list rows don't re-render on every policy change.
 */
function TransferOwnershipAction({policyID, onDismiss}: TransferOwnershipActionProps) {
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION);
    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const isLoadingData = isLoadingOnyxValue(sessionResult, policyResult);

    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        clearWorkspaceOwnerChangeFlow(policyID);
        requestWorkspaceOwnerChange(policy, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
        Navigation.navigate(
            ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                policyID,
                session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                Navigation.getActiveRoute(),
            ),
        );
        onDismiss();
    });

    return null;
}

export default TransferOwnershipAction;
