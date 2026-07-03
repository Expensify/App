import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateRilletFieldMappingParams = {
    policyID: string;
    fieldID: string;
    mapping: ValueOf<typeof CONST.RILLET_MAPPING_VALUE>;
};

export default UpdateRilletFieldMappingParams;
