import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdatePolicyConnectionConfigParams = {
    policyID: string;
    connectionName: string;
    settingName: ValueOf<typeof CONST.QUICK_BOOKS_IMPORTS>;
    settingValue: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>;
    idempotencyKey: string;
};

export default UpdatePolicyConnectionConfigParams;
