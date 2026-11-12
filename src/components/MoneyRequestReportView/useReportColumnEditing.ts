/** Hides a column of a report's expense table from its column menu, and opens the report's column settings. */
import type {ColumnEditing} from '@components/Search/SortableColumnMenu';
import type {SearchColumnType, SearchCustomColumnIds} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import Navigation from '@libs/Navigation/Navigation';
import {getColumnHiding, getRequiredReportDetailsColumns, isReportDetailsCustomColumn} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/** @param columns The columns the table shows, in order. */
function useReportColumnEditing(reportID: string, columns: SearchColumnType[]): ColumnEditing {
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);

    const shownColumns = columns.filter((column): column is SearchCustomColumnIds => isReportDetailsCustomColumn(column));
    // The saved columns are account-wide, and the table drops some of them, e.g. Vendor on a workspace without vendors.
    const savedColumns = (reportDetailsColumns ?? []).filter(isReportDetailsCustomColumn);
    const {hidableColumns, getColumnsWithout} = getColumnHiding(shownColumns, savedColumns, getRequiredReportDetailsColumns());

    const hideColumn = (column: SearchColumnType) => {
        setReportDetailsColumns(getColumnsWithout(column), reportDetailsColumns);
    };

    const editColumns = () => {
        Navigation.navigate(ROUTES.REPORT_SETTINGS_COLUMNS.getRoute(reportID));
    };

    return {hidableColumns, hideColumn, editColumns};
}

export default useReportColumnEditing;
