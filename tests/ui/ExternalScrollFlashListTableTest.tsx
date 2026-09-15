import {render, screen} from '@testing-library/react-native';

import ExternalScrollFlashListTable, {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollFlashListTable';

import type {FlashListProps} from '@shopify/flash-list';

import React from 'react';
import {View} from 'react-native';

jest.mock('@shopify/flash-list', () => ({
    FlashList: ({renderScrollComponent: ScrollComponent, overrideProps, ListHeaderComponent}: FlashListProps<string>) => {
        const {isValidElement} = jest.requireActual<typeof React>('react');
        if (!ScrollComponent || !isValidElement(ListHeaderComponent)) {
            return null;
        }
        return <ScrollComponent {...overrideProps}>{ListHeaderComponent}</ScrollComponent>;
    },
}));

const renderHeader = () => <View testID="table-header" />;

describe('ExternalScrollFlashListTable', () => {
    it('gives the replacement scroll container the full table width, including after resize', () => {
        const store = createScrollOffsetStore();
        const renderTable = (contentWidth: number) => (
            <ExternalScrollFlashListTable
                items={['first', 'second']}
                keyExtractor={(item) => item}
                getItemType={() => 'transaction'}
                renderItem={() => null}
                renderHeader={renderHeader}
                estimatedRowHeight={75}
                contentWidth={contentWidth}
                store={store}
                viewportHeight={600}
                offsetTop={0}
            />
        );
        const {rerender} = render(renderTable(1200));

        // This View replaces FlashList's ScrollView. Its cross-axis measurement controls column widths.
        expect(screen.getByTestId('external-scroll-driver')).toHaveStyle({width: 1200});

        rerender(renderTable(1400));
        expect(screen.getByTestId('external-scroll-driver')).toHaveStyle({width: 1400});
    });
});
