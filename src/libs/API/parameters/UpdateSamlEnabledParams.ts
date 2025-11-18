import type DomainParams from './DomainParams';

type UpdateSamlEnabledParams = {
    /** Whether logging in via SAML should be enabled for a domain. */
    enabled: boolean;
} & DomainParams;

export default UpdateSamlEnabledParams;
