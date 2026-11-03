import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestReportGroupHeader from '@components/MoneyRequestReportView/MoneyRequestReportGroupHeader';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GroupedTransactions} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Helper function to create a transaction group for the header
const createGroup = (groupName: string): GroupedTransactions => ({
    groupName,
    groupKey: groupName,
    transactions: [],
    subTotalAmount: 1000,
    isExpanded: true,
});

// Helper function to render MoneyRequestReportGroupHeader with providers
const renderGroupHeader = (group: GroupedTransactions, isGroupedByTag: boolean) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MoneyRequestReportGroupHeader
                group={group}
                groupKey={group.groupKey}
                currency="USD"
                isGroupedByTag={isGroupedByTag}
                shouldUseNarrowLayout={false}
            />
        </ComposeProviders>,
    );
};

describe('MoneyRequestReportGroupHeader', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        return Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates);
    });

    it('should display the full category hierarchy for a category group', async () => {
        // Given a category group whose name is a hierarchical category
        const group = createGroup('Meals and Entertainment: Other');

        // When rendering the group header grouped by category
        renderGroupHeader(group, false);
        await waitForBatchedUpdates();

        // Then the full Parent: Child path should be displayed, not only the leaf
        expect(screen.getByText('Meals and Entertainment: Other')).toBeOnTheScreen();
    });

    it('should clean empty segments from the category group name', async () => {
        // Given a category group whose name contains an empty middle segment
        const group = createGroup('Food: : Meat');

        // When rendering the group header grouped by category
        renderGroupHeader(group, false);
        await waitForBatchedUpdates();

        // Then the empty segment should be dropped while keeping the full hierarchy
        expect(screen.getByText('Food: Meat')).toBeOnTheScreen();
    });

    it('should keep using the tag formatter for tag groups', async () => {
        // Given a tag group with a multi-level tag name
        const group = createGroup('State:City');

        // When rendering the group header grouped by tag
        renderGroupHeader(group, true);
        await waitForBatchedUpdates();

        // Then the tag levels should be comma separated by the tag formatter, not colon joined
        expect(screen.getByText('State, City')).toBeOnTheScreen();
    });
});
