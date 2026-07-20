import {render} from '@testing-library/react-native';

import type {ListItem} from '@components/SelectionList/ListItem/types';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import React from 'react';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, login: 'current@test.com'}));

jest.mock('@components/SelectionList/ListItem/SelectableListItem', () => jest.fn(() => null));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const ITEM_ACCOUNT_ID = 424242;

describe('UserSelectionListItem', () => {
    it('resolves the user display name through the translate function from useLocalize', () => {
        const item: ListItem = {
            keyForList: 'user-item',
            accountID: ITEM_ACCOUNT_ID,
            login: 'someone@test.com',
        };

        render(
            <UserSelectionListItem
                item={item}
                keyForList="user-item"
                isFocused={false}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />,
        );

        // The row's display name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: ITEM_ACCOUNT_ID, translate: mockTranslate}));
    });
});
