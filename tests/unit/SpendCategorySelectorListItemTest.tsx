import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import SpendCategorySelectorListItem from '@components/SelectionList/ListItem/SpendCategorySelectorListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

const buildItem = (extra: Partial<ListItem> = {}): ListItem => ({
    keyForList: 'meals',
    groupID: 'meals',
    categoryID: 'Food &amp; Drink',
    ...extra,
});

describe('SpendCategorySelectorListItem', () => {
    it('renders nothing without a groupID', () => {
        render(
            <SpendCategorySelectorListItem
                item={buildItem({groupID: undefined})}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />,
        );

        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}meals`)).toBeNull();
    });

    it('renders the decoded category name under the capitalized group label', () => {
        render(
            <SpendCategorySelectorListItem
                item={buildItem()}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />,
        );

        expect(screen.getByText('Food & Drink')).toBeOnTheScreen();
        expect(screen.getByText('Meals')).toBeOnTheScreen();
    });

    it('selects the row when it is pressed', async () => {
        const onSelectRow = jest.fn();
        const item = buildItem();
        render(
            <SpendCategorySelectorListItem
                item={item}
                showTooltip={false}
                onSelectRow={onSelectRow}
            />,
        );

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}meals`));

        await waitFor(() => expect(onSelectRow).toHaveBeenCalledWith(item, undefined, undefined));
    });
});
