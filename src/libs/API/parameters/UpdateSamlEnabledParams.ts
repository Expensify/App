import type DomainParams from './DomainParams';

type UpdateSamlEnabledParams = {
    enabled: boolean;
} & DomainParams;

export default UpdateSamlEnabledParams;
