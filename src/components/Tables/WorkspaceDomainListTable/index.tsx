import React, {useRef} from 'react';
import {ValueOf} from 'type-fest';
import Table, {TableColumn, TableHandle} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {AvatarSource} from '@libs/UserUtils';
import CONST from '@src/CONST';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type WorkspaceTableColumnKey = 'workspaces' | 'owner' | 'type' | 'actions';

type WorkspaceRowData = {
    keyForList: string;
    title: string;
    icon: AvatarSource;
    disabled: boolean;
    policyID: string;
    ownerAccountID: string;
    type: ValueOf<typeof CONST.POLICY.TYPE>;
    role: ValueOf<typeof CONST.POLICY.ROLE>;
    iconType: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_ICON;
    errors?: OnyxCommon.Errors | undefined;
    action: () => void;
    dismissError: () => void;
};

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
