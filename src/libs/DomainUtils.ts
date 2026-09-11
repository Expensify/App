import CONST from '@src/CONST';
import type {Domain} from '@src/types/onyx';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type {DomainMemberErrors, DomainSecurityGroupErrors} from '@src/types/onyx/DomainErrors';
import type DomainPendingAction from '@src/types/onyx/DomainPendingActions';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {adminshipRequesterPendingActionSelector, isAdminSelector, pendingAdminRequesterAccountIDsSelector} from '@selectors/Domain';

import {getLatestError} from './ErrorUtils';

/**
 * Checks if a security group has detail-level errors (shown on the group details page).
 */
function hasDomainGroupDetailsErrors(groupErrors: DomainSecurityGroupErrors | undefined): boolean {
    if (!groupErrors) {
        return false;
    }
    return Object.entries(groupErrors)
        .filter(([key]) => key !== 'errors')
        .some(([, value]) => !isEmptyObject(value));
}

/**
 * Checks if any domain security group has errors.
 */
function hasDomainGroupsErrors(domainErrors?: DomainErrors): boolean {
    if (!domainErrors) {
        return false;
    }
    return Object.entries(domainErrors)
        .filter(([key]) => key.startsWith(CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX))
        .some(([, value]) => {
            const groupErrors = value as DomainSecurityGroupErrors;
            return !isEmptyObject(groupErrors?.errors) || hasDomainGroupDetailsErrors(groupErrors);
        });
}

/**
 * Checks if domain has any errors. Used to determine whether to show a red brick road indicator on domain row.
 *
 * Pass the domain to skip adminship request errors that no longer have a row, see `hasDomainAdminsErrors`.
 */
function hasDomainErrors(domainErrors?: DomainErrors, domain?: OnyxEntry<Domain>): boolean {
    if (!domainErrors) {
        return false;
    }

    return !isEmptyObject(domainErrors.errors) || hasDomainAdminsErrors(domainErrors, domain) || hasDomainMembersErrors(domainErrors) || hasDomainGroupsErrors(domainErrors);
}

/**
 * Checks if domain has any admin-related errors (admin errors, adminship request errors, or settings errors like technical contact/billing card).
 */
function hasDomainAdminsErrors(domainErrors?: DomainErrors, domain?: OnyxEntry<Domain>): boolean {
    const pendingRequesterAccountIDs = domain ? pendingAdminRequesterAccountIDsSelector(domain) : undefined;

    return (
        Object.values(domainErrors?.adminErrors ?? {}).some((admin) => !isEmptyObject(admin?.errors)) ||
        Object.entries(domainErrors?.adminshipRequesterErrors ?? {}).some(
            ([accountID, requester]) => !isEmptyObject(requester?.errors) && (!pendingRequesterAccountIDs || pendingRequesterAccountIDs.includes(Number(accountID))),
        ) ||
        hasDomainAdminsSettingsErrors(domainErrors)
    );
}

/**
 * Requesters that have just left the pending list while still carrying an approve or decline error.
 *
 * Those errors are keyed by requester accountID with nothing to tell one request from the next, so an error left behind by a request another
 * admin already handled would land on a brand new row if that account asked for access again. Comparing the two lists, instead of looking for
 * an error next to a missing requester, is what keeps a failed approve safe: it puts the requester back next to the error it has just set.
 */
function getStaleAdminshipRequesterErrorAccountIDs(previousRequesterAccountIDs: number[], requesterAccountIDs: number[], domainErrors: OnyxEntry<DomainErrors>): number[] {
    const requesterErrors = domainErrors?.adminshipRequesterErrors;

    return previousRequesterAccountIDs.filter((accountID) => !requesterAccountIDs.includes(accountID) && !isEmptyObject(requesterErrors?.[accountID]?.errors));
}

/**
 * Checks if the given account is a domain admin with pending adminship requests to review.
 *
 * A requester that has just been denied keeps its entry until the decline lands, so the row can render offline and on
 * failure, see `declineDomainAdminshipRequest`. There is nothing left to review next to it, so its `DELETE` pending
 * action takes it out of the count.
 */
