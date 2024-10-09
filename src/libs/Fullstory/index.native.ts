import FullStory, {FSPage} from '@fullstory/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as Environment from '@src/libs/Environment/Environment';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserMetadata} from '@src/types/onyx';

/**
 * Fullstory React-Native lib adapter
 * Proxy function calls to React-Native lib
 * */
const FS = {
    /**
     * Initializes FullStory
     */
    init: (value: OnyxEntry<UserMetadata>) => {
        FS.consentAndIdentify(value);
    },

    /**
     * Sets the identity as anonymous using the FullStory library.
     */
    anonymize: () => FullStory.anonymize(),

    /**
     * Sets the identity consent status using the FullStory library.
     */
    consent: (c: boolean) => FullStory.consent(c),

    /**
     * Initializes the FullStory metadata with the provided metadata information.
     */
    consentAndIdentify: (value: OnyxEntry<UserMetadata>) => {
        // On the first subscribe for UserMetadta, this function will be called. We need
        // to confirm that we actually have any value here before proceeding.
        if (!value?.accountID) {
            return;
        }
        try {
            // We only use FullStory in production environment. We need to check this here
            // after the init function since this function is also called on updates for
            // UserMetadata onyx key.
            Environment.getEnvironment().then((envName: string) => {
                if (envName !== CONST.ENVIRONMENT.PRODUCTION) {
                    return;
                }
                FullStory.restart();
                FullStory.consent(true);
                FS.fsIdentify(value, envName);
            });
        } catch (e) {
            // error handler
        }
    },

    /**
     * Sets the FullStory user identity based on the provided metadata information.
     */
    fsIdentify: (metadata: UserMetadata, envName: string) => {
        const localMetadata = metadata;
        localMetadata.environment = envName;
        FullStory.identify(String(localMetadata.accountID), localMetadata);
    },
};

export default FS;
export {FSPage};
