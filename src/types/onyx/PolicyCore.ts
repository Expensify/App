import type {SAGE_INTACCT_CONFIG} from '@src/CONST/language/integrations/SageIntacct';
import type {POLICY} from '@src/CONST/language/Policy';

import type {ValueOf} from 'type-fest';

/** Names of integration connections */
type ConnectionName = ValueOf<(typeof POLICY)['CONNECTIONS']['NAME']>;

/** Names of all integration connections */
type AllConnectionName = ConnectionName;

/** Mapping names for Sage Intacct */
type SageIntacctMappingName = ValueOf<(typeof SAGE_INTACCT_CONFIG)['MAPPINGS']>;

/** Stages of policy connection sync */
type PolicyConnectionSyncStage = ValueOf<(typeof POLICY)['CONNECTIONS']['SYNC_STAGE_NAME']>;

export type {AllConnectionName, ConnectionName, PolicyConnectionSyncStage, SageIntacctMappingName};
