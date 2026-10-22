import type {ListItem} from '@components/SelectionList/types';

import {clearTrailingDefaultSeparator, sortDefaultToTop, withClearRow} from '@libs/ListUtils';

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

describe('clearTrailingDefaultSeparator', () => {
    const separator = <View />;
    const isDefault = (item: ListItem) => item.keyForList === 'default';

    it('removes the separator when the default row is last in the list', () => {
        // Given a list whose last row is the default account carrying a baked-in separator (e.g. search left only the default result)
        const items: ListItem[] = [
            {keyForList: 'other', text: 'Other'},
            {keyForList: 'default', text: 'Default', footerContent: separator},
        ];

        // When the trailing default separator is cleared
        // Then the default row keeps its place but loses the dangling separator below it
        expect(clearTrailingDefaultSeparator(items, isDefault)).toStrictEqual([
            {keyForList: 'other', text: 'Other'},
            {keyForList: 'default', text: 'Default', footerContent: undefined},
        ]);
    });

    it('keeps the separator when the default row is not last', () => {
        // Given a list where the default row (with separator) is followed by other rows
        const items: ListItem[] = [
            {keyForList: 'default', text: 'Default', footerContent: separator},
            {keyForList: 'other', text: 'Other'},
        ];

        // When the trailing default separator is cleared
        // Then nothing changes because the separator still divides the default row from the rows below it
        expect(clearTrailingDefaultSeparator(items, isDefault)).toStrictEqual(items);
    });

    it('does nothing when the last row is not the default', () => {
        // Given a list whose last row is a non-default account without a separator
        const items: ListItem[] = [
            {keyForList: 'default', text: 'Default', footerContent: separator},
            {keyForList: 'other', text: 'Other'},
        ];

        // When the trailing default separator is cleared
        // Then the list is returned untouched
        expect(clearTrailingDefaultSeparator(items, isDefault)).toStrictEqual(items);
    });

    it('does nothing for an empty list', () => {
        // Given an empty list
        // When the trailing default separator is cleared
        // Then it stays empty without throwing
        expect(clearTrailingDefaultSeparator([], isDefault)).toStrictEqual([]);
    });
});
