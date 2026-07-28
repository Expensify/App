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

function renderContainer(children: React.ReactNode, isEnabled = true) {
    render(
        <TableSemanticContainer
            isEnabled={isEnabled}
            title="Members"
            rowCount={3}
            columnCount={4}
        >
            {children}
        </TableSemanticContainer>,
    );
}

describe('TableSemanticContainer', () => {
    it('does not add a table wrapper when semantics are disabled, but still renders the header/body', () => {
        renderContainer([React.createElement(TableHeader, {key: 'h'}), React.createElement(TableBody, {key: 'b'})], false);

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
});
