import type DomainParams from './DomainParams';

type SetSamlIdentityParams = {
    /** SAML metadata of the identity provider */
    metaIdentity: string;
} & DomainParams;

export default SetSamlIdentityParams;
