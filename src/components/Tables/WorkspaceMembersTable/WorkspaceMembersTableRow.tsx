import React from 'react';
import {View} from 'react-native';
import Table from '@components/Table';
import {WorkspaceMemberRowData} from '.';

type WorkspaceMembersTableRowProps = {
    item: WorkspaceMemberRowData;

    rowIndex: number;

    shouldUseNarrowTableLayout: boolean;

    shouldShowCustomField1Column: boolean;

    shouldShowCustomField2Column: boolean;
};

export default function WorkspaceMembersTableRow({item, rowIndex, shouldShowCustomField1Column, shouldShowCustomField2Column, shouldUseNarrowTableLayout}: WorkspaceMembersTableRowProps) {
    return (
        <Table.Row
            rowIndex={rowIndex}
            interactive={!item.disabled}
            skeletonReasonAttributes={{context: 'WorkspaceMembersTableRow'}}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                dismissError: item.dismissError,
            }}
        >
            {(hovered) => (
                <>
                    <View></View>
                    <View></View>
                    <View></View>
                    {shouldShowCustomField1Column && <View></View>}
                    {shouldShowCustomField2Column && <View></View>}
                    <View></View>
                </>
            )}
        </Table.Row>
    );
}
