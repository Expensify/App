import React from 'react';
import Table from '@components/Table';
import {WorkspaceRowData} from '.';

type WorkspaceRowProps = {
    item: WorkspaceRowData;

    rowIndex: number;
};

export default function WorkspaceRow({item, rowIndex}: WorkspaceRowProps) {
    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            onPress={item.action}
            skeletonReasonAttributes={{context: 'WorkspaceRow'}}
        >
            {({hovered}) => <View></View>}
        </Table.Row>
    );
}
