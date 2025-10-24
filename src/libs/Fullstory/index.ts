import {FullStory, init, isInitialized} from '@fullstory/browser';
import {Str} from 'expensify-common';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import getEnvironment from '@src/libs/Environment/getEnvironment';
import getChatFSClass from './common';
import type {FSPageLike, Fullstory} from './types';

// Placeholder Browser API does not support Manual Page definition
class FSPage implements FSPageLike {
    start() {}
}

const FS: Fullstory = {
    Page: FSPage,

    getChatFSClass,

    init: () => {},

    onReady: () =>
        new Promise((resolve) => {
            if (!isInitialized()) {
                init({orgId: 'o-1WN56P-na1'}, resolve);

                // FS init function might have a race condition with the head snippet. If the head snipped is loaded first,
                // then the init function will not call the resolve function, and we'll never identify the user logging in,
                // and we need to call resolve manually. We're adding a 1s timeout to make sure the init function has enough
                // time to call the resolve function in case it ran successfully.
                setTimeout(resolve, 1000);
            } else {
                FullStory(CONST.FULLSTORY.OPERATION.OBSERVE, {type: 'start', callback: resolve});
            }
        }),

    shouldInitialize: (userMetadata, envName) => {
        const isTestEmail = userMetadata.email !== undefined && userMetadata.email.startsWith('fullstory') && userMetadata.email.endsWith(CONST.EMAIL.QA_DOMAIN);
        if ((CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) || Str.extractEmailDomain(userMetadata.email ?? '') === CONST.EXPENSIFY_PARTNER_NAME || Session.isSupportAuthToken()) {
            return false;
        }

        return true;
    },

    consent: (shouldConsent) => FullStory(CONST.FULLSTORY.OPERATION.SET_IDENTITY, {consent: shouldConsent}),

    identify: (userMetadata) => {
        /**
         * Sets the FullStory user identity based on the provided metadata information.
         * If the metadata does not contain an email, the user identity is anonymized.
         * If the metadata contains an accountID, the user identity is defined with it.
         */
        FullStory(CONST.FULLSTORY.OPERATION.SET_IDENTITY, {
            uid: String(userMetadata.accountID),
            properties: userMetadata,
        });
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
                    // On web, if we started FS at some point in a browser, it will run forever. So let's shut it down if we don't want it to run.
                    if (isInitialized()) {
                        FullStory(CONST.FULLSTORY.OPERATION.SHUTDOWN);
                    }
                    return;
                }

                // If Fullstory was already initialized, we might have shutdown the session. So let's
                // restart it before identifying the user.
                if (isInitialized()) {
                    FullStory(CONST.FULLSTORY.OPERATION.RESTART);
                }

                FS.onReady().then(() => {
                    FS.consent(true);
                    const localMetadata = userMetadata;
                    localMetadata.environment = envName;
                    FS.identify(localMetadata);
                });
            });
        } catch (e) {
            // error handler
        }
    },

    anonymize: () => FullStory(CONST.FULLSTORY.OPERATION.SET_IDENTITY, {anonymous: true}),
};

export default FS;
