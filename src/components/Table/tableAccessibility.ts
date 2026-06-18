import type {Role} from 'react-native';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type {SortOrder} from './middlewares/sorting';

/**
 * Table ARIA semantics (`role="table"`, `role="row"`, `role="cell"`, etc.) are only meaningful on web,
 * where React Native Web forwards `role`/`aria-*` to the underlying DOM attributes. On native they are
 * no-ops and would also strip the existing `button`/`presentation` roles that VoiceOver and TalkBack
 * rely on to announce interactive rows, so we only apply them on web.
 */
const isWeb = getPlatform() === CONST.PLATFORM.WEB;

/**
 * Table-related ARIA attributes. React Native Web forwards these to the DOM, and `View`/`Pressable`
 * accept them, but a few are not present in the RN typings, so we declare them explicitly here.
 */
type TableAccessibilityProps = {
    role?: Role;
    'aria-label'?: string;
    'aria-rowcount'?: number;
    'aria-colcount'?: number;
    'aria-rowindex'?: number;
    'aria-sort'?: 'ascending' | 'descending' | 'none';
};

/**
 * Whether table semantics should be applied. They are only useful on web and only in the wide (grid)
 * layout, since the narrow layout renders a single-column card list that already reads correctly.
 */
function shouldUseTableSemantics(shouldUseNarrowTableLayout: boolean): boolean {
    return isWeb && !shouldUseNarrowTableLayout;
}

/**
 * Props for the element that wraps the whole table (`role="table"`). The row count is set on the
 * container because FlashList virtualizes rows, so a screen reader cannot derive the total by walking
 * the DOM. Columns are never virtualized, so the header/cell association is left to positional order.
 */
function getTableContainerAccessibilityProps(enabled: boolean, label: string | undefined, rowCount: number, columnCount: number): TableAccessibilityProps {
    if (!enabled) {
        return {};
    }

    return {
        role: CONST.ROLE.TABLE,
        'aria-label': label,
        // +1 accounts for the header row, which is rendered as a sibling of the data rows.
        'aria-rowcount': rowCount + 1,
        'aria-colcount': columnCount,
    };
}

/** Props for a `role="rowgroup"` element (the table body wrapper). */
function getRowGroupAccessibilityProps(enabled: boolean): TableAccessibilityProps {
    if (!enabled) {
        return {};
    }

    return {role: CONST.ROLE.ROWGROUP};
}

/**
 * Props for a `role="row"` element. The header row is row 1, so data rows start at 2.
 * `aria-rowindex` is required because FlashList only renders the rows that are currently visible.
 */
function getRowAccessibilityProps(enabled: boolean, rowIndex: number, isHeader = false): TableAccessibilityProps {
    if (!enabled) {
        return {};
    }

    return {
        role: CONST.ROLE.ROW,
        'aria-rowindex': isHeader ? 1 : rowIndex + 2,
    };
}

/** Props for a `role="columnheader"` element, including the current sort state. */
function getColumnHeaderAccessibilityProps(enabled: boolean, isSortable: boolean, isActiveSortColumn: boolean, sortOrder: SortOrder): TableAccessibilityProps {
    if (!enabled) {
        return {};
    }

    const props: TableAccessibilityProps = {role: CONST.ROLE.COLUMNHEADER};

    if (isSortable) {
        props['aria-sort'] = isActiveSortColumn ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';
    }

    return props;
}

/** Props for a `role="cell"` element within a data row. */
function getCellAccessibilityProps(enabled: boolean): TableAccessibilityProps {
    if (!enabled) {
        return {};
    }

    return {role: CONST.ROLE.CELL};
}

export {shouldUseTableSemantics, getTableContainerAccessibilityProps, getRowGroupAccessibilityProps, getRowAccessibilityProps, getColumnHeaderAccessibilityProps, getCellAccessibilityProps};
