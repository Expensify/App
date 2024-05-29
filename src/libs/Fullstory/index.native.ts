import FullStory, {FSPage} from '@fullstory/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {UserMetadata} from '@src/types/onyx';

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
            // define FullStory user identity
            FullStory.identify(String(metadata.accountID), {
                properties: metadata,
            });
        }
    },
};

export default FS;
export {FSPage};
