import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {View} from 'react-native';

import {useTableContext} from './TableContext';
import {getTableSemantics, TableSemanticsContext} from './TableSemantics';

/** Exposes `Table.Header` and `Table.Body` as a `role="table"`. It must wrap only those two — other chrome would be an invalid non-row child. */
function TableGrid({children}: ChildrenProps) {
    const styles = useThemeStyles();
    const {processedData, shouldUseNarrowTableLayout, title, isEmptyResult, originalDataLength, listProps, renderRowFooter} = useTableContext();
    const isTable = !shouldUseNarrowTableLayout;
    const semantics = getTableSemantics(processedData, renderRowFooter, isTable);
    const isBodyHidden = (isEmptyResult || !originalDataLength) && !listProps?.ListEmptyComponent && !listProps?.ListHeaderComponent;

    return (
        <TableSemanticsContext.Provider value={semantics}>
            <View
                style={isBodyHidden ? undefined : styles.flex1}
                role={isTable ? CONST.ROLE.TABLE : undefined}
                aria-label={isTable ? title : undefined}
                aria-rowcount={isTable ? semantics.rowCount : undefined}
            >
                {children}
            </View>
        </TableSemanticsContext.Provider>
    );
}

TableGrid.displayName = 'TableGrid';

export default TableGrid;
