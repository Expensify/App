import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MemberListItemHeader from '@components/Search/SearchList/ListItem/MemberListItemHeader';
import type {TransactionMemberGroupListItemType} from '@components/Search/SearchList/ListItem/types';

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

// SearchUIUtils builds this row from personal details and the corresponding SearchResults group.
const createMemberItem = (overrides: Partial<TransactionMemberGroupListItemType> = {}): TransactionMemberGroupListItemType =>
    createMock<TransactionMemberGroupListItemType>({
        groupedBy: CONST.SEARCH.GROUP_BY.FROM,
        accountID: 123,
        displayName: 'Alex Rivera',
        login: 'alex@example.com',
        keyForList: 'group_123',
        transactions: [],
        count: 7,
        total: 12345,
        currency: 'USD',
        formattedFrom: 'Alex Rivera',
        ...overrides,
    });

function renderHeader(item: TransactionMemberGroupListItemType, props: Partial<Omit<Parameters<typeof MemberListItemHeader>[0], 'member'>> = {}) {
    const {state, actions} = createMockSearchContext();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <MockSearchContextProvider
                state={state}
                actions={actions}
            >
                <MemberListItemHeader
                    member={item}
                    canSelectMultiple
                    isLargeScreenWidth
                    {...props}
                />
            </MockSearchContextProvider>
        </ComposeProviders>,
    );
}

describe('MemberListItemHeader', () => {
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
        createItem: createMemberItem,
        renderHeader: (item, props, onCheckboxPress) => renderHeader(item, {...props, onCheckboxPress}),
        identifyingColumn: CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
        identifyingText: 'Alex Rivera',
        cellText: /^(\$123\.45|Alex Rivera|7)$/,
    });

    it('uses the explicit narrow prop and falls back to the display name for an empty login', async () => {
        // Given the member header uses its prop even when the responsive hook reports a wide screen.
        const item = createMemberItem({login: ''});
        const expandGroup = jest.fn();
        // When the narrow row renders without a formatted login.
        renderHeader(item, {isLargeScreenWidth: false, onDownArrowClick: expandGroup, columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]});
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Expand'));
        // Then both labels use the display name and the narrow expand action stays available.
        expect(screen.getAllByText('Alex Rivera')).toHaveLength(2);
        expect(screen.getByText('$123.45')).toBeOnTheScreen();
        expect(screen.queryByText('7')).toBeNull();
        expect(expandGroup).toHaveBeenCalledTimes(1);
    });

    it('shows the formatted login alongside the display name', async () => {
        // Given the member has a login distinct from its display name.
        const item = createMemberItem();
        // When the identifying wide column renders.
        renderHeader(item, {columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM]});
        await waitForBatchedUpdatesWithAct();
        // Then neither the login nor the display name replaces the other.
        expect(screen.getByText('Alex Rivera')).toBeOnTheScreen();
        expect(screen.getByText('alex@example.com')).toBeOnTheScreen();
    });
});
