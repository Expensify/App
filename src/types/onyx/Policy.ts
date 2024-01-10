import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Unit = 'mi' | 'km';

type Rate = {
    name: string;
    rate: number;
    currency: string;
};

type CustomUnit = {
    customUnitID?: string;
    name?: string;
    attributes: {
        unit: Unit;
    };
    rates?: Record<string, Rate>;
};

type Policy = {
    /** The ID of the policy */
    id: string;

    /** The name of the policy */
    name: string;

    /** The current user's role in the policy */
    role: ValueOf<typeof CONST.POLICY.ROLE>;

    /** The policy type */
    type: ValueOf<typeof CONST.POLICY.TYPE>;

    /** The email of the policy owner */
    owner: string;

    /** The accountID of the policy owner */
    ownerAccountID?: number;

    /** The output currency for the policy */
    outputCurrency: string;

    /** The URL for the policy avatar */
    avatar?: string;

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Indicates the type of change made to the policy that hasn't been synced with the server yet  */
    pendingAction?: OnyxCommon.PendingAction;

    /** A list of errors keyed by microtime */
    errors?: OnyxCommon.Errors;

    /** Whether this policy was loaded from a policy summary, or loaded completely with all of its values */
    isFromFullPolicy?: boolean;

    /** When this policy was last modified */
    lastModified?: string;

    /** The custom units data for this policy */
    customUnits?: Record<string, CustomUnit>;

    /** Whether policy expense chats can be created and used on this policy. Enabled manually by CQ/JS snippet. Always true for free policies. */
    isPolicyExpenseChatEnabled: boolean;

    /** Whether the auto reporting is enabled */
    autoReporting?: boolean;

    /** The scheduled submit frequency set up on the this policy */
    autoReportingFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** Whether the scheduled submit is enabled */
    isHarvestingEnabled?: boolean;

    /** The accountID of manager who the employee submits their expenses to on paid policies */
    submitsTo?: number;

    /** The employee list of the policy */
    employeeList?: [];
};

export default Policy;

export type {Unit};
