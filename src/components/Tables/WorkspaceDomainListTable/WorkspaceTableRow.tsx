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
        ></Table.Row>
    );
}
