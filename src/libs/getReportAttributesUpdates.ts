import type {ReportAttributesDerivedValue} from '@src/types/onyx';

import {deepEqual} from 'fast-equals';

/**
 * Returns the IDs of reports whose derived attributes changed between two snapshots (including entries that were
 * removed), or `undefined` when none did.
 *
 * Entries are compared by value because Onyx.set copies the derived value, so unchanged entries arrive as new objects.
 */
function getReportAttributesUpdates(
    reportAttributes: ReportAttributesDerivedValue['reports'] | undefined,
    prevReportAttributes: ReportAttributesDerivedValue['reports'] | undefined,
): string[] | undefined {
    if (!reportAttributes || reportAttributes === prevReportAttributes) {
        return undefined;
    }

    const updatedReportIDs: string[] = [];
    for (const [reportID, attributes] of Object.entries(reportAttributes)) {
        const previousAttributes = prevReportAttributes?.[reportID];
        if (previousAttributes === attributes || deepEqual(previousAttributes, attributes)) {
            continue;
        }
        updatedReportIDs.push(reportID);
    }
    for (const reportID of Object.keys(prevReportAttributes ?? {})) {
        if (reportID in reportAttributes) {
            continue;
        }
        updatedReportIDs.push(reportID);
    }

    return updatedReportIDs.length > 0 ? updatedReportIDs : undefined;
}

export default getReportAttributesUpdates;
