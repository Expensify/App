import type {SamlMetadata} from '@src/types/onyx';
import type DomainParams from './DomainParams';

type SetSamlMetadataParams = Partial<SamlMetadata> & DomainParams;

export default SetSamlMetadataParams;
