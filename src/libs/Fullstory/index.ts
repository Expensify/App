import {FullStory, init, isInitialized} from '@fullstory/browser';
import type {OnyxEntry} from 'react-native-onyx';
import type Session from '@src/types/onyx/Session';
import type {NavigationProperties, UserSession} from './types';

// Placeholder Browser API does not support Manual Page definition
class FSPage {
    private pageName;

    private properties;

    constructor(name: string, properties: NavigationProperties) {
        this.pageName = name;
        this.properties = properties;
    }

    start() {}
}

/**
 * Web does not use Fullstory React-Native lib
 * Proxy function calls to Browser Snippet instance
 * */
const FS = {
    /**
     * Executes a function when the FullStory library is ready, either by initialization or by observing the start event.
     */
    onReady: () =>
        new Promise((resolve) => {
            // Initialised via HEAD snippet
            if (isInitialized()) {
                init({orgId: ''}, resolve);
            } else {
                FullStory('observe', {type: 'start', callback: resolve});
            }
        }),

    /**
     * Sets the identity as anonymous using the FullStory library.
     */
    anonymize: () => FullStory('setIdentity', {anonymous: true}),

    /**
     * Sets the identity consent status using the FullStory library.
     */
    consent: (c: boolean) => FullStory('setIdentity', {consent: c}),

    /**
     * Initializes the FullStory session with the provided session information.
     */
    consentAndIdentify: (value: OnyxEntry<Session>) => {
        try {
            FS.onReady().then(() => {
                const session: UserSession = {
                    email: value?.email,
                    accountID: value?.accountID,
                };
                // set consent
                FS.consent(true);
                FS.fsIdentify(session);
            });
        } catch (e) {
            // error handler
        }
    },

    /**
     * Sets the FullStory user identity based on the provided session information.
     * If the session does not contain an email, the user identity is anonymized.
     * If the session contains an email, the user identity is defined with the email and account ID.
     */
    fsIdentify: (session: UserSession) => {
        if (typeof session.email === 'undefined') {
            // anonymize FullStory user identity session
            FS.anonymize();
        } else {
            // define FullStory user identity
            FullStory('setIdentity', {
                uid: String(session.accountID),
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
