import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateDualEntryFieldMappingParams = {
    policyID: string;
    fieldID: string;
    mapping: ValueOf<typeof CONST.DUAL_ENTRY_MAPPING_VALUE>;
};

export default UpdateDualEntryFieldMappingParams;
