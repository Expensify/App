import type {ErrorFields, OnyxValueWithOfflineFeedback} from './OnyxCommon';

type Login = OnyxValueWithOfflineFeedback<{
    created: string;
    accountID: number;
    partnerID: number;
    partnerUserID: string;
    lastLogin: string;
    validatedDate: string | null;
    additionalData: {
        app_version: string;
        deviceName: string;
        deviceVersion?: string;
        os: string;
        osVersion: string;
        timestamp: string;
    };
    errorFields?: ErrorFields<'revoke'>;
}>;

type Logins = Record<string, Login>;

export type {Login};
export default Logins;
