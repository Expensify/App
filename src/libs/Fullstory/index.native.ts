import FullStory, {FSPage} from '@fullstory/react-native';
import getEnvironment from '@src/libs/Environment/getEnvironment';
import {getChatFSClass, shouldInitializeFullstory} from './common';
import type {Fullstory} from './types';

const FS: Fullstory = {
    Page: FSPage,

    getChatFSClass,

    init: (userMetadata) => FS.consentAndIdentify(userMetadata),

    onReady: () => Promise.resolve(),

    shouldInitialize: shouldInitializeFullstory,

    consent: (shouldConsent) => FullStory.consent(shouldConsent),

    identify: (userMetadata, envName) => {
        const localMetadata = userMetadata;
        localMetadata.environment = envName;
        FullStory.identify(String(localMetadata.accountID), localMetadata);
    },

    consentAndIdentify: (userMetadata) => {
        // On the first subscribe for UserMetadata, this function will be called. We need
        // to confirm that we actually have any value here before proceeding.
        if (!userMetadata?.accountID) {
            return;
        }

        try {
            // We only use FullStory in production environment. We need to check this here
            // after the init function since this function is also called on updates for
            // UserMetadata onyx key.
            getEnvironment().then((envName: string) => {
                if (!FS.shouldInitialize(userMetadata, envName)) {
                    return;
                }

                FullStory.restart();
                FullStory.consent(true);
                FS.identify(userMetadata, envName);
            });
        } catch (e) {
            // error handler
        }
    },

    anonymize: () => FullStory.anonymize(),

    getSessionId: () => {
        return FullStory.getCurrentSession();
    },

    getSessionURL: () => {
        return FullStory.getCurrentSessionURL();
    },
};

export default FS;