function hasPendingDomainAdminRequestsToReview(domain: OnyxEntry<Domain>, currentUserAccountID: number | undefined, domainPendingActions?: OnyxEntry<DomainPendingAction>): boolean {
    if (!isAdminSelector(currentUserAccountID)(domain)) {
        return false;
    }

    const requesterPendingActions = adminshipRequesterPendingActionSelector(domainPendingActions);

    return pendingAdminRequesterAccountIDsSelector(domain).some((accountID) => requesterPendingActions[accountID]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/**
 * Resolves the brick road indicator for a domain section, prioritizing errors over pending admin requests.
 */
function getDomainBrickRoadIndicator(hasErrors: boolean, hasPendingAdminRequestsToReview?: boolean) {
    if (hasErrors) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasPendingAdminRequestsToReview) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }
}

/**
 * Checks if domain has any admin settings errors (technical contact email or billing card errors).
 */
function hasDomainAdminsSettingsErrors(domainErrors?: DomainErrors): boolean {
    return !isEmptyObject(domainErrors?.technicalContactEmailErrors) || !isEmptyObject(domainErrors?.useTechnicalContactBillingCardErrors);
}

/**
 * Checks if domain has any member-related errors.
 */
function hasDomainMembersErrors(domainErrors?: DomainErrors): boolean {
    return (
        Object.values(domainErrors?.memberErrors ?? {}).some((member) => !isEmptyObject(member?.errors) || hasDomainMemberDetailsErrors(member)) ||
        hasDomainMembersSettingsErrors(domainErrors)
    );
}

function hasDomainMemberDetailsErrors(memberDetailsErrors: DomainMemberErrors): boolean {
    return (
        !isEmptyObject(memberDetailsErrors?.vacationDelegateErrors) ||
        !isEmptyObject(memberDetailsErrors?.twoFactorAuthExemptEmailsError) ||
        !isEmptyObject(memberDetailsErrors?.changeDomainSecurityGroupErrors)
    );
}

function hasDomainMembersSettingsErrors(domainErrors?: DomainErrors): boolean {
    return !isEmptyObject(domainErrors?.setTwoFactorAuthRequiredError);
}

/**
 * Computes display props for a domain member row by merging errors and pending actions
 * keyed by both accountID and email, since the backend may store them under either key.
 * @param accountID - The numeric account ID of the member.
 * @param domainPendingActions - Pending actions map for all domain members.
 * @param domainErrors - All domain-level errors from Onyx.
 * @param email - Optional email of the member; used to look up email-keyed errors and pending actions.
 * @returns The latest merged error and the active pending action.
 */
function getMemberCustomRowProps(accountID: number, domainPendingActions: DomainPendingAction['member'], domainErrors: DomainErrors | undefined, email?: string) {
    const emailErrors = email ? domainErrors?.memberErrors?.[email] : undefined;
    const accountIDErrors = domainErrors?.memberErrors?.[accountID];
    const emailPendingActions = email ? domainPendingActions?.[email] : undefined;
    const accountIDPendingActions = domainPendingActions?.[accountID];

    const mergedErrors = {
        ...getLatestError(accountIDErrors?.errors),
        ...getLatestError(accountIDErrors?.lockAccountErrors),
        ...getLatestError({...accountIDErrors?.changeDomainSecurityGroupErrors, ...emailErrors?.changeDomainSecurityGroupErrors}),
        ...getLatestError(emailErrors?.errors),
        ...getLatestError(accountIDErrors?.vacationDelegateErrors),
        ...getLatestError(emailErrors?.vacationDelegateErrors),
        ...getLatestError(accountIDErrors?.twoFactorAuthExemptEmailsError),
        ...getLatestError(emailErrors?.twoFactorAuthExemptEmailsError),
    };

    return {
        errors: getLatestError(mergedErrors),
        pendingAction: emailPendingActions?.pendingAction ?? accountIDPendingActions?.pendingAction ?? accountIDPendingActions?.lockAccount ?? emailPendingActions?.changeDomainSecurityGroup,
    };
}

export {
    hasDomainErrors,
    hasDomainAdminsSettingsErrors,
    hasDomainAdminsErrors,
    hasPendingDomainAdminRequestsToReview,
    getStaleAdminshipRequesterErrorAccountIDs,
    hasDomainMembersErrors,
    hasDomainMembersSettingsErrors,
    hasDomainGroupsErrors,
    hasDomainGroupDetailsErrors,
    getMemberCustomRowProps,
    getDomainBrickRoadIndicator,
};
