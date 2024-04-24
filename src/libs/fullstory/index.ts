import {FullStory, init, isInitialized} from '@fullstory/browser';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as Environment from '@src/libs/Environment/Environment';
import type {UserMetadata} from '@src/types/onyx';
import type NavigationProperties from './types';

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
            Environment.getEnvironment().then((envName: string) => {
                if (CONST.ENVIRONMENT.PRODUCTION !== envName) {
                    return;
                }
                // Initialised via HEAD snippet
                if (!isInitialized()) {
                    init({orgId: ''}, resolve);
                } else {
                    FullStory('observe', {type: 'start', callback: resolve});
                }
            });
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
     * Initializes the FullStory metadata with the provided metadata information.
     */
    consentAndIdentify: (value: OnyxEntry<UserMetadata>) => {
        try {
            Environment.getEnvironment().then((envName: string) => {
                if (CONST.ENVIRONMENT.PRODUCTION !== envName) {
                    return;
                }
                FS.onReady().then(() => {
                    FS.consent(true);
                    FS.fsIdentify(value);
                });
            });
        } catch (e) {
            // error handler
        }
    },

    /**
     * Sets the FullStory user identity based on the provided metadata information.
     * If the metadata does not contain an email, the user identity is anonymized.
     * If the metadata contains an accountID, the user identity is defined with it.
     */
    fsIdentify: (metadata: UserMetadata | null) => {
        if (!metadata?.accountID) {
            // anonymize FullStory user identity metadata
            FS.anonymize();
        } else {
            // define FullStory user identity
            FullStory('setIdentity', {
                uid: String(metadata.accountID),
                properties: metadata,
            });
        }
    },
};

export default FS;
export {FSPage};
