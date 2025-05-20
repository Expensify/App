import {FullStory, init, isInitialized} from '@fullstory/browser';
import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import {isConciergeChatReport, shouldUnmaskChat} from '@libs/ReportUtils';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import * as Environment from '@src/libs/Environment/Environment';
import type {OnyxInputOrEntry, PersonalDetailsList, Report, UserMetadata} from '@src/types/onyx';
import type NavigationProperties from './types';

/**
 * Extract values from non-scraped at build time attribute WEB_PROP_ATTR,
 * reevaluate "fs-class".
 */
function parseFSAttributes(): void {
    window?.document?.querySelectorAll(`[${CONST.FULL_STORY.WEB_PROP_ATTR}]`).forEach((o) => {
        const attr = o.getAttribute(CONST.FULL_STORY.WEB_PROP_ATTR) ?? '';
        if (!/fs-/gim.test(attr)) {
            return;
        }

        const fsAttrs = attr.match(/fs-[a-zA-Z0-9_-]+/g) ?? [];
        o.setAttribute('fs-class', fsAttrs.join(','));

        let cleanedAttrs = attr;
        fsAttrs.forEach((fsAttr) => {
            cleanedAttrs = cleanedAttrs.replace(fsAttr, '');
        });

        cleanedAttrs = cleanedAttrs
            .replace(/,+/g, ',')
            .replace(/\s*,\s*/g, ',')
            .replace(/^,+|,+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanedAttrs) {
            o.setAttribute(CONST.FULL_STORY.WEB_PROP_ATTR, cleanedAttrs);
        } else {
            o.removeAttribute(CONST.FULL_STORY.WEB_PROP_ATTR);
        }
    });
}

/*
    prefix? if component name should be used as a prefix,
    in case data-test-id attribute usage,
    clean component name should be preserved in data-test-id.
*/
function getFSAttributes(name: string, mask: boolean, prefix: boolean): string {
    if (!name) {
        return `${mask ? CONST.FULL_STORY.MASK : CONST.FULL_STORY.UNMASK}`;
    }

    if (prefix) {
        return `${name},${mask ? CONST.FULL_STORY.MASK : CONST.FULL_STORY.UNMASK}`;
    }

    return `${name}`;
}

function getChatFSAttributes(context: OnyxEntry<PersonalDetailsList>, name: string, report: OnyxInputOrEntry<Report>): string[] {
    if (!name) {
        return ['', ''];
    }
    if (isConciergeChatReport(report)) {
        const formattedName = `${CONST.FULL_STORY.CONCIERGE}-${name}`;
        return [`${formattedName},${CONST.FULL_STORY.UNMASK}`, `${formattedName}`];
    }
    if (shouldUnmaskChat(context, report)) {
        const formattedName = `${CONST.FULL_STORY.CUSTOMER}-${name}`;
        return [`${formattedName},${CONST.FULL_STORY.UNMASK}`, `${formattedName}`];
    }

    const formattedName = `${CONST.FULL_STORY.OTHER}-${name}`;
    return [`${formattedName},${CONST.FULL_STORY.MASK}`, `${formattedName}`];
}

// Placeholder Browser API does not support Manual Page definition
class FSPage {
    private pageName;

    private properties;

    constructor(name: string, properties: NavigationProperties) {
        this.pageName = name;
        this.properties = properties;
    }

    start() {
        parseFSAttributes();
    }
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
            if (!isInitialized()) {
                init({orgId: 'o-1WN56P-na1'}, resolve);

                // FS init function might have a race condition with the head snippet. If the head snipped is loaded first,
                // then the init function will not call the resolve function, and we'll never identify the user logging in,
                // and we need to call resolve manually. We're adding a 1s timeout to make sure the init function has enough
                // time to call the resolve function in case it ran successfully.
                setTimeout(resolve, 1000);
            } else {
                FullStory(CONST.FULL_STORY.OBSERVE, {type: 'start', callback: resolve});
            }
        }),

    /**
     * Sets the identity as anonymous using the FullStory library.
     */
    anonymize: () => FullStory(CONST.FULL_STORY.SET_IDENTITY, {anonymous: true}),

    /**
     * Sets the identity consent status using the FullStory library.
     */
    consent: (c: boolean) => FullStory(CONST.FULL_STORY.SET_IDENTITY, {consent: c}),

    /**
     * Initializes the FullStory metadata with the provided metadata information.
     */
    consentAndIdentify: (value: OnyxEntry<UserMetadata>) => {
        // On the first subscribe for UserMetadata, this function will be called. We need
        // to confirm that we actually have any value here before proceeding.
        if (!value?.accountID) {
            return;
        }
        try {
            Environment.getEnvironment().then((envName: string) => {
                const isTestEmail = value.email !== undefined && value.email.startsWith('fullstory') && value.email.endsWith(CONST.EMAIL.QA_DOMAIN);
                if (
                    (CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) ||
                    Str.extractEmailDomain(value.email ?? '') === CONST.EXPENSIFY_PARTNER_NAME ||
                    Session.isSupportAuthToken()
                ) {
                    // On web, if we started FS at some point in a browser, it will run forever. So let's shut it down if we don't want it to run.
                    if (isInitialized()) {
                        FullStory(CONST.FULL_STORY.SHUTDOWN);
                    }
                    return;
                }
                // If Fullstory was already initialized, we might have shutdown the session. So let's
                // restart it before identifying the user.
                if (isInitialized()) {
                    FullStory(CONST.FULL_STORY.RESTART);
                }
                FS.onReady().then(() => {
                    FS.consent(true);
                    const localMetadata = value;
                    localMetadata.environment = envName;
                    FS.fsIdentify(localMetadata);
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
    fsIdentify: (metadata: UserMetadata) => {
        FullStory(CONST.FULL_STORY.SET_IDENTITY, {
            uid: String(metadata.accountID),
            properties: metadata,
        });
    },

    /**
     * Init function, created so we're consistent with the native file
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    init: (_value: OnyxEntry<UserMetadata>) => {},
};

export default FS;
export {FSPage, parseFSAttributes, getFSAttributes, getChatFSAttributes};
