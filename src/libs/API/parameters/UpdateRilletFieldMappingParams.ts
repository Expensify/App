import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateRilletFieldMappingParams = {
    policyID: string;
    fieldID: string;
    mapping: ValueOf<typeof CONST.RILLET_MAPPING_VALUE>;
};

export default UpdateRilletFieldMappingParams;
