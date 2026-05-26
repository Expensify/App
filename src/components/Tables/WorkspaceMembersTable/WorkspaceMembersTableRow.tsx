import Table from '@components/Table';
import {WorkspaceMemberRowData} from '.';

type WorkspaceMembersTableRowProps = {
    item: WorkspaceMemberRowData;

    rowIndex: number;

    shouldUseNarrowTableLayout: boolean;
};

export default function WorkspaceMembersTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceMembersTableRowProps) {
    return <Table.Row interactive={!item.disabled}>{(hovered) => <></>}</Table.Row>;
}
