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
    init: () => {
        Environment.getEnvironment().then((envName: string) => {
            // We only want to start fullstory if the app is running in production
            if (envName !== CONST.ENVIRONMENT.PRODUCTION) {
                return;
            }
            FullStory.restart();
            const [session] = useOnyx(ONYXKEYS.USER_METADATA);
            FS.fsIdentify(session);
        });
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
        try {
            // We only use FullStory in production environment
            FullStory.consent(true);
            FS.fsIdentify(value);
        } catch (e) {
            // error handler
        }
    },

    /**
     * Sets the FullStory user identity based on the provided metadata information.
     * If the metadata is null or the email is 'undefined', the user identity is anonymized.
     * If the metadata contains an accountID, the user identity is defined with it.
     */
    fsIdentify: (metadata: OnyxEntry<UserMetadata>) => {
        if (!metadata?.accountID) {
            // anonymize FullStory user identity metadata
            FullStory.anonymize();
        } else {
            Environment.getEnvironment().then((envName: string) => {
                // define FullStory user identity
                const localMetadata = metadata;
                localMetadata.environment = envName;
                FullStory.identify(String(localMetadata.accountID), localMetadata);
            });
        }
    },
};

export default FS;
export {FSPage};
