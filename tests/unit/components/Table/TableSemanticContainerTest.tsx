import {render, screen, within} from '@testing-library/react-native';

import TableBody from '@components/Table/TableBody';
import TableHeader from '@components/Table/TableHeader';
import TableSemanticContainer, {TableSemanticRowOwner} from '@components/Table/TableSemanticContainer';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

// `TableSemanticContainer` only reads styles from the theme hook, so stub it to a plain object (no provider needed).
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({flex1: {flex: 1}, mnh0: {minHeight: 0}}),
}));

// Stub the header/body to identifiable views so the grouping can be asserted without pulling in their dependency trees.
jest.mock('@components/Table/TableHeader', () => {
    const {createElement} = jest.requireActual<{createElement: typeof React.createElement}>('react');
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');
    return {__esModule: true, default: () => createElement(RNView, {testID: 'stub-header'})};
});
jest.mock('@components/Table/TableBody', () => {
    const {createElement} = jest.requireActual<{createElement: typeof React.createElement}>('react');
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');
    return {__esModule: true, default: () => createElement(RNView, {testID: 'stub-body'})};
});

function renderContainer(
    children: React.ReactNode,
    {isEnabled = true, rowCount = 3, rendersBodyWhenEmpty = false}: {isEnabled?: boolean; rowCount?: number; rendersBodyWhenEmpty?: boolean} = {},
) {
    render(
        <TableSemanticContainer
            isEnabled={isEnabled}
            title="Members"
            rowCount={rowCount}
            columnCount={4}
            rendersBodyWhenEmpty={rendersBodyWhenEmpty}
        >
            {children}
        </TableSemanticContainer>,
    );
}

