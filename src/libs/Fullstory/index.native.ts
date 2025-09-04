import FullStory, {FSPage} from '@fullstory/react-native';
import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import * as Environment from '@src/libs/Environment/Environment';
import getChatFSClass from './common';
import type {Fullstory} from './types';

const FS: Fullstory = {
    Page: FSPage,

    getChatFSClass,

    init: (userMetadata) => FS.consentAndIdentify(userMetadata),

    onReady: () => Promise.resolve(),

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
            Environment.getEnvironment().then((envName: string) => {
                const isTestEmail = userMetadata.email !== undefined && userMetadata.email.startsWith('fullstory') && userMetadata.email.endsWith(CONST.EMAIL.QA_DOMAIN);
                if ((CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) || Str.extractEmailDomain(userMetadata.email ?? '') === CONST.EXPENSIFY_PARTNER_NAME) {
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
};

export default FS;
