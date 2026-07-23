import getEnvironment from '@src/libs/Environment/getEnvironment';
import type UserMetadata from '@src/types/onyx/UserMetadata';

import FullStory, {FSPage} from '@fullstory/react-native';

import type {Fullstory} from './types';

import {getChatFSClass, normalizeFullstoryPropertiesForNative, shouldInitializeFullstory} from './common';

let isFullstoryTrackingEnabled = false;

// The latest metadata received for the current user. UserMetadata is populated by the backend in stages
// (for a new account, `accountID` arrives before `email`), so multiple identification chains can be in
// flight at once. Reading this reference at resolve time ensures a late-resolving chain that was started
// with stale metadata cannot overwrite a newer, more complete identity.
let latestUserMetadata: UserMetadata = {};

const FS: Fullstory = {
    Page: FSPage,

    getChatFSClass,

    init: (userMetadata) => FS.consentAndIdentify(userMetadata),

    onReady: async () => FullStory.onReady(),

    shouldInitialize: shouldInitializeFullstory,

    consent: (shouldConsent) => FullStory.consent(shouldConsent),

    identify: (userMetadata, envName) => {
        const localMetadata = {...userMetadata, environment: envName};
        FullStory.identify(String(localMetadata.accountID), localMetadata);
    },

    consentAndIdentify: (userMetadata) => {
        // On the first subscribe for UserMetadata, this function will be called. We need
        // to confirm that we actually have any value here before proceeding.
        if (!userMetadata?.accountID) {
            return;
        }

        latestUserMetadata = userMetadata;

        try {
            // We only use FullStory in production environment. We need to check this here
            // after the init function since this function is also called on updates for
            // UserMetadata onyx key.
            isFullstoryTrackingEnabled = false;
            getEnvironment().then((envName: string) => {
                if (!FS.shouldInitialize(userMetadata, envName)) {
                    return;
                }

                FullStory.restart();
                FullStory.consent(true);
                // Identify with the freshest metadata rather than the value captured when this chain
                // started, so an email-less chain that resolves late does not clobber the identity.
                FS.identify(latestUserMetadata, envName);
                isFullstoryTrackingEnabled = true;
            });
        } catch (e) {
            // error handler
        }
    },

    anonymize: () => FullStory.anonymize(),

    getSessionId: async () => {
        return FullStory.getCurrentSession();
    },

    getSessionURL: async () => {
        return FullStory.getCurrentSessionURL();
    },

    event: (eventName, eventProperties) => {
        if (!isFullstoryTrackingEnabled) {
            return;
        }

        FullStory.event(eventName, normalizeFullstoryPropertiesForNative(eventProperties ?? {}));
    },

    log: (level, message) => {
        const logLevelMap = {
            log: FullStory.LogLevel.Log,
            info: FullStory.LogLevel.Info,
            warn: FullStory.LogLevel.Warn,
            error: FullStory.LogLevel.Error,
        };
        FullStory.log(logLevelMap[level] ?? FullStory.LogLevel.Log, message);
    },

    setUserVars: (userVars) => {
        FullStory.setUserVars(
            normalizeFullstoryPropertiesForNative(userVars, {
                preserveKeys: ['displayName', 'email'],
            }),
        );
    },

    resetIdleTimer: () => {
        FullStory.resetIdleTimer();
    },
};

export default FS;
