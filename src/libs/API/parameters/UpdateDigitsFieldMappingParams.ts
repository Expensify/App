import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateDigitsFieldMappingParams = {
    /** The workspace where the field mapping is updated. */
    policyID: string;

    /** The Digits dimension to map. */
    fieldID: ValueOf<typeof CONST.DIGITS_FIELD>;

    /** The Expensify dimension mapped to the Digits dimension. */
    mapping: ValueOf<typeof CONST.DIGITS_MAPPING_VALUE>;
};

export default UpdateDigitsFieldMappingParams;
