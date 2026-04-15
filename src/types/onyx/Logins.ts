import type {ErrorFields, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** Model of user login data */
type Login = OnyxValueWithOfflineFeedback<{
    created: string;

    /** Account ID */
    accountID: number;

    partnerID: number;
    partnerUserID: string;

    /** Last login time */
    lastLogin: string;

    /** Validated date */
    validatedDate: string | null;

    /** Additional data */
    additionalData: {
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

        timestamp: string;
    };

    /** Error fields of the login */
    errorFields?: ErrorFields<'revoke'>;
}>;

/** Record of user login data, indexed by partnerID_partnerUserID */
type Logins = Record<string, Login>;

export type {Login};
export default Logins;
