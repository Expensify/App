import {FullStory, init, isInitialized} from '@fullstory/browser';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isConciergeChatReport, isExpensifyAndCustomerChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import * as Environment from '@src/libs/Environment/Environment';
import type {OnyxInputOrEntry, PersonalDetailsList, Report, UserMetadata} from '@src/types/onyx';
import type NavigationProperties from './types';

const WEB_PROP_ATTR = 'data-testid';
const MASK = 'fs-mask';
const UNMASK = 'fs-unmask';
const CUSTOMER = 'customer';
const CONCIERGE = 'concierge';
const OTHER = 'other';

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
                if (CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) {
                    return;
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
        FullStory('setIdentity', {
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

/**
 * Extract values from non-scraped at build time attribute WEB_PROP_ATTR,
 * reevaluate "fs-class".
 */
function parseFSAttributes(): void {
    window?.document?.querySelectorAll(`[${WEB_PROP_ATTR}]`).forEach((o) => {
        const attr = o.getAttribute(WEB_PROP_ATTR) ?? '';
        if (/fs-/gim.test(attr)) {
            let fsAttrs = attr.match(/fs-[a-zA-Z0-9_-]+/g) ?? [];
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

            cleanedAttrs ? o.setAttribute(WEB_PROP_ATTR, cleanedAttrs) : o.removeAttribute(WEB_PROP_ATTR);
        }
    });
}

/*
    prefix? if component name should be used as a prefix,
    in case data-test-id attribute usage,
    clean component name should be preserved in data-test-id.
*/
function getFSAttributes(name: string, mask: boolean, prefix: boolean): string {
    const componentPrefix = prefix ? `${name},` : '';
    const componentSuffix = name ? `,fs-${name}` : '';
    const fsAttrValue = `${componentPrefix}${mask ? MASK : UNMASK}${componentSuffix}`;
    /*
    testID: componentName,fs-unmask,fs-componentName
    fsClass: fs-unmask,fs-componentName
    */
    return fsAttrValue;
}

function getChatFSAttributes(context: OnyxEntry<PersonalDetailsList>, name: string, report: OnyxInputOrEntry<Report>, prefix: boolean): string {
    let componentPrefix = prefix ? `${name},` : '';
    let componentSuffix = name ? `,fs-${name}` : '';
    let fsAttrValue = '';

    if (!!isConciergeChatReport(report)) {
        componentPrefix = prefix ? `${CONCIERGE}-${name},` : '';
        componentSuffix = name ? `,fs-${name}` : '';
        /*
        concierge-chatMessage,fs-unmask,fs-chatMessage
        */
        fsAttrValue = `${componentPrefix}${UNMASK}${componentSuffix}`;
    } else if (!!isExpensifyAndCustomerChat(context, report)) {
        componentPrefix = prefix ? `${CUSTOMER}-${name},` : '';
        componentSuffix = name ? `,fs-${name}` : '';
        /*
        customer-chatMessage,fs-unmask,fs-chatMessage
        */
        fsAttrValue = `${componentPrefix}${UNMASK}${componentSuffix}`;
    } else {
        componentPrefix = prefix ? `${OTHER}-${name},` : '';
        componentSuffix = name ? `,fs-${name}` : '';
        /*
        other-chatMessage,fs-mask,fs-chatMessage
        */
        fsAttrValue = `${componentPrefix}${MASK}${componentSuffix}`;
    }

    return fsAttrValue;
}

export default FS;
export {FSPage, parseFSAttributes, getFSAttributes, getChatFSAttributes};
