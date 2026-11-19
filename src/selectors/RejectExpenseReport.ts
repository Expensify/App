import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {isPolicyMember} from '@libs/PolicyUtils';
import {getSortedReportActions} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {personalDetailsLoginSelector} from './PersonalDetails';

function currentCycleForwardedActorAccountIDsSelector(reportActions: OnyxEntry<ReportActions>): number[] | undefined {
    if (!reportActions) {
        return undefined;
    }

    const sortedActions = getSortedReportActions(Object.values(reportActions), true);

    // Walk reverse chronologically. A SUBMITTED action marks the start of the current
    // approval cycle — any FORWARDED actions older than that are stale (from a prior
    // submit, approve, reject, then resubmit cycle) and must be ignored. Collect every forward
    // in the cycle, newest first, so ineligible approvers can be skipped.
    const forwardedActorAccountIDs: number[] = [];
    for (const action of sortedActions) {
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED) {
            break;
        }
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.FORWARDED && action.actorAccountID && !forwardedActorAccountIDs.includes(action.actorAccountID)) {
            forwardedActorAccountIDs.push(action.actorAccountID);
        }
    }

    return forwardedActorAccountIDs;
}

function submitterAndLastForwardedActorEmailSelector(
    submitterAccountID: number | undefined,
    forwardedActorAccountIDs: number[] | undefined,
    currentUserAccountID: number | undefined,
    policy: OnyxEntry<Policy>,
) {
    return (personalDetailsList: OnyxEntry<PersonalDetailsList>) => ({
        submitterEmail: personalDetailsLoginSelector(submitterAccountID)(personalDetailsList),
        // Skip the current user, the submitter, approvers no longer in the workspace, and approvers
        // whose removal is optimistically pending (offline or in-flight), so a queued reject can't still target them.
        // isPolicyMember fails closed when employeeList isn't loaded, matching Auth's server-side strictness.
        // The pending-delete check is inlined (rather than calling isPolicyMemberWithoutPendingDelete) so the
        // owner-not-in-employeeList case still counts as a member — that helper only inspects employeeList.
        lastForwardedActorEmail: forwardedActorAccountIDs
            ?.filter((accountID) => accountID !== currentUserAccountID && accountID !== submitterAccountID)
            .map((accountID) => getLoginByAccountID(accountID, personalDetailsList))
            .find((login) => {
                if (!isPolicyMember(policy, login)) {
                    return false;
                }
                const employee = login ? policy?.employeeList?.[login] : undefined;
                return !employee || employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            }),
    });
}

export {currentCycleForwardedActorAccountIDsSelector, submitterAndLastForwardedActorEmailSelector};
