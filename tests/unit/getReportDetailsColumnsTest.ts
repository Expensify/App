import getReportDetailsColumns from '@libs/getReportDetailsColumns';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import createMock from '../utils/createMock';

describe('getReportDetailsColumns', () => {
    it('uses the data-driven defaults for personal IOU reports despite saved workspace columns', () => {
        // Given a personal IOU report and an account-wide preference that only includes a workspace-specific field.
        const report = createMock<Report>({type: CONST.REPORT.TYPE.IOU, currency: CONST.CURRENCY.USD});
        const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.MCC];

        // When deriving visible columns with or without that preference.
        const columnsWithPreference = getReportDetailsColumns({report, policy: undefined, transactions: [], columns: savedColumns});
        const defaultColumns = getReportDetailsColumns({report, policy: undefined, transactions: []});

        // Then a personal IOU keeps its normal data-driven columns, because its view has no customization control.
        expect(columnsWithPreference).toEqual(defaultColumns);
        expect(columnsWithPreference).not.toContain(CONST.SEARCH.TABLE_COLUMNS.MCC);
    });

    it('uses saved workspace columns for unreported expenses being customized with a workspace policy', () => {
        // Given an unreported expense shown in a personal IOU thread with an effective workspace policy.
        const report = createMock<Report>({type: CONST.REPORT.TYPE.IOU, currency: CONST.CURRENCY.USD});
        const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.MCC];

        // When deriving the additional fields for the workspace-linked expense.
        const columns = getReportDetailsColumns({report, policy: undefined, transactions: [], columns: savedColumns, shouldUseWorkspaceColumnPreferences: true});

        // Then its fields follow the workspace selection instead of the personal IOU defaults.
        expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.MCC);
    });
});
