import type CONST from '@src/CONST';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';
import type * as OnyxCommon from './OnyxCommon';

/**
 * Basic errors for domain members and admins
 */
type GeneralDomainMemberErrors = {
    /**
     * Base errors
     */
    errors: OnyxCommon.Errors;
};

/**
 * Errors for domain members
 */
type DomainMemberErrors = {
    /**
     * Errors related to a specific domain vacation delegate
     */
    vacationDelegateErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the list of emails exempt from the 2FA requirement
     */
    twoFactorAuthExemptEmailsError?: OnyxCommon.Errors;

    /**
     * Errors related to specific domain member lock account status.
     */
    lockAccountErrors?: OnyxCommon.Errors;
    /**
     * Errors related to changing domain member group.
     */
    changeDomainSecurityGroupErrors?: OnyxCommon.Errors;
} & GeneralDomainMemberErrors;

/**
 * Errors related to a domain security group
 */
type DomainSecurityGroupErrors = {
    /**
     * Errors related to the security group name
     */
    nameErrors?: OnyxCommon.Errors;
};

/**
 * Collection of errors related to domain operations received from the backend
 */
type DomainErrors = {
    /**
     * Errors related to specific domain administrators, keyed by their adminID
     */
    adminErrors?: Record<number, GeneralDomainMemberErrors>;

    /**
     * Errors related to the technical contact email
     */
    technicalContactEmailErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the "use technical contact billing card" setting
     */
    useTechnicalContactBillingCardErrors?: OnyxCommon.Errors;

    /**
     * Errors related to specific domain member, keyed by their user email, (NOT accountID)
     */
    memberErrors?: Record<string | number, DomainMemberErrors>;

    /**
     * Errors for the domain itself
     */
    errors: OnyxCommon.Errors;

    /**
     * Errors related to the 2FA toggle
     */
    setTwoFactorAuthRequiredError?: OnyxCommon.Errors;
} & PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroupErrors>;

export type {GeneralDomainMemberErrors, DomainMemberErrors, DomainSecurityGroupErrors};
export default DomainErrors;
