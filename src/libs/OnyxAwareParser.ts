import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const parser = new ExpensiMark();

const reportIDToNameMap: Record<string, string> = {};
const accountIDToNameMap: Record<string, string> = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report) => {
        if (!report) {
            return;
        }

        reportIDToNameMap[report.reportID] = report.reportName ?? report.displayName ?? report.reportID;
    },
});

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (personalDetailsList) => {
        Object.values(personalDetailsList ?? {}).forEach((personalDetails) => {
            if (!personalDetails) {
                return;
            }

            accountIDToNameMap[personalDetails.accountID] = personalDetails.login ?? String(personalDetails.accountID);
        });
    },
});

function parseHtmlToMarkdown(html: string): string {
    // TODO: change `reportIdToName` to `reportIDToName` (changes in expensify-common)
    return parser.htmlToMarkdown(html, {reportIdToName: reportIDToNameMap, accountIDToName: accountIDToNameMap});
}

function parseHtmlToText(html: string): string {
    // TODO: change `reportIdToName` to `reportIDToName` (changes in expensify-common)
    return parser.htmlToText(html, {reportIdToName: reportIDToNameMap, accountIDToName: accountIDToNameMap});
}

export {parseHtmlToMarkdown, parseHtmlToText};
