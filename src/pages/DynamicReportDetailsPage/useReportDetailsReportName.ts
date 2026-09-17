import {useDerivedReportNamesByReportIDs} from '@hooks/useReportAttributes';

import Parser from '@libs/Parser';
import {getReportNameFromNames} from '@libs/ReportAttributesUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getReportForHeader, isGroupChat} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Resolves the title shown on the details page (and the derived name of the parent report) from the REPORT_ATTRIBUTES
 * derived value. Owns the derived-value subscription so only the name rows re-render when report names change.
 */
function useReportDetailsReportName(report: Report, parentReport: OnyxEntry<Report>, parentReportAction: OnyxEntry<ReportAction>) {
    const reportForHeader = getReportForHeader(report, parentReport);
    const derivedReportNames = useDerivedReportNamesByReportIDs([report?.parentReportID, reportForHeader?.reportID]);
    const derivedParentReportName = getReportNameFromNames(derivedReportNames, report?.parentReportID);
    const derivedHeaderReportName = getReportNameFromNames(derivedReportNames, reportForHeader?.reportID);

    const shouldParseFullTitle = parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat(report);
    const rawReportName = getReportName(reportForHeader, derivedHeaderReportName);
    const reportName = shouldParseFullTitle ? Parser.htmlToText(rawReportName) : rawReportName;

    return {reportName, derivedParentReportName};
}

export default useReportDetailsReportName;
