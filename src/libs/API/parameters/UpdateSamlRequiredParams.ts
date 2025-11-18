import type DomainParams from './DomainParams';

type UpdateSamlRequiredParams = {
    /** Whether logging in via SAML should be required for a domain. */
    required: boolean;
} & DomainParams;

export default UpdateSamlRequiredParams;
