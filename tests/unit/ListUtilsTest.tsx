import type {ListItem} from '@components/SelectionList/types';

import {sortDefaultToTop} from '@libs/ListUtils';

import type {ThemeStyles} from '@styles/index';

import {View} from 'react-native';

describe('sortDefaultToTop', () => {
    const styles = {} as ThemeStyles;
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
