import {ValueOf} from 'type-fest';
import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type Policy = {
    /** The ID of the policy */
    id?: string;

    /** The name of the policy */
    name?: string;

    /** The current user's role in the policy */
    role?: ValueOf<typeof CONST.POLICY.ROLE>;

    /** The policy type */
    type?: ValueOf<typeof CONST.POLICY.TYPE>;

    /** The email of the policy owner */
    owner?: string;

    /** The output currency for the policy */
    outputCurrency?: string;

    /** The URL for the policy avatar */
    avatar?: string;

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    pendingAction?: OnyxCommon.PendingAction;
    errors: OnyxCommon.Errors;
    isFromFullPolicy?: boolean;
    lastModified?: string;
    customUnits?: Record<string, unknown>;
};

export default Policy;
