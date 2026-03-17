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

function getMemberCustomRowProps(accountID: number, domainPendingActions: DomainPendingAction['member'], domainErrors: DomainErrors | undefined, email?: string) {
    const emailPendingAction = email ? domainPendingActions?.[email]?.pendingAction : undefined;
    const accountIDPendingAction = domainPendingActions?.[accountID]?.pendingAction ?? domainPendingActions?.[accountID]?.lockAccount;

    const emailErrors = email ? domainErrors?.memberErrors?.[email] : undefined;
    const accountIDErrors = domainErrors?.memberErrors?.[accountID];
    const emailError = email ? getLatestError(emailErrors?.errors) : undefined;
    const vacationDelegatesEmailError = email ? getLatestError(emailErrors?.vacationDelegateErrors) : undefined;
    const twoFactorAuthExemptEmailsError = email ? getLatestError(emailErrors?.twoFactorAuthExemptEmailsError) : undefined;
    const changeDomainSecurityGroupEmailsError = email ? emailErrors?.changeDomainSecurityGroupErrors : undefined;
    const changeDomainSecurityGroupErrors = {...accountIDErrors?.changeDomainSecurityGroupErrors, ...changeDomainSecurityGroupEmailsError};

    const mergedErrors: DomainMemberErrors = {
        errors: {
            ...getLatestError(accountIDErrors?.errors),
            ...getLatestError(accountIDErrors?.lockAccountErrors),
            ...getLatestError(changeDomainSecurityGroupErrors),
            ...emailError,
        },
        vacationDelegateErrors: {...getLatestError(accountIDErrors?.vacationDelegateErrors), ...vacationDelegatesEmailError},
        twoFactorAuthExemptEmailsError: {...getLatestError(accountIDErrors?.twoFactorAuthExemptEmailsError), ...twoFactorAuthExemptEmailsError},
    };
    const brickRoadIndicator = hasDomainMemberDetailsErrors(mergedErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    return {
        errors: getLatestError(mergedErrors?.errors),
        pendingAction: emailPendingAction ?? accountIDPendingAction,
        brickRoadIndicator,
    };
}

export {hasDomainErrors, hasDomainAdminsSettingsErrors, hasDomainAdminsErrors, hasDomainMembersErrors, hasDomainMemberDetailsErrors, hasDomainMembersSettingsErrors, getMemberCustomRowProps};
