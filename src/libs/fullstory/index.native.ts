import FullStory, {FSPage} from '@fullstory/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type Session from '@src/types/onyx/Session';
import type {UserSession} from './types';

/**
 * Fullstory React-Native lib adapter
 * Proxy function calls to React-Native lib
 * */
const FS = {
    /**
     * Sets the identity as anonymous using the FullStory library.
     */
    anonymize: () => FullStory.anonymize(),

    /**
     * Sets the identity consent status using the FullStory library.
     */
    consent: (c: boolean) => FullStory.consent(c),

    /**
     * Initializes the FullStory session with the provided session information.
     */
    consentAndIdentify: (value: OnyxEntry<Session>) => {
        try {
            const session: UserSession = {
                email: value?.email,
                accountID: value?.accountID,
            };
            // set consent
            FullStory.consent(true);
            FS.fsIdentify(session);
        } catch (e) {
            // error handler
        }
    },

    /**
     * Sets the FullStory user identity based on the provided session information.
     * If the session is null or the email is 'undefined', the user identity is anonymized.
     * If the session contains an email, the user identity is defined with the email and account ID.
     */
    fsIdentify: (session: UserSession) => {
        if (!session || session.email === 'undefined') {
            // anonymize FullStory user identity session
            FullStory.anonymize();
        } else {
            // define FullStory user identity
            FullStory.identify(String(session.accountID), {
                properties: {
                    displayName: session.email,
                    email: session.email,
                },
            });
        }
    },
};

export default FS;
export {FSPage};
