import type {ErrorFields, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** Model of user login data */
type Login = OnyxValueWithOfflineFeedback<{
    /** The timestamp of when this login was created */
    created: string;

    /** The owner of this login */
    accountID: number;

    /** The ID for the partner for this login (either Expensify itself or another 3rd party service)  */
    partnerID: number;

    /** This login's unique user ID for this partner */
    partnerUserID: string;

    /** Most recent timestamp of when this login was used */
    lastLogin: string;

    /** Timestamp of when this login was validated */
    validatedDate: string | null;

    /** Additional name-value pairs for this login */
    additionalData?: {
        // @typescript-eslint/naming-convention
        /** The app version used where this account is logged in */
        app_version: string;

        /** The device name where this account is logged in */
        deviceName: string;

        /** The device version where this account is logged in */
        deviceVersion?: string;

        /** The device OS where this account is logged in */
        os: string;

        /** The device OS version where this account is logged in */
        osVersion: string;

        /** Timestamp of when this device info was collected */
        timestamp: string;
    };

    /** Error fields of the login */
    errorFields?: ErrorFields<'revoke'>;
}>;

/** Record of user login data, indexed by partnerID_partnerUserID */
type Logins = Record<string, Login>;

export type {Login};
export default Logins;
