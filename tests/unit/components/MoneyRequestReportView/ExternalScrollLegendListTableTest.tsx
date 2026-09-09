import {act, fireEvent, render} from '@testing-library/react-native';

import ExternalScrollLegendListTable, {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollLegendListTable';

import type * as LegendListModule from '@legendapp/list/react-native';
import type {ScrollViewProps} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type TestItem = {id: string};

const mockGetState = jest.fn();
let mockLegendListProps: LegendListModule.LegendListProps<TestItem> | undefined;

jest.mock('@legendapp/list/react-native', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const LegendListActual = jest.requireActual<typeof LegendListModule>('@legendapp/list/react-native');

    return {
        ...LegendListActual,
        LegendList: ReactLocal.forwardRef((props: LegendListModule.LegendListProps<TestItem>, ref: React.Ref<{getState: typeof mockGetState}>) => {
            mockLegendListProps = props;
            ReactLocal.useImperativeHandle(ref, () => ({getState: mockGetState}));
            return null;
        }),
    };
});

jest.mock('@components/ScrollView', () => {
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');

    function MockScrollView({children}: {children?: React.ReactNode}) {
        return <RNView>{children}</RNView>;
    }

    return {__esModule: true, default: MockScrollView};
});

describe('ExternalScrollLegendListTable', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLegendListProps = undefined;
    });

    it('derives unmounted row page positions from LegendList state and its measured header', () => {
        const tableRef = React.createRef<{getRowPageOffset: (index: number) => {top: number; height: number} | undefined}>();
        mockGetState.mockReturnValue({
            positionAtIndex: (index: number) => index * 40,
            sizeAtIndex: (index: number) => (index === 2 ? 36 : undefined),
        });

        render(
            <ExternalScrollLegendListTable
                ref={tableRef}
                items={[{id: 'one'}, {id: 'two'}, {id: 'three'}]}
                keyExtractor={(item) => item.id}
                getItemType={() => 'row'}
                renderItem={() => null}
                renderHeader={() => <View />}
                estimatedRowHeight={48}
                contentWidth={800}
                store={createScrollOffsetStore()}
                viewportHeight={600}
                offsetTop={120}
            />,
        );

        act(() => mockLegendListProps?.onMetricsChange?.({headerSize: 52, footerSize: 0}));

        expect(tableRef.current?.getRowPageOffset(2)).toEqual({top: 252, height: 36});
        expect(tableRef.current?.getRowPageOffset(1)).toEqual({top: 212, height: 48});
    });

    it('drives the nested render window from the parent offset and substitutes the parent viewport height', () => {
        const store = createScrollOffsetStore();
        render(
            <ExternalScrollLegendListTable
                items={[{id: 'one'}]}
                keyExtractor={(item) => item.id}
                getItemType={() => 'row'}
                renderItem={() => null}
                renderHeader={() => <View />}
                estimatedRowHeight={48}
                contentWidth={800}
                store={store}
                viewportHeight={600}
                offsetTop={120}
            />,
        );

        const renderScrollComponent = mockLegendListProps?.renderScrollComponent;
        if (!renderScrollComponent) {
            throw new Error('Expected the external LegendList scroll driver');
        }

        const onScroll = jest.fn();
        const onLayout = jest.fn();
        const driver = renderScrollComponent({onScroll, onLayout} as ScrollViewProps);
        const renderedDriver = render(driver);

        expect(onScroll).toHaveBeenLastCalledWith(expect.objectContaining({nativeEvent: {contentOffset: {x: 0, y: 0}}}));

        act(() => store.setOffset(260));
        expect(onScroll).toHaveBeenLastCalledWith(expect.objectContaining({nativeEvent: {contentOffset: {x: 0, y: 140}}}));

        fireEvent(renderedDriver.UNSAFE_getByType(View), 'layout', {nativeEvent: {layout: {height: 1, width: 800, x: 0, y: 0}}});
        expect(onLayout).toHaveBeenLastCalledWith(expect.objectContaining({nativeEvent: {layout: {height: 600, width: 800, x: 0, y: 0}}}));
    });
});
