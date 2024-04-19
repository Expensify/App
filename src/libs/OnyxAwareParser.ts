import ONYXKEYS from "@src/ONYXKEYS";
import ExpensiMark from "expensify-common/lib/ExpensiMark";
import Onyx from "react-native-onyx";

const parser = new ExpensiMark();

const reportIDToNameMap: Record<string, string> = {};
const accountIDToNameMap: Record<string, string> = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report) => {
        if (!report) {
            return;
        }

        reportIDToNameMap[report.reportID] = report.reportName ?? '';
    },
})

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (personalDetailsList) => {
        Object.values(personalDetailsList ?? {}).forEach((personalDetails) => {
            if (!personalDetails) {
                return;
            }

            accountIDToNameMap[personalDetails.accountID] = personalDetails.displayName ?? '';
        });
    },
})


function parseHtmlToMarkdown(html: string): string {
    return parser.htmlToMarkdown(html, {reportIdToName: reportIDToNameMap, accountIDToName: accountIDToNameMap});
};

export default parseHtmlToMarkdown;
