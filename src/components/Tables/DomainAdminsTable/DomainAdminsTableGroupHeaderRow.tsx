import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
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

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function DomainAdminsTableGroupHeaderRow({item, rowIndex, shouldUseNarrowTableLayout}: DomainAdminsTableGroupHeaderRowProps) {
    const styles = useThemeStyles();

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    return (
        <Table.Row
            interactive={false}
            rowIndex={rowIndex}
            accessibilityLabel={item.label}
        >
            <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                <Text style={styles.textStrong}>{item.label}</Text>
            </View>
        </Table.Row>
    );
}
