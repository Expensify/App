import Table from '@components/Table';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {DomainAdminGroupHeaderRowData} from '.';

type DomainAdminsTableGroupHeaderRowProps = {
    /** Data about the group header */
    item: DomainAdminGroupHeaderRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;
};

export default function DomainAdminsTableGroupHeaderRow({item, rowIndex}: DomainAdminsTableGroupHeaderRowProps) {
    const styles = useThemeStyles();

    return (
        <Table.Row
            interactive={false}
            rowIndex={rowIndex}
            accessibilityLabel={item.label}
        >
            <Text style={styles.textStrong}>{item.label}</Text>
        </Table.Row>
    );
}
