import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateDualEntryFieldMappingParams = {
    policyID: string;
    fieldID: string;
    mapping: ValueOf<typeof CONST.DUALENTRY_MAPPING_VALUE>;
};

export default UpdateDualEntryFieldMappingParams;
