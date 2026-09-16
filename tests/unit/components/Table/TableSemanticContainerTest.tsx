import {render, screen, within} from '@testing-library/react-native';

import TableBody from '@components/Table/TableBody';
import TableHeader from '@components/Table/TableHeader';
import TableSemanticContainer from '@components/Table/TableSemanticContainer';

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

const mockTrackedFilterBarMount = jest.fn();
const mockTrackedFilterBarUnmount = jest.fn();

function TrackedFilterBar() {
    React.useEffect(() => {
        mockTrackedFilterBarMount();
        return () => {
            mockTrackedFilterBarUnmount();
        };
    }, []);
    return <View testID="tracked-filter-bar" />;
}

function renderContainer(
    children: React.ReactNode,
    {
        isEnabled = true,
        rowCount = 3,
        rendersBodyWhenEmpty = false,
        onLayout,
    }: {isEnabled?: boolean; rowCount?: number; rendersBodyWhenEmpty?: boolean; onLayout?: React.ComponentProps<typeof TableSemanticContainer>['onLayout']} = {},
) {
    render(
        <TableSemanticContainer
            isEnabled={isEnabled}
            title="Members"
            rowCount={rowCount}
            columnCount={4}
            rendersBodyWhenEmpty={rendersBodyWhenEmpty}
            scrollWidth={undefined}
            onLayout={onLayout}
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

    it('keeps the measurement wrapper when semantics are disabled', () => {
        const onLayout = jest.fn();
        renderContainer([React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})], {isEnabled: false, onLayout});

        // A table with a synthetic page header owns its semantics elsewhere, but dynamic columns still need this
        // wrapper's layout measurement. No ARIA table semantics should leak onto the measurement-only wrapper.
        expect(screen.queryByLabelText('Members')).toBeNull();
        const measurementWrapper = screen.UNSAFE_getAllByType(View).find((view) => view.props.onLayout === onLayout);
        expect(measurementWrapper).toBeDefined();
        if (!measurementWrapper) {
            throw new Error('Measurement wrapper not found');
        }
        expect(measurementWrapper.props.role).toBeUndefined();
        expect(within(measurementWrapper).getByTestId('stub-header')).toBeTruthy();
        expect(within(measurementWrapper).getByTestId('stub-body')).toBeTruthy();
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
        mockTrackedFilterBarMount.mockClear();
        mockTrackedFilterBarUnmount.mockClear();

        // Passed as JSX siblings (no explicit keys) to mirror how tables render `Table.FilterBar`/`Table.Header`/`Table.Body`.
        const element = (rowCount: number) => (
            <TableSemanticContainer
                isEnabled
                title="Members"
                rowCount={rowCount}
                columnCount={4}
                rendersBodyWhenEmpty={false}
                scrollWidth={undefined}
                onLayout={undefined}
            >
                <TrackedFilterBar />
                <TableHeader />
                <TableBody />
            </TableSemanticContainer>
        );

        const {rerender} = render(element(3));
        expect(mockTrackedFilterBarMount).toHaveBeenCalledTimes(1);

        // Query stops matching -> table empties (wrapper skipped) -> then data returns (wrapper restored).
        rerender(element(0));
        rerender(element(3));

        // The filter bar instance survived both transitions, so its search-clearing cleanup never fired.
        expect(mockTrackedFilterBarUnmount).not.toHaveBeenCalled();
        expect(mockTrackedFilterBarMount).toHaveBeenCalledTimes(1);
    });
});
