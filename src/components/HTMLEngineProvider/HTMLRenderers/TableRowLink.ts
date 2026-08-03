import type {TNode} from 'react-native-render-html';

import {getElementChildren} from './TableChildrenRenderer';

function getBodyRows(tableTnode: TNode): TNode[] {
    return getElementChildren(tableTnode)
        .filter((section) => section.tagName === 'tbody')
        .flatMap((section) => getElementChildren(section));
}

function findAnchor(node: TNode): TNode | undefined {
    if (node.tagName === 'a') {
        return node;
    }
    return (node.children ?? []).reduce<TNode | undefined>((found, child) => found ?? findAnchor(child), undefined);
}

/**
 * The single column whose cells hold links, or undefined when the table has no such column.
 *
 * Concierge expense tables link one cell per row — the merchant — and that link points at the row's transaction, so
 * the row as a whole can navigate there. Requiring the links to sit in exactly one column leaves any other table
 * (no links, or links spread across columns) rendering as a plain table with its own per-cell anchors.
 */
function getLinkColumnIndex(tableTnode: TNode): number | undefined {
    const columnsWithLinks = new Set<number>();
    for (const row of getBodyRows(tableTnode)) {
        for (const [columnIndex, cell] of getElementChildren(row).entries()) {
            if (findAnchor(cell)) {
                columnsWithLinks.add(columnIndex);
            }
        }
    }

    return columnsWithLinks.size === 1 ? columnsWithLinks.values().next().value : undefined;
}

/**
 * Whether an anchor sits in the column whose links make the row navigable, in which case it renders as plain text
 * instead of a link. The anchor can be nested any number of levels below its cell.
 */
function isLinkColumnAnchor(anchorTnode: TNode, linkColumnIndex: number | undefined): boolean {
    if (linkColumnIndex === undefined) {
        return false;
    }

    let cell = anchorTnode.parent;
    while (cell && cell.tagName !== 'td') {
        // A cell is never nested in another row, so reaching one means this anchor is not inside a body cell.
        if (cell.tagName === 'tr') {
            return false;
        }
        cell = cell.parent;
    }

    const row = cell?.parent;
    if (!cell || row?.parent?.tagName !== 'tbody') {
        return false;
    }

    return getElementChildren(row).indexOf(cell) === linkColumnIndex;
}

/** The plain text of a node, used to render a link column's cell without any of the anchor's own styling. */
function getTextContent(node: TNode): string {
    if ('data' in node && typeof node.data === 'string') {
        return node.data;
    }
    return (node.children ?? []).map(getTextContent).join('');
}

/** The URL a row navigates to: the href of the link in the table's link column. */
function getRowLinkURL(rowTnode: TNode, linkColumnIndex: number | undefined): string | undefined {
    if (linkColumnIndex === undefined || rowTnode.parent?.tagName !== 'tbody') {
        return undefined;
    }

    const linkCell = getElementChildren(rowTnode).at(linkColumnIndex);
    return linkCell ? findAnchor(linkCell)?.attributes?.href : undefined;
}

export {getLinkColumnIndex, getRowLinkURL, getTextContent, isLinkColumnAnchor};
