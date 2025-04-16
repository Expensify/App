import {generateReportName} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

/**
 * This derived value is used to get the report attributes for the report.
 * Dependency on ONYXKEYS.PERSONAL_DETAILS_LIST is to ensure that the report attributes are generated after the personal details are available.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.PERSONAL_DETAILS_LIST, ONYXKEYS.NVP_PREFERRED_LOCALE],
    compute: ([reports, personalDetails, preferredLocale], {currentValue, sourceValues}) => {
        if (!reports || !personalDetails || !preferredLocale) {
            return {
                reports: {},
                locale: null,
            };
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        const reportAttributes = Object.values(reportUpdates ?? reports).reduce<ReportAttributesDerivedValue['reports']>(
            (acc, report) => {
                if (!report) {
                    return acc;
                }

                acc[report.reportID] = {
                    reportName: generateReportName(report),
                };

                return acc;
            },
            reportUpdates && currentValue ? currentValue.reports : {},
        );

        return {
            reports: reportAttributes,
            locale: preferredLocale,
        };
    },
});
