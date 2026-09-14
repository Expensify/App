import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import {useTableContext} from '@components/Table/TableContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {DomainAdminGroupHeaderRowData} from '.';

type DomainAdminsTableGroupHeaderRowProps = {
    /** Data about the group header */
    item: DomainAdminGroupHeaderRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;
};

export default function DomainAdminsTableGroupHeaderRow({item, rowIndex}: DomainAdminsTableGroupHeaderRowProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowTableLayout} = useTableContext<DomainAdminGroupHeaderRowData>();

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    return (
        <Table.Row
            isGroupHeader
            interactive={false}
            rowIndex={rowIndex}
            accessibilityLabel={item.label}
        >
            <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                <Text style={[styles.textMicroBoldSupporting, styles.lh14]}>{item.label}</Text>
            </View>
        </Table.Row>
    );
}
