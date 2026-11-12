import type {ReportAttributesDerivedValue} from '@src/types/onyx';

import {deepEqual} from 'fast-equals';

/**
 * Returns the IDs of reports whose derived attributes changed between two snapshots, or `undefined` when none did.
 *
 * The derived value is rewritten with Onyx.set on every recompute, which re-creates entries even when nothing changed,
 * so entries are compared by value rather than by reference.
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

    return updatedReportIDs.length > 0 ? updatedReportIDs : undefined;
}

export default getReportAttributesUpdates;
