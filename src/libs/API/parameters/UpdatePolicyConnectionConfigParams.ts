import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdatePolicyConnectionConfigParams = {
    policyID: string;
    connectionName: string;
    settingName: ValueOf<typeof CONST.QUICK_BOOKS_CONFIG>;
    settingValue: string | boolean;
    idempotencyKey: string;
};

export default UpdatePolicyConnectionConfigParams;
