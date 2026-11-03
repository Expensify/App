import {render, screen} from '@testing-library/react-native';

import SelectableListItem from '@components/SelectionList/ListItem/SelectableListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import React from 'react';
import {View} from 'react-native';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

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
const mockSelectableListItem = jest.mocked(SelectableListItem);

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
                isFocused={false}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />,
        );

        // The row's display name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: ITEM_ACCOUNT_ID, hiddenTranslation: 'common.hidden'}));
    });

    describe('primary login', () => {
        // Render the row content so the login text is reachable; the mock from the module factory renders nothing by default.
        beforeEach(() => {
            mockSelectableListItem.mockImplementation(({children}) => <View>{children}</View>);
            mockGetDisplayNameForParticipant.mockReturnValue('SPY_NAME');
        });

        it.each(['someone@test.com', 'someone@gmail.com'])('shows the full login %s below the display name', (login) => {
            // Given a named user, whatever the login domain
            const item: ListItem = {
                keyForList: 'user-item',
                accountID: ITEM_ACCOUNT_ID,
                login,
            };

            // When the row renders
            render(
                <UserSelectionListItem
                    item={item}
                    isFocused={false}
                    showTooltip={false}
                    onSelectRow={jest.fn()}
                />,
            );

            // Then the full login is shown under the name, so users can be told apart by login, not a domain-stripped handle
            expect(screen.getByText('SPY_NAME')).toBeOnTheScreen();
            expect(screen.getByText(login)).toBeOnTheScreen();
        });

        it('hides the login when it matches the display name', () => {
            // Given a user without a name, whose display name falls back to their login
            const login = 'someone@test.com';
            mockGetDisplayNameForParticipant.mockReturnValue(login);
            const item: ListItem = {
                keyForList: 'user-item',
                accountID: ITEM_ACCOUNT_ID,
                login,
            };

            // When the row renders
            render(
                <UserSelectionListItem
                    item={item}
                    isFocused={false}
                    showTooltip={false}
                    onSelectRow={jest.fn()}
                />,
            );

            // Then the login is shown once, since a second line would only repeat the name
            expect(screen.getAllByText(login)).toHaveLength(1);
        });
    });
});
