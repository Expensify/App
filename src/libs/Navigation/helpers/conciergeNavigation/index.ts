/**
 * Decides where a link to the Concierge DM or one of its threads opens. With the wide flat navigation they open on the
 * Concierge page, under concierge/:reportID, and everywhere else in the Inbox, under r/:reportID. Links are built with
 * r/:reportID all over the app and in notifications and emails, so paths are rewritten here as they are parsed.
 */
import getEnvironment from '@libs/Environment/getEnvironment';
import type Environment from '@libs/Environment/getEnvironment/types';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Permissions from '@libs/Permissions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, BetaConfiguration, BetaOverrides, Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// connectWithoutView() is the only option here: paths are parsed outside the React tree, by linking and by Navigation.navigate,
// and this module can't import ReportUtils, which imports the path parser. This is not a pattern to copy.
let conciergeReportID: OnyxEntry<string>;
Onyx.connectWithoutView({
    key: ONYXKEYS.CONCIERGE_REPORT_ID,
    callback: (value) => (conciergeReportID = value),
});

let reports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (reports = value),
});

// The Concierge page is behind the flatNav beta, so these mirror what usePermissions reads to check it
let betas: OnyxEntry<Beta[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => (betas = value),
});

let betaConfiguration: OnyxEntry<BetaConfiguration>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETA_CONFIGURATION,
    callback: (value) => (betaConfiguration = value),
});

let betaOverrides: OnyxEntry<BetaOverrides>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETA_OVERRIDES,
    callback: (value) => (betaOverrides = value),
});

// Until the environment resolves, treat it as production so beta overrides don't apply
let environment: Environment = CONST.ENVIRONMENT.PRODUCTION;
getEnvironment().then((value) => {
    environment = value;
});

const REPORT_PATH_REGEX = /^\/r\/(\d+)(\/\d+)?(?=[?#]|$)/;
const NEW_CHAT_PATH_REGEX = /^\/concierge(?=[?#]|$)/;
const CONCIERGE_CONVERSATION_PATH_REGEX = /^\/concierge\/(\d+)(\/\d+)?(?=[?#]|$)/;

/** Whether Concierge conversations open on the Concierge page, which only the wide flat navigation has */
function isConciergeNavigationEnabled(): boolean {
    return !getIsNarrowLayout() && Permissions.isBetaEnabled(CONST.BETAS.FLAT_NAV, betas, betaConfiguration, betaOverrides, environment);
}

function isConciergeConversationReportID(reportID: string): boolean {
    return !!conciergeReportID && (reportID === conciergeReportID || reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.parentReportID === conciergeReportID);
}

function isKnownReportID(reportID: string): boolean {
    return !!reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
}

/** Returns the path a report link should open, given whether the Concierge page is available. Paths start with a slash. */
function getConciergeConversationPath(path: string): string {
    // Before the betas load, a cold start on the Concierge page can't tell yet whether it is available, so the path is kept as it is
    if (!betas) {
        return path;
    }

    if (isConciergeNavigationEnabled()) {
        // The Concierge page starts new conversations from the Concierge DM, which the user never sees as a chat of its own
        if (conciergeReportID && NEW_CHAT_PATH_REGEX.test(path)) {
            return path.replace(NEW_CHAT_PATH_REGEX, `/concierge/${conciergeReportID}`);
        }

        const reportPath = path.replace(REPORT_PATH_REGEX, (match, reportID: string, reportActionPath: string | undefined) =>
            isConciergeConversationReportID(reportID) ? `/concierge/${reportID}${reportActionPath ?? ''}` : match,
        );

        // A Concierge page link to a report that isn't a Concierge conversation opens it in the Inbox
        return reportPath.replace(CONCIERGE_CONVERSATION_PATH_REGEX, (match, reportID: string, reportActionPath: string | undefined) =>
            isKnownReportID(reportID) && !isConciergeConversationReportID(reportID) ? `/r/${reportID}${reportActionPath ?? ''}` : match,
        );
    }
    return path.replace(CONCIERGE_CONVERSATION_PATH_REGEX, (_match, reportID: string, reportActionPath: string | undefined) => `/r/${reportID}${reportActionPath ?? ''}`);
}

/** Shows the Concierge DM, which is the new conversation screen of the Concierge page, as /concierge in the address bar */
function getConciergeDisplayPath(path: string): string {
    if (!conciergeReportID) {
        return path;
    }
    return path.replace(new RegExp(`^/concierge/${conciergeReportID}(?=[?#]|$)`), '/concierge');
}

export {getConciergeConversationPath, getConciergeDisplayPath};
