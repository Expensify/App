/**
 * Helpers for treating a table's link column as the link of each row: finding the single column whose cells hold
 * links, resolving each row's destination, and spotting the anchor that renders as plain text because of it.
 */
import type {TNode} from 'react-native-render-html';

import {getElementChildren} from './TableChildrenRenderer';

function getBodyRows(tableTnode: TNode): TNode[] {
    return getElementChildren(tableTnode)
        .filter((section) => section.tagName === 'tbody')
        .flatMap((section) => getElementChildren(section));
}

function getAnchors(node: TNode): TNode[] {
    if (node.tagName === 'a') {
        return [node];
    }
    return (node.children ?? []).flatMap(getAnchors);
}

/** The destination of a cell, defined only when the cell holds exactly one link and that link has an href. */
function getCellLinkURL(cell: TNode): string | undefined {
    const anchors = getAnchors(cell);
    if (anchors.length !== 1) {
        return undefined;
    }

    const href = anchors.at(0)?.attributes?.href ?? '';
    return href.length > 0 ? href : undefined;
}

/**
 * The single column whose cells hold links, or undefined when the table has no such column.
 *
 * Concierge expense tables link one cell per row — the merchant — and that link points at the row's transaction, so
 * the row as a whole can navigate there. Requiring the links to sit in exactly one column, each cell holding a single
 * link with an href, leaves every other table (no links, links spread across columns, or a cell whose several links
 * one row destination could not stand in for) rendering as a plain table with its own per-cell anchors.
 */
function getLinkColumnIndex(tableTnode: TNode): number | undefined {
    const columnsWithLinks = new Set<number>();
    let hasCellWithoutSingleLink = false;
    for (const row of getBodyRows(tableTnode)) {
        for (const [columnIndex, cell] of getElementChildren(row).entries()) {
            if (getAnchors(cell).length === 0) {
                continue;
            }
            columnsWithLinks.add(columnIndex);
            hasCellWithoutSingleLink = hasCellWithoutSingleLink || !getCellLinkURL(cell);
        }
    }

    if (hasCellWithoutSingleLink || columnsWithLinks.size !== 1) {
        return undefined;
    }

    return columnsWithLinks.values().next().value;
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
    return linkCell ? getCellLinkURL(linkCell) : undefined;
}

export {getLinkColumnIndex, getRowLinkURL, getTextContent, isLinkColumnAnchor};
