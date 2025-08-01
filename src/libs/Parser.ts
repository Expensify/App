// eslint-disable-next-line no-restricted-imports
import {ExpensiMark} from 'expensify-common';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import Log from './Log';

const accountIDToNameMap: Record<string, string> = {};
const reportIDToNameMap: Record<string, string> = {};

// Use connectWithoutView because it's only executed once when initializing the ExpensiMarkWithContext instance
// without triggering UI updates or component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }

        Object.values(value).forEach((report) => {
            if (!report) {
                return;
            }
            reportIDToNameMap[report.reportID] = report.reportName ?? report.reportID;
        });
    },
});

// Use connectWithoutView because it's only executed once when initializing the ExpensiMarkWithContext instance
// without triggering UI updates or component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (personalDetailsList) => {
        Object.values(personalDetailsList ?? {}).forEach((personalDetails) => {
            if (!personalDetails) {
                return;
            }

            accountIDToNameMap[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
        });
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
            accountIDToName: extras?.accountIDToName ?? accountIDToNameMap,
            cacheVideoAttributes: extras?.cacheVideoAttributes,
        });
    }

    htmlToText(htmlString: string, extras?: Extras): string {
        return super.htmlToText(htmlString, {
            reportIDToName: extras?.reportIDToName ?? reportIDToNameMap,
            accountIDToName: extras?.accountIDToName ?? accountIDToNameMap,
            cacheVideoAttributes: extras?.cacheVideoAttributes,
        });
    }

    truncateHTML(htmlString: string, limit: number, extras?: {ellipsis: string | undefined}): string {
        return super.truncateHTML(htmlString, limit, extras);
    }
}

ExpensiMarkWithContext.setLogger(Log);
const Parser = new ExpensiMarkWithContext();

export default Parser;
