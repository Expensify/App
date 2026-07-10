import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import type {Role} from 'react-native';

import type {SortOrder} from './middlewares/sorting';

/**
 * Table ARIA semantics (`role="table"`, `role="row"`, `role="cell"`, …) are only meaningful on web, where React Native
 * Web forwards `role`/`aria-*` straight to DOM attributes. On native they are not valid accessibility roles, and applying
 * them would strip the `button`/`presentation` roles that VoiceOver and TalkBack rely on to announce interactive rows.
 */
const isDOMPlatform = getPlatform() === CONST.PLATFORM.WEB;

/**
 * Table related ARIA attributes. React Native Web forwards all of these to the DOM, but only a subset is present in the
 * React Native typings, so the rest are declared here.
 */
type TableAccessibilityProps = {
    role?: Role;

    /* eslint-disable @typescript-eslint/naming-convention -- ARIA attributes are kebab-case by spec. */
    'aria-label'?: string;
    'aria-rowcount'?: number;
    'aria-colcount'?: number;
    'aria-rowindex'?: number;
    'aria-sort'?: 'ascending' | 'descending' | 'none';
    /* eslint-enable @typescript-eslint/naming-convention */
};

/**
 * Whether table semantics should be applied. They only help on web, and only in the wide layout: the narrow layout
 * renders a single column card list, which screen readers already announce correctly.
 */
function shouldUseTableSemantics(shouldUseNarrowTableLayout: boolean): boolean {
    return isDOMPlatform && !shouldUseNarrowTableLayout;
}

/**
 * Props for the element wrapping the whole table. The row count lives on the container because FlashList virtualizes
 * rows, so a screen reader cannot derive the total by walking the DOM. The column count only covers the data columns:
 * the selection checkbox renders in an extra leading grid column, but it is a control rather than a data cell.
 */
function getTableContainerAccessibilityProps(isEnabled: boolean, label: string | undefined, rowCount: number, columnCount: number): TableAccessibilityProps {
    if (!isEnabled) {
        return {};
    }

    return {
        role: CONST.ROLE.TABLE,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-label': label,
        // The header row is rendered as a sibling of the data rows, so it has to be counted separately.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-rowcount': rowCount + 1,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-colcount': columnCount,
    };
}

/** Props for the element grouping rows together, i.e. the table body wrapper. */
function getRowGroupAccessibilityProps(isEnabled: boolean): TableAccessibilityProps {
    if (!isEnabled) {
        return {};
    }

    return {role: CONST.ROLE.ROWGROUP};
}

/**
 * Props for a table row. `aria-rowindex` is 1-based and has to be set explicitly because FlashList only keeps the
 * visible rows in the DOM, so a screen reader would otherwise announce the position within the rendered window.
 * The header occupies index 1, so data rows start at 2.
 */
function getRowAccessibilityProps(isEnabled: boolean, rowIndex: number, isHeaderRow = false): TableAccessibilityProps {
    if (!isEnabled) {
        return {};
    }

    return {
        role: CONST.ROLE.ROW,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-rowindex': isHeaderRow ? 1 : rowIndex + 2,
    };
}

/** Props for a column header, including the direction the column is currently sorted in. */
function getColumnHeaderAccessibilityProps(isEnabled: boolean, isSortable: boolean, isActiveSortColumn: boolean, sortOrder: SortOrder): TableAccessibilityProps {
    if (!isEnabled) {
        return {};
    }

    const columnHeaderProps: TableAccessibilityProps = {role: CONST.ROLE.COLUMNHEADER};

    if (isSortable) {
        if (!isActiveSortColumn) {
            columnHeaderProps['aria-sort'] = 'none';
        } else {
            columnHeaderProps['aria-sort'] = sortOrder === 'asc' ? 'ascending' : 'descending';
        }
    }

    return columnHeaderProps;
}

/** Props for a single data cell of a table row. */
function getCellAccessibilityProps(isEnabled: boolean): TableAccessibilityProps {
    if (!isEnabled) {
        return {};
    }

    return {role: CONST.ROLE.CELL};
}

export {shouldUseTableSemantics, getTableContainerAccessibilityProps, getRowGroupAccessibilityProps, getRowAccessibilityProps, getColumnHeaderAccessibilityProps, getCellAccessibilityProps};
