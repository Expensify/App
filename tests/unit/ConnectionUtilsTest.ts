import {getSageIntacctExportDate} from '@libs/ConnectionUtils';

import CONST from '@src/CONST';

describe('getSageIntacctExportDate', () => {
    it.each(Object.values(CONST.SAGE_INTACCT_EXPORT_DATE))('returns %s unchanged', (exportDate) => {
        // Given an export date the picker already offers
        // When it is resolved
        // Then it comes back untouched, so the matching row stays selected
        expect(getSageIntacctExportDate(exportDate)).toBe(exportDate);
    });

    it('resolves the legacy EXPORTED onto REPORT_EXPORTED', () => {
        // Given a workspace configured before NewDot aligned with the backend, so it still holds the legacy value
        // When it is resolved
        // Then it maps onto the equivalent current value rather than matching no row at all
        expect(getSageIntacctExportDate(CONST.SAGE_INTACCT_EXPORT_DATE_LEGACY.EXPORTED)).toBe(CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_EXPORTED);
    });

    it('resolves the legacy SUBMITTED onto REPORT_SUBMITTED', () => {
        // Given a workspace still holding the other legacy value
        // When it is resolved
        // Then it maps onto the equivalent current value
        expect(getSageIntacctExportDate(CONST.SAGE_INTACCT_EXPORT_DATE_LEGACY.SUBMITTED)).toBe(CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_SUBMITTED);
    });

    it('returns undefined when no export date is configured', () => {
        // Given a connection with no export date set
        // When it is resolved
        // Then nothing is returned, so callers render a blank value instead of guessing at one
        expect(getSageIntacctExportDate(undefined)).toBeUndefined();
    });

    it('returns undefined for a value it does not recognize', () => {
        // Given a value the backend sends that NewDot has no row or translation for
        // When it is resolved
        // Then nothing is returned, so the page renders blank rather than throwing on a missing translation key
        expect(getSageIntacctExportDate('SOME_FUTURE_VALUE')).toBeUndefined();
    });
});
