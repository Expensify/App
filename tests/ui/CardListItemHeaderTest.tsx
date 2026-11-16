import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AccountAvatarWithCardFeed from '@components/Avatar/connected/AccountAvatarWithCardFeed';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CardListItemHeader from '@components/Search/SearchList/ListItem/CardListItemHeader';
import type {TransactionCardGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import createMockSearchContext from '../utils/createMockSearchContext';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';
import testSearchGroupHeader from '../utils/testSearchGroupHeader';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
// These assertions cover header forwarding, while CardUtilsTest covers the real icon resolver.
jest.mock('@components/Avatar/connected/AccountAvatarWithCardFeed', () => jest.fn(() => null));

// SearchUIUtils builds this row from personal details and the corresponding SearchResults group.
const createCardItem = (overrides: Partial<TransactionCardGroupListItemType> = {}): TransactionCardGroupListItemType =>
    createMock<TransactionCardGroupListItemType>({
        groupedBy: CONST.SEARCH.GROUP_BY.CARD,
        accountID: 123,
        displayName: 'Alex Rivera',
        login: 'alex@example.com',
        keyForList: 'group_123',
        transactions: [],
        count: 7,
        total: 12345,
        currency: 'USD',
        cardID: 42,
        bank: ' cards_2267989_ccupload666 ',
        cardName: 'Travel',
        lastFourPAN: '4242',
        formattedCardName: 'Travel card',
        formattedFeedName: 'Imported feed',
        ...overrides,
    });

function renderHeader(item: TransactionCardGroupListItemType, props: Partial<Omit<Parameters<typeof CardListItemHeader>[0], 'card'>> = {}) {
    const {state, actions} = createMockSearchContext();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <MockSearchContextProvider
                state={state}
                actions={actions}
            >
                <CardListItemHeader
                    card={item}
                    canSelectMultiple
                    {...props}
                />
            </MockSearchContextProvider>
        </ComposeProviders>,
    );
}

describe('CardListItemHeader', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => {
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth: true}));
    });
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    testSearchGroupHeader({
        createItem: createCardItem,
        renderHeader: (item, props, onCheckboxPress) => renderHeader(item, {...props, onCheckboxPress}),
        identifyingColumn: CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD,
        identifyingText: 'Travel card',
        cellText: /^(\$123\.45|Travel card|7)$/,
    });

    it.each([true, false])('forwards the untouched bank text on wide layout %s', async (isLargeScreenWidth) => {
        // Given bank text may contain legacy prefixes or unrecognized characters.
        const item = createCardItem();
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth}));
        // When either avatar site renders in the real header.
        renderHeader(item, {columns: [CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD, CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED]});
        await waitForBatchedUpdatesWithAct();
        // Then the lower avatar receives the original text and account identity without normalization.
        expect(AccountAvatarWithCardFeed).toHaveBeenCalled();
        const avatarProps = jest.mocked(AccountAvatarWithCardFeed).mock.calls.at(-1)?.[0];
        expect(avatarProps).toBeDefined();
        expect(avatarProps?.cardFeed).toBe(item.bank);
        expect(avatarProps?.accountID).toBe(item.accountID);
        if (isLargeScreenWidth) {
            expect(avatarProps?.size).toBe(CONST.AVATAR_SIZE.SMALL);
            expect(screen.getByText('Imported feed')).toBeOnTheScreen();
        } else {
            expect(avatarProps?.size).toBeUndefined();
            expect(screen.getByText('Alex Rivera')).toBeOnTheScreen();
            expect(screen.getByText('$123.45')).toBeOnTheScreen();
        }
        expect(screen.getByText('Travel card')).toBeOnTheScreen();
    });

    it('keeps the narrow expand action and total beside the cardholder details', async () => {
        // Given narrow search results expand the group from the header itself.
        const item = createCardItem();
        const expandGroup = jest.fn();
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth: false}));
        // When the user expands the real narrow header.
        renderHeader(item, {onDownArrowClick: expandGroup, columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]});
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Expand'));
        // Then the callback fires once and narrow content does not depend on the wide column list.
        expect(expandGroup).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Alex Rivera')).toBeOnTheScreen();
        expect(screen.getByText('Travel card')).toBeOnTheScreen();
        expect(screen.getByText('$123.45')).toBeOnTheScreen();
        expect(screen.queryByText('7')).toBeNull();
    });
});
