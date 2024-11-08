import FullStory, {FSPage} from '@fullstory/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {isConciergeChatReport, isExpensifyAndCustomerChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import * as Environment from '@src/libs/Environment/Environment';
import type {OnyxInputOrEntry, PersonalDetailsList, Report, UserMetadata} from '@src/types/onyx';

const MASK = 'fs-mask';
const UNMASK = 'fs-unmask';
const CUSTOMER = 'customer';
const CONCIERGE = 'concierge';
const OTHER = 'other';

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
                const isTestEmail = value.email !== undefined && value.email.startsWith('fullstory') && value.email.endsWith(CONST.EMAIL.QA_DOMAIN);
                if (CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) {
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

/**
 * Placeholder function for Mobile-Web compatibility.
 */
function parseFSAttributes(): void {
    // pass
}

/*
    prefix? if component name should be used as a prefix,
    in case data-test-id attribute usage,
    clean component name should be preserved in data-test-id.
*/
function getFSAttributes(name: string, mask: boolean, prefix: boolean): string {
    if (!name && !prefix) {
        return `${mask ? MASK : UNMASK}`;
    }
    // prefixed for Native apps should contain only component name
    if (prefix) {
        return name;
    }

    return `${name},${mask ? MASK : UNMASK}`;
}

function getChatFSAttributes(context: OnyxEntry<PersonalDetailsList>, name: string, report: OnyxInputOrEntry<Report>): string[] {
    if (!name) {
        return ['', ''];
    }
    if (isConciergeChatReport(report)) {
        const formattedName = `${CONCIERGE}-${name}`;
        return [`${formattedName}`, `${UNMASK},${formattedName}`];
    }
    if (isExpensifyAndCustomerChat(context, report)) {
        const formattedName = `${CUSTOMER}-${name}`;
        return [`${formattedName}`, `${UNMASK},${formattedName}`];
    }
    const formattedName = `${OTHER}-${name}`;
    return [`${formattedName}`, `${MASK},${formattedName}`];
}
export default FS;
export {FSPage, parseFSAttributes, getFSAttributes, getChatFSAttributes};
