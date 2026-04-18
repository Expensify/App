import CONST from '@src/CONST';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type {DomainMemberErrors} from '@src/types/onyx/DomainErrors';
import type DomainPendingAction from '@src/types/onyx/DomainPendingActions';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getLatestError} from './ErrorUtils';

/**
 * Checks if domain has any errors. Used to determine whether to show a red brick road indicator on domain row.
 */
function hasDomainErrors(domainErrors?: DomainErrors): boolean {
    if (!domainErrors) {
        return false;
    }

    return !isEmptyObject(domainErrors.errors) || hasDomainAdminsErrors(domainErrors) || hasDomainMembersErrors(domainErrors);
}

/**
 * Checks if domain has any admin-related errors (admin errors or settings errors like technical contact/billing card).
 */
function hasDomainAdminsErrors(domainErrors?: DomainErrors): boolean {
    return Object.values(domainErrors?.adminErrors ?? {}).some((admin) => !isEmptyObject(admin?.errors)) || hasDomainAdminsSettingsErrors(domainErrors);
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
 * @returns The latest merged error, the active pending action, and a brick road indicator if detail errors exist.
 */
function getMemberCustomRowProps(accountID: number, domainPendingActions: DomainPendingAction['member'], domainErrors: DomainErrors | undefined, email?: string) {
    const emailErrors = email ? domainErrors?.memberErrors?.[email] : undefined;
    const accountIDErrors = domainErrors?.memberErrors?.[accountID];
    const emailPendingActions = email ? domainPendingActions?.[email] : undefined;
    const accountIDPendingActions = domainPendingActions?.[accountID];

    const mergedErrors: DomainMemberErrors = {
        errors: {
            ...getLatestError(accountIDErrors?.errors),
            ...getLatestError(accountIDErrors?.lockAccountErrors),
            ...getLatestError({...accountIDErrors?.changeDomainSecurityGroupErrors, ...emailErrors?.changeDomainSecurityGroupErrors}),
            ...getLatestError(emailErrors?.errors),
        },
        // vacationDelegateErrors and twoFactorAuthExemptEmailsError appear on detail. Here used to set brickRoadIndicator to inform user about action to be taken on detail.
        vacationDelegateErrors: {...getLatestError(accountIDErrors?.vacationDelegateErrors), ...getLatestError(emailErrors?.vacationDelegateErrors)},
        twoFactorAuthExemptEmailsError: {...getLatestError(accountIDErrors?.twoFactorAuthExemptEmailsError), ...getLatestError(emailErrors?.twoFactorAuthExemptEmailsError)},
    };

    return {
        errors: getLatestError(mergedErrors.errors),
        pendingAction: emailPendingActions?.pendingAction ?? accountIDPendingActions?.pendingAction ?? accountIDPendingActions?.lockAccount ?? emailPendingActions?.changeDomainSecurityGroup,
        brickRoadIndicator: hasDomainMemberDetailsErrors(mergedErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
    };
}

export {hasDomainErrors, hasDomainAdminsSettingsErrors, hasDomainAdminsErrors, hasDomainMembersErrors, hasDomainMemberDetailsErrors, hasDomainMembersSettingsErrors, getMemberCustomRowProps};
