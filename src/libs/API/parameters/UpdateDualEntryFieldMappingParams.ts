import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateDualEntryFieldMappingParams = {
    /** The workspace where the field mapping is updated. */
    policyID: string;

    /** The DualEntry field to map. */
    fieldID: string;

    /** The Expensify dimension mapped to the DualEntry field. */
    mapping: ValueOf<typeof CONST.DUALENTRY_MAPPING_VALUE>;
};

export default UpdateDualEntryFieldMappingParams;
