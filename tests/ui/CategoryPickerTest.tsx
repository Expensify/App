import {render} from '@testing-library/react-native';

import CategoryPicker from '@components/CategoryPicker';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

// eslint-disable-next-line no-restricted-imports -- Type-only namespace import used to type jest.requireActual for the react-native-onyx mock.
import type * as ReactNativeOnyx from 'react-native-onyx';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- CategoryPicker reads the GL-code flags via the raw react-native-onyx useOnyx (to bypass the Search snapshot); the test drives that same hook.
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

// The GL-code visibility flag must be read from live Onyx, not the Search snapshot (which trims
// `showCategoryGLCodes`/`glCodes` from the policy). CategoryPicker reads the flag via the raw
// react-native-onyx `useOnyx` (mocked here as `useOnyxWithoutSnapshots`) and the categories via the
// snapshot-aware `@hooks/useOnyx`, so we can drive the two independently.
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn()})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
// The hook sends GetPolicyCategories on mount. Under Jest, a real request reaches Expo's fetch polyfill, which throws "Request is not defined" and crashes the worker.
jest.mock('@hooks/useLoadPolicyCategories', () => jest.fn(() => ({isLoadingPolicyCategories: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
// Returns [searchValue, debouncedSearchValue, setter]. Lets a test stand the picker up mid-search.
let mockDebouncedSearchValue = '';
jest.mock('@hooks/useDebouncedState', () => jest.fn(() => [mockDebouncedSearchValue, mockDebouncedSearchValue, jest.fn()]));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);
jest.mock('react-native-onyx', () => {
    const actual = jest.requireActual<typeof ReactNativeOnyx>('react-native-onyx');
    return {__esModule: true, ...actual, useOnyx: jest.fn()};
});

const POLICY_ID = '1';

const GL_CODE_FIELD = 'GL Code';

const makeCategory = (name: string, glCode: string): PolicyCategories[string] => ({
    enabled: true,
    name,
    unencodedName: name,
    areCommentsRequired: false,
    [GL_CODE_FIELD]: glCode,
    externalID: '',
    origin: '',
    pendingAction: undefined,
});

const findRow = (searchText: string) =>
    jest
        .mocked(SelectionListWithSections)
        .mock.lastCall?.[0].sections.flatMap((section) => section.data)
        .find((row) => row.searchText === searchText);

describe('CategoryPicker', () => {
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedUseOnyxWithoutSnapshots = jest.mocked(useOnyxWithoutSnapshots);

    beforeEach(() => {
        mockDebouncedSearchValue = '';
        jest.mocked(SelectionListWithSections).mockClear();

        // `@hooks/useOnyx` (snapshot-aware) provides the categories. GL codes live on the categories
        // themselves, which are NOT trimmed by the snapshot.
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                return [{Advertising: makeCategory('Advertising', '12'), Benefits: makeCategory('Benefits', '13')}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('shows GL codes on Search even when the snapshot policy is missing the GL-code flags (regression #96810)', () => {
        // Live policy has the GL-code flags → selector resolves to true.
        mockedUseOnyxWithoutSnapshots.mockReturnValue([true, {status: 'loaded'}]);

        render(
            <CategoryPicker
                policyID={POLICY_ID}
                onSubmit={jest.fn()}
            />,
        );

        expect(findRow('Advertising')?.alternateText).toBe('12');
        expect(findRow('Benefits')?.alternateText).toBe('13');
    });

    it('does not show GL codes when the policy has the GL-code flags disabled', () => {
        // Live policy has the flag disabled → selector resolves to false.
        mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);

        render(
            <CategoryPicker
                policyID={POLICY_ID}
                onSubmit={jest.fn()}
            />,
        );

        expect(findRow('Advertising')?.alternateText).toBeUndefined();
        expect(findRow('Benefits')?.alternateText).toBeUndefined();
    });

    it('shows GL codes when the caller forces them on, even if the policy has the GL-code flags disabled', () => {
        // Given a policy that hides GL codes in the regular category picker
        mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);

        // When the picker is opened from the Category GL code cell, which forces GL codes on because the code is what the user is picking
        render(
            <CategoryPicker
                policyID={POLICY_ID}
                onSubmit={jest.fn()}
                shouldAlwaysShowGLCode
            />,
        );

        // Then each category still shows its GL code underneath
        expect(findRow('Advertising')?.alternateText).toBe('12');
        expect(findRow('Benefits')?.alternateText).toBe('13');
    });

    describe('reported rendered row count', () => {
        it('counts one row per category when none of them are nested', () => {
            // Given three flat categories
            mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);
            mockedUseOnyx.mockImplementation((key) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                    return [{Flights: makeCategory('Flights', ''), Hotels: makeCategory('Hotels', ''), Meals: makeCategory('Meals', '')}, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
            const onRenderedRowCountChange = jest.fn();

            // When the picker renders
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={jest.fn()}
                    onRenderedRowCountChange={onRenderedRowCountChange}
                />,
            );

            // Then it reports the three rows it drew
            expect(onRenderedRowCountChange).toHaveBeenLastCalledWith(3);
        });

        it('counts the parent rows a nested category hangs off', () => {
            // Given the same three categories, two of them under one parent
            mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);
            mockedUseOnyx.mockImplementation((key) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                    const nestedCategories: PolicyCategories = {};
                    for (const name of ['Meals', 'Travel: Flights', 'Travel: Hotels']) {
                        nestedCategories[name] = makeCategory(name, '');
                    }
                    return [nestedCategories, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
            const onRenderedRowCountChange = jest.fn();

            // When the picker renders
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={jest.fn()}
                    onRenderedRowCountChange={onRenderedRowCountChange}
                />,
            );

            // Then it reports four rows, not three: the `Travel` parent takes one. Sizing from the category
            // count left the pop-over a row short and hid an option behind a scroll.
            expect(onRenderedRowCountChange).toHaveBeenLastCalledWith(4);
        });

        it('does not report a filtered count while the user is searching', () => {
            // Given a search that narrows three categories down to one
            mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);
            mockedUseOnyx.mockImplementation((key) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                    return [{Flights: makeCategory('Flights', ''), Hotels: makeCategory('Hotels', ''), Meals: makeCategory('Meals', '')}, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
            mockDebouncedSearchValue = 'Fli';
            const onRenderedRowCountChange = jest.fn();

            // When the picker renders mid-search
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={jest.fn()}
                    onRenderedRowCountChange={onRenderedRowCountChange}
                />,
            );

            // Then nothing is reported: resizing as results narrow slides the search input out from under the
            // cursor, since a container opened above its row is pinned by its bottom edge.
            expect(onRenderedRowCountChange).not.toHaveBeenCalled();
        });
    });

    it('never reads a bare collection key when the policy ID is an empty string', () => {
        mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);

        render(
            <CategoryPicker
                policyID=""
                onSubmit={jest.fn()}
            />,
        );

        const collectionKeys: string[] = [
            ONYXKEYS.COLLECTION.POLICY,
            ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
            ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT,
            ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
        ];
        const requestedKeys = [...mockedUseOnyx.mock.calls, ...mockedUseOnyxWithoutSnapshots.mock.calls].map(([key]) => key);

        expect(requestedKeys.length).toBeGreaterThan(0);
        for (const key of requestedKeys) {
            expect(collectionKeys).not.toContain(key);
        }
    });

    describe('create category row', () => {
        const CREATE_ROW_TEXT = 'workspace.categories.createCategoryFromSearch';

        const findCreateRow = () =>
            jest
                .mocked(SelectionListWithSections)
                .mock.lastCall?.[0].sections.flatMap((section) => section.data)
                .find((row) => row.text === CREATE_ROW_TEXT);

        const renderSearch = (searchValue: string, onCreateCategory = jest.fn(), onSubmit = jest.fn()) => {
            mockDebouncedSearchValue = searchValue;
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={onSubmit}
                    onCreateCategory={onCreateCategory}
                />,
            );
        };

        beforeEach(() => {
            mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);
            mockedUseOnyx.mockImplementation((key) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                    return [{Meals: makeCategory('Meals', ''), Training: {...makeCategory('Training', ''), enabled: false}}, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
        });

        it('offers to create a searched-for name that matches nothing, and hands over the name without surrounding spaces', () => {
            // Given an admin who searched for a category the workspace doesn't have, with stray spaces around it
            const onCreateCategory = jest.fn();
            const onSubmit = jest.fn();
            renderSearch('  Flights ', onCreateCategory, onSubmit);

            // When they tap the create row
            const createRow = findCreateRow();
            if (!createRow) {
                throw new Error('Expected the picker to offer a create row');
            }
            expect(createRow.searchText).toBe('Flights');
            jest.mocked(SelectionListWithSections).mock.lastCall?.[0].onSelectRow(createRow);

            // Then the picker asks to create the trimmed name, which is the name the new-category page would save, and
            // doesn't treat the row as an existing category pick
            expect(onCreateCategory).toHaveBeenCalledWith('Flights');
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('offers the row for a disabled category, which the picker hides from the results', () => {
            // Given a search for a category that exists but is disabled
            // When the picker renders
            renderSearch('Training');

            // Then the row is offered, since tapping it turns the category back on rather than failing as a duplicate
            expect(findCreateRow()?.searchText).toBe('Training');
        });

        it('does not offer the row for a category that is being deleted', () => {
            // Given a workspace where `Training` was just deleted offline, which stores it disabled with a pending delete
            mockedUseOnyx.mockImplementation((key) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                    return [
                        {Meals: makeCategory('Meals', ''), Training: {...makeCategory('Training', ''), enabled: false, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
                        {status: 'loaded'},
                    ];
                }
                return [undefined, {status: 'loaded'}];
            });

            // When the admin searches for it
            renderSearch('Training');

            // Then the row is not offered, since tapping it would bring back a category the admin is deleting
            expect(findCreateRow()).toBeUndefined();
        });

        it('shows the matches instead of the row when the search matches a category, even partially', () => {
            // Given a search that partly matches `Meals`
            // When the picker renders
            renderSearch('Mea');

            // Then the match shows as today, with no row to create a near-duplicate
            expect(findRow('Meals')).toBeDefined();
            expect(findCreateRow()).toBeUndefined();
        });

        it.each([
            ['the reserved `Uncategorized` name', CONST.SEARCH.CATEGORY_DEFAULT_VALUE],
            ['the reserved `###` name', CONST.INVALID_CATEGORY_NAME],
            ['HTML tags', '<b>Flights</b>'],
            ['more than 255 characters', 'a'.repeat(CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH + 1)],
        ])('does not offer the row for a search with %s', (_, searchValue) => {
            // Given a search the new-category page would reject
            // When the picker renders
            renderSearch(searchValue);

            // Then only `No results found` shows, so the row never offers a name that validation would reject
            expect(findCreateRow()).toBeUndefined();
        });

        it('does not offer the row when the caller cannot create categories', () => {
            // Given a picker opened by a user who doesn't see the `+`, so the caller passes no create handler
            // When they search for a name that matches nothing
            mockDebouncedSearchValue = 'Flights';
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={jest.fn()}
                />,
            );

            // Then there is no row, as today
            expect(findCreateRow()).toBeUndefined();
        });
    });

    describe('search input threshold', () => {
        const EIGHT_CATEGORIES = Object.fromEntries(
            Array.from({length: CONST.INLINE_EDIT_PICKER_SEARCH_INPUT_THRESHOLD}, (_, index) => {
                const name = `Category ${index}`;
                return [name, makeCategory(name, `${index}`)];
            }),
        );

        beforeEach(() => {
            mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);
            mockedUseOnyx.mockImplementation((key) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                    return [EIGHT_CATEGORIES, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
        });

        it('hides the search input on the full-page picker until there are 12 categories', () => {
            // Given a workspace with 8 enabled categories, fewer than the full-page threshold of 12
            // When the picker renders with the default threshold, as the full-page pickers do
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={jest.fn()}
                />,
            );

            // Then the search input stays hidden
            expect(jest.mocked(SelectionListWithSections).mock.lastCall?.[0].shouldShowTextInput).toBe(false);
        });

        it('shows the search input on the inline picker once there are 8 categories', () => {
            // Given the same 8 enabled categories
            // When the picker renders with the lower threshold the inline expense-table popover passes
            render(
                <CategoryPicker
                    policyID={POLICY_ID}
                    onSubmit={jest.fn()}
                    searchInputThreshold={CONST.INLINE_EDIT_PICKER_SEARCH_INPUT_THRESHOLD}
                />,
            );

            // Then the search input is shown
            expect(jest.mocked(SelectionListWithSections).mock.lastCall?.[0].shouldShowTextInput).toBe(true);
        });
    });
});
