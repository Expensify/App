import type {ListRenderItemInfo} from '@shopify/flash-list';
import Table, {TableColumn} from '@components/Table/';
import useLocalize from '@hooks/useLocalize';
import {AvatarSource} from '@libs/UserAvatarUtils';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import WorkspaceCategoriesTableRow from './WorkspaceCategoriesTableRow';

export type WorkspaceCategoryTableColumnKey = 'name' | 'glCode' | 'approver' | 'enabled' | 'actions';

export type WorkspaceCategoryTableRowData = {
    name: string;
    glCode: string;
    approverAvatar?: AvatarSource;
    approverDisplayName?: string;
    isDisabled: boolean;
    errors: OnyxCommon.Errors;
    pendingAction: OnyxCommon.PendingAction;
};

type WorkspaceCategoriesTableProps = {
    categories: WorkspaceCategoryTableRowData[];

    shouldShowApproverColumn: boolean;
};

export default function WorkspaceCategoriesTable({categories, shouldShowApproverColumn}: WorkspaceCategoriesTableProps) {
    const {translate} = useLocalize();

    const categoryTableColumns: Array<TableColumn<WorkspaceCategoryTableColumnKey>> = [
        {key: 'name', label: translate('common.name')},
        {key: 'glCode', label: translate('workspace.categories.glCode')},
        ...(shouldShowApproverColumn ? [{key: 'approver', label: translate('common.approver')} as const] : []),
        {key: 'enabled', label: translate('common.enabled')},
        {key: 'actions', label: ''},
    ];

    const renderCategoryItem = ({item, index}: ListRenderItemInfo<WorkspaceCategoryTableRowData>) => (
        <WorkspaceCategoriesTableRow
            item={item}
            rowIndex={index}
        />
    );

    return (
        <Table
            data={categories}
            columns={categoryTableColumns}
            renderItem={renderCategoryItem}
        >
            <Table.Header />
            <Table.Body />
        </Table>
    );
}
