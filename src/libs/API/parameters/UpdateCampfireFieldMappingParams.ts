import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateCampfireFieldMappingParams = {
    /** The workspace where the field mapping is updated. */
    policyID: string;

    /** The Campfire field to map. */
    fieldID: string;

    /** The Expensify dimension mapped to the Campfire field. */
    mapping: ValueOf<typeof CONST.CAMPFIRE_MAPPING_VALUE>;
};

export default UpdateCampfireFieldMappingParams;
