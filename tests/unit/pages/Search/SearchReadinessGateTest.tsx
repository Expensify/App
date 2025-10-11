import {render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Text from '@components/Text';
import type {ValueOf} from 'type-fest';
import type {SearchQueryJSON} from '@components/Search/types';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import {openSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';
import SearchReadinessGate from '@pages/Search/SearchReadinessGate';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@hooks/useSearchTypeMenuSections');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@libs/actions/Search', () => ({
    openSearch: jest.fn(),
}));

type MockHookReturn = {
    typeMenuSections: SearchTypeMenuSection[];
    suggestedSearchesReady: boolean;
    suggestedSearches: Record<string, SearchTypeMenuItem>;
    suggestedSearchesVisibility: Record<string, boolean>;
};

const buildMenuItem = (key: ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, searchQuery: string, hash: number): SearchTypeMenuItem => ({
    key,
    translationPath: 'translation.stub' as TranslationPaths,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    icon: {} as IconAsset,
    searchQuery,
    searchQueryJSON: undefined,
    hash,
    similarSearchHash: hash,
});

const baseHookReturn: MockHookReturn = {
    typeMenuSections: [],
    suggestedSearchesReady: false,
    suggestedSearches: {},
    suggestedSearchesVisibility: {},
};

describe('SearchReadinessGate', () => {
    let hookState: MockHookReturn;
    const mockedUseSearchTypeMenuSections = jest.mocked(useSearchTypeMenuSections);
    const mockedOpenSearch = jest.mocked(openSearch);
    const FALLBACK_TEST_ID = 'fallback';

    beforeEach(() => {
        jest.clearAllMocks();
        hookState = {...baseHookReturn};
        mockedUseSearchTypeMenuSections.mockImplementation(() => hookState as unknown as ReturnType<typeof useSearchTypeMenuSections>);
    });

    it('renders fallback until ready then navigates to Approve once', async () => {
        expect(mockedOpenSearch).not.toHaveBeenCalled();
        const {rerender} = render(
            <SearchReadinessGate queryJSON={undefined}>
                {({suggestedSearchesReady}) => (suggestedSearchesReady ? <Text>ready</Text> : <Text testID={FALLBACK_TEST_ID}>loading</Text>)}
            </SearchReadinessGate>,
        );

        expect(mockedOpenSearch).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId(FALLBACK_TEST_ID)).toBeTruthy();

        const approveItem = buildMenuItem(CONST.SEARCH.SEARCH_KEYS.APPROVE, 'approveQuery', 2);
        hookState.suggestedSearchesReady = true;
        hookState.suggestedSearches = {
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: approveItem,
        } as Record<string, SearchTypeMenuItem>;
        hookState.suggestedSearchesVisibility = {
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: true,
        } as Record<string, boolean>;

        rerender(
            <SearchReadinessGate queryJSON={undefined}>
                {({suggestedSearchesReady}) => (suggestedSearchesReady ? <Text>ready</Text> : <Text testID={FALLBACK_TEST_ID}>loading</Text>)}
            </SearchReadinessGate>,
        );

        const expectedRoute = ROUTES.SEARCH_ROOT.getRoute({query: approveItem.searchQuery});

        await waitFor(() => {
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(Navigation.navigate).toHaveBeenCalledWith(expectedRoute);
        });

        expect(screen.queryByTestId(FALLBACK_TEST_ID)).toBeNull();
        expect(screen.getByText('ready')).toBeTruthy();

        rerender(
            <SearchReadinessGate queryJSON={{hash: approveItem.hash, similarSearchHash: approveItem.similarSearchHash} as SearchQueryJSON}>
                {({suggestedSearchesReady}) => (suggestedSearchesReady ? <Text>ready</Text> : <Text testID={FALLBACK_TEST_ID}>loading</Text>)}
            </SearchReadinessGate>,
        );

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('falls back to Submit when Approve is not visible', async () => {
        const approveItem = buildMenuItem(CONST.SEARCH.SEARCH_KEYS.APPROVE, 'approveQuery', 2);
        const submitItem = buildMenuItem(CONST.SEARCH.SEARCH_KEYS.SUBMIT, 'submitQuery', 3);

        hookState.suggestedSearches = {
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: approveItem,
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: submitItem,
        } as Record<string, SearchTypeMenuItem>;
        hookState.suggestedSearchesVisibility = {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: true,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: false,
        } as Record<string, boolean>;

        const {rerender} = render(
            <SearchReadinessGate queryJSON={undefined}>
                {({suggestedSearchesReady}) => (suggestedSearchesReady ? <Text>ready</Text> : <Text testID={FALLBACK_TEST_ID}>loading</Text>)}
            </SearchReadinessGate>,
        );

        hookState.suggestedSearchesReady = true;

        rerender(
            <SearchReadinessGate queryJSON={undefined}>
                {({suggestedSearchesReady}) => (suggestedSearchesReady ? <Text>ready</Text> : <Text testID={FALLBACK_TEST_ID}>loading</Text>)}
            </SearchReadinessGate>,
        );

        const expectedRoute = ROUTES.SEARCH_ROOT.getRoute({query: submitItem.searchQuery});

        await waitFor(() => {
            expect(Navigation.navigate).toHaveBeenCalledWith(expectedRoute);
        });
    });
});
