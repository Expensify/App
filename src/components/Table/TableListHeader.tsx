import type {PropsWithChildren} from 'react';

/**
 * Declarative slot for content that should scroll away with the table rows.
 *
 * The Table root extracts this marker and renders its children through FlashList's
 * ListHeaderComponent path, so the marker itself is never rendered inline.
 */
function TableListHeader({children}: PropsWithChildren) {
    return children;
}

TableListHeader.type = 'listHeader';

export default TableListHeader;
