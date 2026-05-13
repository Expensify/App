import type {ListRenderItemInfo} from '@shopify/flash-list';
import Table, {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table/';
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
    const {translate, localeCompare} = useLocalize();

    const categoryTableColumns: Array<TableColumn<WorkspaceCategoryTableColumnKey>> = [
        {key: 'name', label: translate('common.name')},
        {key: 'glCode', label: translate('workspace.categories.glCode')},
        ...(shouldShowApproverColumn ? [{key: 'approver', label: translate('common.approver')} as const] : []),
        {key: 'enabled', label: translate('common.enabled')},
        {key: 'actions', label: ''},
    ];

    const compareItems: CompareItemsCallback<WorkspaceCategoryTableRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'approver') {
            const approver1 = item1.approverDisplayName || '';
            const approver2 = item2.approverDisplayName || '';
            return localeCompare(approver1, approver2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'enabled') {
            return (item1.isDisabled === item2.isDisabled ? 0 : item1.isDisabled ? 1 : -1) * orderMultiplier;
        }

        return localeCompare(item1.name, item2.name) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceCategoryTableRowData> = (item, searchValue) => {
        const searchLower = searchValue.toLowerCase();
        return item.name.toLowerCase().includes(searchLower) || item.glCode.toLowerCase().includes(searchLower);
    };

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
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderCategoryItem}
        >
            <Table.Header />
            <Table.Body />
        </Table>
    );
}
