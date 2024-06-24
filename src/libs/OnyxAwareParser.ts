import {ExpensiMark} from 'expensify-common';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReportConnection from './ReportConnection';

const parser = new ExpensiMark();

const accountIDToNameMap: Record<string, string> = {};

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

function parseHtmlToMarkdown(
    html: string,
    reportIDToName?: Record<string, string>,
    accountIDToName?: Record<string, string>,
    cacheVideoAttributes?: (videoSource: string, videoAttrs: string) => void,
): string {
    return parser.htmlToMarkdown(html, {
        reportIDToName: reportIDToName ?? ReportConnection.getAllReportsNameMap(),
        accountIDToName: accountIDToName ?? accountIDToNameMap,
        cacheVideoAttributes,
    });
}

function parseHtmlToText(
    html: string,
    reportIDToName?: Record<string, string>,
    accountIDToName?: Record<string, string>,
    cacheVideoAttributes?: (videoSource: string, videoAttrs: string) => void,
): string {
    return parser.htmlToText(html, {reportIDToName: reportIDToName ?? ReportConnection.getAllReportsNameMap(), accountIDToName: accountIDToName ?? accountIDToNameMap, cacheVideoAttributes});
}

export {parseHtmlToMarkdown, parseHtmlToText};
