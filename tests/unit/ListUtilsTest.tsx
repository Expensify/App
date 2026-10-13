import type {ListItem} from '@components/SelectionList/types';

import {sortDefaultToTop, withClearRow} from '@libs/ListUtils';

import type {ThemeStyles} from '@styles/index';

import {View} from 'react-native';

import createMock from '../utils/createMock';

describe('sortDefaultToTop', () => {
    const styles = createMock<ThemeStyles>({});
    const items: ListItem[] = [
        {
            keyForList: 'roomA',
            text: 'Room A',
        },
        {
            keyForList: 'roomB',
            text: 'Default - Room B',
        },
        {
            keyForList: 'roomC',
            text: 'Room C',
        },
    ];

    it('sorts default option at the top', () => {
        expect(sortDefaultToTop(items, (item) => item.keyForList === 'roomB', styles)).toStrictEqual([
            {
                keyForList: 'roomB',
                text: 'Default - Room B',
                footerContent: <View style={[styles.mh5, styles.mv1, styles.borderBottom]} />,
            },
            {
                keyForList: 'roomA',
                text: 'Room A',
                footerContent: undefined,
            },
            {
                keyForList: 'roomC',
                text: 'Room C',
                footerContent: undefined,
            },
        ]);
    });

    it('does not add footer content if the default option is the only option', () => {
        expect(
            sortDefaultToTop(
                [
                    {
                        keyForList: 'roomB',
                        text: 'Default - Room B',
                    },
                ],
                (item) => item.keyForList === 'roomB',
                styles,
            ),
        ).toStrictEqual([
            {
                keyForList: 'roomB',
                text: 'Default - Room B',
                footerContent: undefined,
            },
        ]);
    });
});

describe('withClearRow', () => {
    const clearRow: ListItem = {keyForList: 'none', text: 'None'};
    const vendors: ListItem[] = [
        {keyForList: 'v1', text: 'Vendor 1', isSelected: true},
        {keyForList: 'v2', text: 'Vendor 2'},
    ];

    it('puts the clear row below the selection when it is pinned to the top', () => {
        // Given a list whose first row is the pinned selection
        // When the clear row is inserted with isSelectionPinnedToTop = true
        // Then it sits just below the pinned selection, not above it
        expect(withClearRow(vendors, clearRow, true)).toStrictEqual([
            {keyForList: 'v1', text: 'Vendor 1', isSelected: true},
            {keyForList: 'none', text: 'None'},
            {keyForList: 'v2', text: 'Vendor 2'},
        ]);
    });

    it('puts the clear row first when nothing is pinned to the top', () => {
        // Given a short/unpinned list
        // When the clear row is inserted with isSelectionPinnedToTop = false
        // Then it stays at the very top (natural order is retained below it)
        expect(withClearRow(vendors, clearRow, false)).toStrictEqual([{keyForList: 'none', text: 'None'}, ...vendors]);
    });
});
