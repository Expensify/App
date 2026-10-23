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
        // Given the replacement scroll container supplies the cross-axis measurement used by table columns
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
        // When a wide table mounts inside the external-scroll layout
        const {rerender} = render(renderTable(1200));

        // Then columns must receive the full content width rather than collapsing to the viewport
        expect(screen.getByTestId('external-scroll-driver')).toHaveStyle({width: 1200});

        // When resizing changes the table's available content width
        rerender(renderTable(1400));
        // Then the measurement must update so columns do not retain their previous widths
        expect(screen.getByTestId('external-scroll-driver')).toHaveStyle({width: 1400});
    });
});
