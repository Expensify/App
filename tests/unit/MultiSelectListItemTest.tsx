import {render} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import BaseSelectListItem from '@components/SelectionList/ListItem/BaseSelectListItem';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

// The base item is stubbed to render just the left element, so the avatar wiring is exercised without the full row chrome.
jest.mock('@components/SelectionList/ListItem/BaseSelectListItem', () => jest.fn(({leftElement}: {leftElement?: React.ReactNode}) => leftElement ?? null));

jest.mock('@components/Avatar/AvatarFromIcon', () => jest.fn(() => null));

const mockBaseSelectListItem = jest.mocked(BaseSelectListItem);
const mockAvatarFromIcon = jest.mocked(AvatarFromIcon);

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
        mockAvatarFromIcon.mockClear();
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

    it('renders the item avatar as the left element when the item has icons', () => {
        renderItem({keyForList: 'row', text: 'Row', icons: [ICON]});

        expect(mockAvatarFromIcon).toHaveBeenCalledTimes(1);
        expect(mockAvatarFromIcon.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({icon: ICON}));
    });

    it('leaves leftElement undefined when there are no icons, so the item value is used', () => {
        const customLeftElement = <View testID="custom-left-element" />;
        const props = renderItem({keyForList: 'row', text: 'Row', leftElement: customLeftElement});

        expect(props?.leftElement).toBeUndefined();
        expect(props?.item.leftElement).toBe(customLeftElement);
    });
});
