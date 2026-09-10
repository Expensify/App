import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ExternalScrollLegendListTable, {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollLegendListTable';

import type * as LegendListModule from '@legendapp/list/react-native';

import React from 'react';
import {View} from 'react-native';

jest.mock('@legendapp/list/react-native', () => jest.requireActual<typeof LegendListModule>('../../../../node_modules/@legendapp/list/react-native.js'));

jest.mock('@components/ScrollView', () => {
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');

    function MockScrollView({children}: {children?: React.ReactNode}) {
        return <RNView>{children}</RNView>;
    }

    return {__esModule: true, default: MockScrollView};
});

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 200;
const TABLE_OFFSET_TOP = 80;
const HEADER_HEIGHT = 44;

describe('ExternalScrollLegendListTable virtualization', () => {
    it('refreshes mounted rows when their renderer changes without replacing the items', async () => {
        const items = [{id: 'row-0'}];
        const store = createScrollOffsetStore();
        const renderTable = (label: string) => (
            <ExternalScrollLegendListTable
                items={items}
                keyExtractor={(item) => item.id}
                getItemType={() => 'row'}
                renderItem={() => <View testID={label} />}
                renderHeader={() => null}
                estimatedRowHeight={ROW_HEIGHT}
                contentWidth={800}
                store={store}
                viewportHeight={VIEWPORT_HEIGHT}
                offsetTop={TABLE_OFFSET_TOP}
            />
        );
        const {rerender} = render(renderTable('unselected-row'));
        fireEvent(screen.getByTestId('external-scroll-legend-list-driver'), 'layout', {
            nativeEvent: {layout: {height: ROW_HEIGHT, width: 800, x: 0, y: 0}},
        });
        expect(await screen.findByTestId('unselected-row')).toBeTruthy();

        rerender(renderTable('selected-row'));

        expect(await screen.findByTestId('selected-row')).toBeTruthy();
        expect(screen.queryByTestId('unselected-row')).toBeNull();
    });

    it('keeps a bounded real LegendList window and moves it with parent scroll', async () => {
        const items = Array.from({length: 200}, (_value, index) => ({id: `row-${index}`}));
        const store = createScrollOffsetStore();
        const tableRef = React.createRef<{getRowPageOffset: (index: number) => {top: number; height: number} | undefined}>();

        render(
            <ExternalScrollLegendListTable
                ref={tableRef}
                items={items}
                keyExtractor={(item) => item.id}
                getItemType={() => 'row'}
                renderItem={(_item, index) => <View testID={`row-${index}`} />}
                renderHeader={() => <View testID="table-column-header" />}
                estimatedRowHeight={ROW_HEIGHT}
                contentWidth={800}
                store={store}
                viewportHeight={VIEWPORT_HEIGHT}
                offsetTop={TABLE_OFFSET_TOP}
            />,
        );

        fireEvent(screen.getByTestId('external-scroll-legend-list-driver'), 'layout', {
            nativeEvent: {layout: {height: 8000, width: 800, x: 0, y: 0}},
        });
        fireLayoutOnNearestAncestor(screen.getByTestId('table-column-header'), HEADER_HEIGHT);

        expect(await screen.findByTestId('row-0')).toBeTruthy();
        const firstWindow = screen.getAllByTestId(/^row-/);
        expect(firstWindow.length).toBeLessThan(items.length / 2);
        fireLayoutOnNearestAncestor(screen.getByTestId('row-0'), ROW_HEIGHT);
        expect(tableRef.current?.getRowPageOffset(0)).toEqual({top: TABLE_OFFSET_TOP + HEADER_HEIGHT, height: ROW_HEIGHT});

        act(() => store.setOffset(TABLE_OFFSET_TOP + ROW_HEIGHT * 100));

        expect(await screen.findByTestId('row-100')).toBeTruthy();
        expect(screen.queryByTestId('row-0')).toBeNull();
        expect(screen.getAllByTestId(/^row-/).length).toBeLessThan(items.length / 2);
    });
});

function fireLayoutOnNearestAncestor(instance: ReturnType<typeof screen.getByTestId>, height: number) {
    let layoutInstance = instance.parent;
    while (layoutInstance && typeof layoutInstance.props.onLayout !== 'function') {
        layoutInstance = layoutInstance.parent;
    }
    if (!layoutInstance) {
        throw new Error('Expected a measured LegendList container');
    }

    fireEvent(layoutInstance, 'layout', {nativeEvent: {layout: {height, width: 800, x: 0, y: 0}}});
}
