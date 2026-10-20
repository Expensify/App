import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

// eslint-disable-next-line no-restricted-imports
import {ExpensiMark} from 'expensify-common';
import Onyx from 'react-native-onyx';

import Log from './Log';
import {getAccountIDToNameMap} from './PersonalDetailsStore';

let allReports: OnyxCollection<Report>;
let reportIDToNameMap: Record<string, string> = {};
let reportIDToNameMapSource: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        allReports = value;
    },
});

/** Builds the map when the parser needs it instead of on every report write. */
function getReportIDToNameMap(): Record<string, string> {
    if (reportIDToNameMapSource === allReports) {
        return reportIDToNameMap;
    }
    // Rebuild from scratch so removed reports don’t linger
    reportIDToNameMap = {};
    reportIDToNameMapSource = allReports;
    for (const report of Object.values(allReports ?? {})) {
        if (!report) {
            continue;
        }
        reportIDToNameMap[report.reportID] = report.reportName ?? report.reportID;
    }
    return reportIDToNameMap;
}

type Extras = {
    reportIDToName?: Record<string, string>;
    accountIDToName?: Record<string, string>;
    cacheVideoAttributes?: (vidSource: string, attrs: string) => void;
    videoAttributeCache?: Record<string, string>;
};

class ExpensiMarkWithContext extends ExpensiMark {
    htmlToMarkdown(htmlString: string, extras?: Extras): string {
        return super.htmlToMarkdown(htmlString, {
            reportIDToName: extras?.reportIDToName ?? getReportIDToNameMap(),
            accountIDToName: extras?.accountIDToName ?? getAccountIDToNameMap(),
            cacheVideoAttributes: extras?.cacheVideoAttributes,
        });
    }

    htmlToText(htmlString: string, extras?: Extras): string {
        return super.htmlToText(htmlString, {
            reportIDToName: extras?.reportIDToName ?? getReportIDToNameMap(),
            accountIDToName: extras?.accountIDToName ?? getAccountIDToNameMap(),
            cacheVideoAttributes: extras?.cacheVideoAttributes,
        });
    }

    isHTML(text: string): boolean {
        return /<[^>]+>/.test(text) || /&[#\w]+;/.test(text);
    }
}

ExpensiMarkWithContext.setLogger(Log);
const Parser = new ExpensiMarkWithContext();

export default Parser;