describe('TableSemanticContainer', () => {
    it('does not add a table wrapper when semantics are disabled, but still renders the header/body', () => {
        renderContainer([React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})], {isEnabled: false});

        // The `role="table"` container is labelled by the title, so its absence means no wrapper was added.
        expect(screen.queryByLabelText('Members')).toBeNull();
        expect(screen.getByTestId('stub-header')).toBeTruthy();
        expect(screen.getByTestId('stub-body')).toBeTruthy();
    });

    it('wraps the header/body run in a single role="table" container carrying the counts', () => {
        renderContainer([React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})]);

        const table = screen.getByLabelText('Members');
        expect(table.props.role).toBe(CONST.ROLE.TABLE);
        // rowCount (3) + 1 for the header row.
        expect(table.props['aria-rowcount']).toBe(4);
        expect(table.props['aria-colcount']).toBe(4);

        // Both the header and the body live inside that single container.
        expect(within(table).getByTestId('stub-header')).toBeTruthy();
        expect(within(table).getByTestId('stub-body')).toBeTruthy();
    });

    it('keeps non-header/body children outside the table container', () => {
        const filterBar = React.createElement(View, {key: 'f', testID: 'filter-bar'});
        renderContainer([filterBar, React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})]);

        const table = screen.getByLabelText('Members');

        // The filter bar is rendered, but not inside the table container.
        expect(screen.getByTestId('filter-bar')).toBeTruthy();
        expect(within(table).queryByTestId('filter-bar')).toBeNull();
        expect(within(table).getByTestId('stub-header')).toBeTruthy();
    });

    it('places a page-header row owner after controls without affecting layout', () => {
        const ownedRowIDs = ['members-header-row', 'members-data-row-0', 'members-data-row-1', 'members-data-row-2'];
        render(
            <View testID="semantic-order">
                <View testID="page-controls" />
                <TableSemanticRowOwner
                    isEnabled
                    title="Members"
                    rowCount={3}
                    columnCount={4}
                    hasHeaderRow
                    ownedRowIDs={ownedRowIDs}
                />
                <View testID="virtualized-rows" />
            </View>,
        );

        const table = screen.getByLabelText('Members');
        expect(table.props.style).toBeUndefined();
        expect(table.props['aria-rowcount']).toBe(4);
        expect(table.props['aria-colcount']).toBe(4);
        const [rowGroup] = table.children;
        expect(rowGroup).toBeDefined();
        expect(typeof rowGroup).not.toBe('string');
        if (!rowGroup || typeof rowGroup === 'string') {
            throw new Error('Expected the semantic table to contain a rowgroup');
        }
        expect(rowGroup.props.role).toBe(CONST.ROLE.ROWGROUP);
        expect(rowGroup.props['aria-owns']).toBe(ownedRowIDs.join(' '));

        const pageControls = screen.getByTestId('page-controls');
        const virtualizedRows = screen.getByTestId('virtualized-rows');
        expect(within(table).queryByTestId('page-controls')).toBeNull();
        expect(within(table).queryByTestId('virtualized-rows')).toBeNull();
        expect(table.parent).toBe(pageControls.parent);
        expect(table.parent).toBe(virtualizedRows.parent);
        const siblingOrder = table.parent?.children ?? [];
        expect(siblingOrder.indexOf(pageControls)).toBeLessThan(siblingOrder.indexOf(table));
        expect(siblingOrder.indexOf(table)).toBeLessThan(siblingOrder.indexOf(virtualizedRows));
    });

    it('does not reserve a header row when a page-header table has no active column header', () => {
        const ownedRowIDs = ['members-data-row-0', 'members-data-row-1', 'members-data-row-2'];
        render(
            <TableSemanticRowOwner
                isEnabled
                title="Members"
                rowCount={3}
                columnCount={4}
                hasHeaderRow={false}
                ownedRowIDs={ownedRowIDs}
            />,
        );

        const table = screen.getByLabelText('Members');
        const [rowGroup] = table.children;
        expect(table.props['aria-rowcount']).toBe(3);
        expect(typeof rowGroup).not.toBe('string');
        if (!rowGroup || typeof rowGroup === 'string') {
            throw new Error('Expected the semantic table to contain a rowgroup');
        }
        expect(rowGroup.props['aria-owns']).toBe(ownedRowIDs.join(' '));
    });

    it('does not expose an empty page-header row owner', () => {
        render(
            <View>
                <View testID="page-controls" />
                <TableSemanticRowOwner
                    isEnabled
                    title="Members"
                    rowCount={0}
                    columnCount={4}
                    hasHeaderRow
                    ownedRowIDs={[]}
                />
                <View testID="virtualized-rows" />
            </View>,
        );

        expect(screen.queryByLabelText('Members')).toBeNull();
        expect(screen.getByTestId('page-controls')).toBeTruthy();
        expect(screen.getByTestId('virtualized-rows')).toBeTruthy();
    });

    it('skips the table wrapper for an empty table when the body renders nothing', () => {
        renderContainer([React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})], {rowCount: 0});

        // No `role="table"` wrapper, so the empty state keeps the full available height (no extra flex:1 sibling).
        expect(screen.queryByLabelText('Members')).toBeNull();
        expect(screen.getByTestId('stub-header')).toBeTruthy();
        expect(screen.getByTestId('stub-body')).toBeTruthy();
    });

    it('keeps the table wrapper for an empty table when the body still renders', () => {
        renderContainer([React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})], {rowCount: 0, rendersBodyWhenEmpty: true});

        // The body still carries role="rowgroup" here, so the enclosing role="table" must be preserved.
        const table = screen.getByLabelText('Members');
        expect(table.props.role).toBe(CONST.ROLE.TABLE);
        expect(within(table).getByTestId('stub-body')).toBeTruthy();
    });

    it('does not remount surrounding children when crossing the empty/non-empty boundary', () => {
        // Guards the regression where the empty branch returned raw `children` (implicit keys) while the wrapped branch
        // returns `React.Children.toArray(children)` (`.0`, `.1`, …). The key mismatch remounts surrounding children like
        // `Table.FilterBar`, whose unmount cleanup wipes the active search string the moment a query stops matching.
        let mountCount = 0;
        let unmountCount = 0;
        function TrackedFilterBar() {
            React.useEffect(() => {
                mountCount += 1;
                return () => {
                    unmountCount += 1;
                };
            }, []);
            return <View testID="tracked-filter-bar" />;
        }

        // Passed as JSX siblings (no explicit keys) to mirror how tables render `Table.FilterBar`/`Table.Header`/`Table.Body`.
        const element = (rowCount: number) => (
            <TableSemanticContainer
                isEnabled
                title="Members"
                rowCount={rowCount}
                columnCount={4}
                rendersBodyWhenEmpty={false}
            >
                <TrackedFilterBar />
                <TableHeader />
                <TableBody />
            </TableSemanticContainer>
        );

        const {rerender} = render(element(3));
        expect(mountCount).toBe(1);

        // Query stops matching -> table empties (wrapper skipped) -> then data returns (wrapper restored).
        rerender(element(0));
        rerender(element(3));

        // The filter bar instance survived both transitions, so its search-clearing cleanup never fired.
        expect(unmountCount).toBe(0);
        expect(mountCount).toBe(1);
    });
});
