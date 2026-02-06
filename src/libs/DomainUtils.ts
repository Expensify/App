import type DomainErrors from '@src/types/onyx/DomainErrors';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
    return Object.values(domainErrors?.memberErrors ?? {}).some((member) => !isEmptyObject(member?.errors));
}

export {hasDomainErrors, hasDomainAdminsSettingsErrors, hasDomainAdminsErrors, hasDomainMembersErrors};
