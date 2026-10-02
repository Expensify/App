import {render} from '@testing-library/react-native';

import MultiSelect from '@components/Search/FilterComponents/MultiSelect';
import TagSelector from '@components/Search/FilterComponents/TagSelector';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchTagFilters from '@hooks/useSearchTagFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

jest.mock('@components/Search/FilterComponents/MultiSelect', () => jest.fn(() => null));
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: () => false},
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);
jest.mock('@hooks/useSearchTagFilters', () => jest.fn());

describe('TagSelector', () => {
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedUseNetwork = jest.mocked(useNetwork);
    const mockedUseSearchTagFilters = jest.mocked(useSearchTagFilters);
    const mockedMultiSelect = jest.mocked(MultiSelect);

    const mockPolicies = {
        [`${ONYXKEYS.COLLECTION.POLICY}1`]: {id: '1', name: 'Workspace 1'},
        [`${ONYXKEYS.COLLECTION.POLICY}2`]: {id: '2', name: 'Workspace 2'},
    };

    const mockPolicyTags = {
        [`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`]: {
            TagList1: {
                name: 'TagList1',
                tags: {
                    Tag1: {name: 'Tag1'},
                },
            },
        },
        [`${ONYXKEYS.COLLECTION.POLICY_TAGS}2`]: {
            TagList2: {
                name: 'TagList2',
                tags: {
                    Tag2: {name: 'Tag2'},
                },
            },
        },
    };

    beforeEach(() => {
        mockedMultiSelect.mockClear();
        mockedUseSearchTagFilters.mockReturnValue({
            searchResults: [],
            isSearching: false,
            isLoadingMore: false,
            hasMore: false,
            loadMore: jest.fn(),
            searchTags: jest.fn(),
            isInitialLoading: false,
            searchQuery: '',
        });

        (mockedUseOnyx as jest.Mock).mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [mockPolicies];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY_TAGS) {
                return [mockPolicyTags];
            }
            return [{}];
        });
    });

    it('falls back to offline tags and displays all workspace tags when no workspace filter is active', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);

        render(
            <TagSelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        expect(mockedMultiSelect.mock.lastCall?.[0].items).toEqual([
            {text: 'search.noTag', value: CONST.SEARCH.TAG_EMPTY_VALUE},
            {text: 'Tag1', value: 'Tag1'},
            {text: 'Tag2', value: 'Tag2'},
        ]);
    });

    it('resolves workspace names when filtering tags offline', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);

        render(
            <TagSelector
                value={[]}
                policyID={{value: ['Workspace 2'], isNegated: false}}
                onChange={jest.fn()}
            />,
        );

        expect(mockedMultiSelect.mock.lastCall?.[0].items).toEqual([
            {text: 'search.noTag', value: CONST.SEARCH.TAG_EMPTY_VALUE},
            {text: 'Tag2', value: 'Tag2'},
        ]);
    });

    it('resolves negated workspace names when filtering tags offline', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);

        render(
            <TagSelector
                value={[]}
                policyID={{value: ['Workspace 1'], isNegated: true}}
                onChange={jest.fn()}
            />,
        );

        expect(mockedMultiSelect.mock.lastCall?.[0].items).toEqual([
            {text: 'search.noTag', value: CONST.SEARCH.TAG_EMPTY_VALUE},
            {text: 'Tag2', value: 'Tag2'},
        ]);
    });

    it('resolves workspace names to policy IDs for search tag filters hook when online', () => {
        mockedUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);

        render(
            <TagSelector
                value={[]}
                policyID={{value: ['Workspace 1', 'Workspace 2'], isNegated: false}}
                onChange={jest.fn()}
            />,
        );

        expect(mockedUseSearchTagFilters).toHaveBeenCalledWith('1,2');
    });
});
