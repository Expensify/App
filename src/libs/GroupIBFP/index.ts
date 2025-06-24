import Log from '@libs/Log';
import type { UserMetadata } from '@src/types/onyx';

type FPAttributeFormat = {
    ClearText: number;
    Hashed: number;
    Encrypted: number;
}

// Web platform implementation (default for non-mobile platforms)
const GroupIBFP = {
    initialize: () => {
        Log.info('[GroupIB FP] Web platform detected - using stub implementation');
    },

    setSessionId: (sessionId: string) => {
        Log.info(`[GroupIB FP] setSessionId called (web stub): ${sessionId}`);
    },

    setLogin: (userMetadata: UserMetadata) => {
        Log.info(`[GroupIB FP] setLogin called (web stub): ${userMetadata.email ?? 'no email'}`);
    },

    setAttribute: (attributeTitle: string, attributeValue: string, format?: FPAttributeFormat) => {
        Log.info(`[GroupIB FP] setAttribute called (web stub): ${attributeTitle} = ${attributeValue}, format: ${format}`);
    },

    sendEvent: (eventName: string) => {
        Log.info(`[GroupIB FP] sendEvent called (web stub): ${eventName}`);
    },
};

export default GroupIBFP;