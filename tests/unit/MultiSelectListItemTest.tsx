import {render} from '@testing-library/react-native';

import BaseSelectListItem from '@components/SelectionList/ListItem/BaseSelectListItem';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import ListItemComposed from '@components/SelectionList/ListItemComposed';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

jest.mock('@components/SelectionList/ListItem/BaseSelectListItem', () => jest.fn(() => null));

const mockBaseSelectListItem = jest.mocked(BaseSelectListItem);

const ICON = {
    source: 'avatar.png',
    type: CONST.ICON_TYPE_AVATAR,
    name: 'Test User',
    id: 7,
};

function renderItem(item: ListItem) {
    render(
        <MultiSelectListItem
            item={item}
            isFocused={false}
            showTooltip={false}
            onSelectRow={jest.fn()}
        />,
    );
    return mockBaseSelectListItem.mock.calls.at(0)?.at(0);
}

describe('MultiSelectListItem', () => {
    beforeEach(() => {
        mockBaseSelectListItem.mockClear();
    });

    it('delegates to BaseSelectListItem as a checkbox row', () => {
        const props = renderItem({keyForList: 'row', text: 'Row'});

        expect(props).toEqual(
            expect.objectContaining({
                canSelectMultiple: true,
                accessibilityRole: CONST.ROLE.CHECKBOX,
            }),
        );
    });

    it('passes a CompactAvatar leftElement when the item has icons', () => {
        const props = renderItem({keyForList: 'row', text: 'Row', icons: [ICON]});

        const leftElement = props?.leftElement as React.ReactElement;
        expect(leftElement.type).toBe(ListItemComposed.CompactAvatar);
        expect(leftElement.props).toEqual(expect.objectContaining({icon: ICON}));
    });

    it('leaves leftElement undefined when there are no icons, so the item value is used', () => {
        const customLeftElement = <View testID="custom-left-element" />;
        const props = renderItem({keyForList: 'row', text: 'Row', leftElement: customLeftElement});

        expect(props?.leftElement).toBeUndefined();
        expect(props?.item.leftElement).toBe(customLeftElement);
    });
});
