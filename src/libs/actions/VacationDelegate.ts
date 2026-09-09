import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import * as API from '@libs/API';
import type {SetVacationDelegateParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import {getKnownAccountIDByLogin, getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {getAllReportActions} from '@libs/ReportActionsUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, ReportActions, VacationDelegate} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {CurrentUser} from './Policy/Policy';

import {addMembersToWorkspace} from './Policy/Member';

type SetVacationDelegateOptions = {
    creator: string;
    delegate: string;
    currentDelegate?: string;
    shouldOverridePolicyDiffWarning?: boolean;
};

async function setVacationDelegate({creator, delegate, currentDelegate, shouldOverridePolicyDiffWarning = false}: SetVacationDelegateOptions) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator,
                delegate,
                errors: null,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                previousDelegate: currentDelegate,
                policyDiff: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: null,
                pendingAction: null,
                previousDelegate: null,
                policyDiff: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
                pendingAction: null,
            },
        },
    ];

    const parameters: SetVacationDelegateParams = {
        creator,
        vacationDelegateEmail: delegate,
        overridePolicyDiffWarning: shouldOverridePolicyDiffWarning,
    };

    // Once the policy diff warning has been overridden there is nothing left to read from the response, so use a persisted write.
    // That keeps this request in the sequential queue behind any workspace invitations sent alongside it, so going offline
    // can no longer drop the delegate while the invites are replayed on reconnect.
    if (shouldOverridePolicyDiffWarning) {
        API.write(WRITE_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData, failureData});
        return;
    }

    // A SetVacationDelegate write from the invite step, and the workspace invitations queued with it, can still be in flight.
    // Its success data clears policyDiff and previousDelegate on this same NVP, so letting it settle first keeps it from
    // overwriting the optimistic delegate and the policy diff this request is about to capture.
    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    await API.waitForWrites(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE);

    // We need to read the API response for capturing a policy diff warning. This is the other half of the branch above, not a chained call.
    // No failureData: the API layer treats the 305 policy diff warning as a failure, so attaching it would light up a red brick road on the
    // profile page for what is really just the next step of this flow. The branches below apply it by hand for the failures that are real.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method, rulesdir/no-multiple-api-calls
    const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE, parameters, {optimisticData, successData});

    if (response?.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING && response.data?.policyDiff) {
        // Keep the optimistic delegate so the flow can continue into the missing workspaces step.
        Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
            policyDiff: response.data.policyDiff,
            pendingAction: null,
        });
    } else if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
        Onyx.update(failureData);
    }

    return response;
}

function deleteVacationDelegate(vacationDelegate?: VacationDelegate) {
    if (isEmptyObject(vacationDelegate)) {
        return;
    }

    const {creator, delegate} = vacationDelegate;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator: null,
                delegate: null,
                errors: null,
                previousDelegate: vacationDelegate?.delegate,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                errors: null,
                pendingAction: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
            value: {
                creator,
                delegate,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_VACATION_DELEGATE, null, {optimisticData, successData, failureData});
}

function clearVacationDelegateError(previousDelegate?: string) {
    return Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
        errors: null,
        pendingAction: null,
        delegate: previousDelegate ?? null,
        previousDelegate: null,
        policyDiff: null,
    });
}

type InviteVacationDelegateToWorkspacesOptions = {
    /** Login of the delegate to invite */
    delegate: string;

    /** Workspaces to invite the delegate into. These have to be loaded, since an unavailable workspace cannot be invited into. */
    policies: Policy[];

    /** The current user, on whose behalf the invitations are sent */
    inviter: CurrentUser;

    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

/**
 * Adds a vacation delegate as a member of every given workspace, one invitation per workspace. Workspaces the
 * current user does not administer are untouched here and are left for the backend to email their admins about.
 */
function inviteVacationDelegateToWorkspaces({delegate, policies, inviter, translate, formatPhoneNumber}: InviteVacationDelegateToWorkspacesOptions) {
    // The delegate may have been picked from the selector without existing in personal details yet, so fall back to an optimistic accountID.
    const knownDelegateAccountID = getKnownAccountIDByLogin(delegate);
    const delegateAccountID = knownDelegateAccountID ?? generateAccountID(delegate);
    const invitedEmailsToAccountIDs = {[delegate]: delegateAccountID};
    const isNewDelegate = knownDelegateAccountID === undefined;
    const personalDetailsOnyxData = getPersonalDetailsOnyxDataForOptimisticUsers(
        isNewDelegate ? [addSMSDomainIfPhoneNumber(delegate)] : [],
        isNewDelegate ? [delegateAccountID] : [],
        formatPhoneNumber,
    );

    const policyExpenseChatReportActions: Record<string, ReportActions> = {};
    for (const policy of policies) {
        const existingChatReportID = getPolicyExpenseChat(delegateAccountID, policy.id)?.reportID;
        if (!existingChatReportID) {
            continue;
        }
        policyExpenseChatReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingChatReportID}`] = getAllReportActions(existingChatReportID);
    }

    for (const [index, policy] of policies.entries()) {
        const isLastInvite = index === policies.length - 1;
        addMembersToWorkspace(
            invitedEmailsToAccountIDs,
            // Writes resolve in queue order, so only the last invitation may clean the optimistic delegate up from under the ones still in flight.
            isLastInvite ? personalDetailsOnyxData : {optimisticData: personalDetailsOnyxData.optimisticData},
            `# ${inviter.displayName ?? ''} invited you to ${policy.name}\n\n${translate('workspace.common.welcomeNote')}`,
            policy,
            Object.values(getMemberAccountIDsForWorkspace(policy.employeeList, false, false)),
            CONST.POLICY.ROLE.USER,
            inviter,
            policyExpenseChatReportActions,
        );
    }
}

export {setVacationDelegate, deleteVacationDelegate, clearVacationDelegateError, inviteVacationDelegateToWorkspaces};
