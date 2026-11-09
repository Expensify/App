import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavSavedSearchIconName} from '@libs/Navigation/FlatNav/types';
import useFlatNavSavedSearchItems from '@libs/Navigation/FlatNav/useFlatNavSavedSearchItems';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getSavedSearchIconName} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SaveSearch} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: (phone: string) => phone,
    localeCompare: (a: string, b: string) => a.localeCompare(b),
}));

function Wrapper({children}: {children: React.ReactNode}) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
}

async function renderItems(savedSearches: SaveSearch | undefined, enabled = true) {
    await Onyx.set(ONYXKEYS.SAVED_SEARCHES, savedSearches ?? null);
    const {result} = renderHook(() => useFlatNavSavedSearchItems(enabled), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return result;
}

describe('useFlatNavSavedSearchItems', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should return no items when there are no saved searches', async () => {
        // Given a user without saved searches
        // When we render the hook
        const result = await renderItems(undefined);

        // Then there is nothing to list because no saved searches exist in Onyx
        expect(result.current).toEqual([]);
    });

    it('should use the name as the title when the saved search was renamed', async () => {
        // Given a saved search whose name differs from its query
        const result = await renderItems({coffee: {name: 'Coffee runs', query: 'type:expense merchant:Starbucks'}});

        // When the hook resolves it
        // Then the title is the name, and the item carries what navigation needs
        expect(result.current).toEqual([
            {
                type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
                key: savedSearchIDToSearchKey('coffee'),
                sectionID: FLAT_NAV.SECTION.SAVED,
                savedSearchID: 'coffee',
                name: 'Coffee runs',
                title: 'Coffee runs',
                query: 'type:expense merchant:Starbucks',
                iconName: getSavedSearchIconName('type:expense merchant:Starbucks'),
                isDisabled: false,
            },
        ]);
    });

    it('should resolve a readable title when the saved search was never renamed', async () => {
        // Given a saved search whose name is its raw query
        const query = 'type:expense merchant:Starbucks';
        const result = await renderItems({unnamed: {name: query, query}});

        // When the hook resolves it
        // Then the title is built from the query instead of showing it raw
        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)?.title).not.toBe(query);
    });

    it('should fall back to raw query as title when enabled is false', async () => {
        // Given a saved search whose name is its raw query
        const query = 'type:expense merchant:Starbucks';

        // When the hook is rendered with enabled = false
        const result = await renderItems({unnamed: {name: query, query}}, false);

        // Then it falls back to the raw query instead of resolving a human-readable title
        expect(result.current.at(0)?.title).toBe(query);
    });

    it('should sort the items by title', async () => {
        // Given saved searches stored in a different order than their titles
        const result = await renderItems({
            zebra: {name: 'Zebra', query: 'type:expense merchant:Z'},
            apple: {name: 'Apple', query: 'type:expense merchant:A'},
            mango: {name: 'Mango', query: 'type:expense merchant:M'},
        });

        // When the hook resolves them
        // Then they follow the titles, the way the Spend menu lists them
        expect(result.current.map((item) => item.title)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('should disable a saved search that is pending delete', async () => {
        // Given a saved search that is being deleted
        const result = await renderItems({coffee: {name: 'Coffee', query: 'type:expense', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}});

        // When the hook resolves it
        // Then it is disabled, so a bar can show it greyed out
        expect(result.current.at(0)?.isDisabled).toBe(true);
    });

    it('should pick an icon from the type of the query', async () => {
        // Given saved searches of two different types
        const result = await renderItems({
            expenses: {name: 'Expenses', query: 'type:expense'},
            reports: {name: 'Reports', query: 'type:expense-report'},
        });

        // When the hook resolves them
        // Then their icons differ, since the icon follows the type
        const iconNames: FlatNavSavedSearchIconName[] = result.current.map((item) => item.iconName);
        expect(new Set(iconNames).size).toBe(2);
    });
});
