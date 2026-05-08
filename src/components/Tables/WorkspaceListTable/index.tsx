import React, {useRef} from 'react';
import Table, {TableColumn, TableHandle} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type WorkspaceTableColumnKey = 'workspaces' | 'owner' | 'type' | 'actions';

type WorkspaceRowData = {};

type WorkspaceListTableProps = {};

export default function WorkspaceListTable({}: WorkspaceListTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const tableRef = useRef<TableHandle<WorkspaceRowData, WorkspaceTableColumnKey>>(null);

    const columns: Array<TableColumn<WorkspaceTableColumnKey>> = [
        {
            key: 'workspaces',
            label: translate('common.workspaces'),
        },
        {
            key: 'owner',
            label: translate('common.owner'),
        },
        {
            key: 'type',
            label: translate('workspace.common.workspaceType'),
        },
        {
            key: 'actions',
            label: '',
            styling: {
                containerStyles: [styles.justifyContentEnd, styles.pr3],
            },
        },
    ];

    return (
        <Table
            data={[]}
            columns={columns}
            renderItem={() => <></>}
            keyExtractor={() => <></>}
            compareItems={() => {}}
            isItemInSearch={() => {}}
            initialSortColumn="workspaces"
        >
            <>
                <Table.Header />
                <Table.Body />
            </>
        </Table>
    );
}
