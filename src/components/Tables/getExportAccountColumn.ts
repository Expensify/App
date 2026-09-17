import type {TableColumn, TableData} from '@components/Table';

import type {ThemeStyles} from '@styles/index';
import {fontScale} from '@styles/typography';

type ExportAccountRowData = TableData & {
    /** The account the row's card exports to, as shown in the card details page's Accounting section */
    exportAccountTitle?: string;
};

/**
 * Builds the Export account column shared by the company cards and Expensify Card tables.
 */
function getExportAccountColumn<DataType extends ExportAccountRowData>(label: string, styles: ThemeStyles): TableColumn<'exportAccount', DataType> {
    return {
        key: 'exportAccount',
        label,
        sortable: true,
        styling: {
            // Cell text never wraps, so without minWidth: 0 the grid track sizes from the full account name instead of
            // its share and the row overflows the table.
            containerStyles: [styles.mnw0],
        },
        dynamicSizing: {
            getContentToMeasure: (item) => (item.exportAccountTitle ? [{text: item.exportAccountTitle, fontSize: fontScale.text}] : []),
        },
    };
}

export default getExportAccountColumn;
export type {ExportAccountRowData};
