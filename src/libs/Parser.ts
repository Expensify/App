import ONYXKEYS from '@src/ONYXKEYS';

// eslint-disable-next-line no-restricted-imports
import {ExpensiMark} from 'expensify-common';
import Onyx from 'react-native-onyx';

import Log from './Log';
import {getAccountIDToNameMap} from './PersonalDetailsStore';

let reportIDToNameMap: Record<string, string> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        // Clear the map so removed reports don’t linger
        reportIDToNameMap = {};

        if (!value) {
            return;
        }

        for (const report of Object.values(value)) {
            if (!report) {
                continue;
            }
            reportIDToNameMap[report.reportID] = report.reportName ?? report.reportID;
        }
    },
});

type Extras = {
    reportIDToName?: Record<string, string>;
    accountIDToName?: Record<string, string>;
    cacheVideoAttributes?: (vidSource: string, attrs: string) => void;
    videoAttributeCache?: Record<string, string>;
};

class ExpensiMarkWithContext extends ExpensiMark {
    htmlToMarkdown(htmlString: string, extras?: Extras): string {
        return super.htmlToMarkdown(htmlString, {
            reportIDToName: extras?.reportIDToName ?? reportIDToNameMap,
            accountIDToName: extras?.accountIDToName ?? getAccountIDToNameMap(),
            cacheVideoAttributes: extras?.cacheVideoAttributes,
        });
    }

    htmlToText(htmlString: string, extras?: Extras): string {
        return super.htmlToText(htmlString, {
            reportIDToName: extras?.reportIDToName ?? reportIDToNameMap,
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
