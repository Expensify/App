import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import TableChildrenRenderer from './TableChildrenRenderer';

/**
 * Renders an HTML <thead>/<tbody> by rendering its <tr> children directly into the table
 * container, without adding an extra wrapping view, so rows stack with no gaps.
 */
function TableSectionRenderer({tnode}: CustomRendererProps<TBlock>) {
    return <TableChildrenRenderer tnode={tnode} />;
}

export default TableSectionRenderer;
