import {renderHook, waitFor} from '@testing-library/react-native';

import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';

import type * as PolicyCategory from '@libs/actions/Policy/Category';
import type * as PolicyTag from '@libs/actions/Policy/Tag';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';

import React, {useContext} from 'react';
import Onyx from 'react-native-onyx';

/**
 * Both hooks own the picker's loading flag. Without a policyID no read is ever dispatched, so the loading state key
 * stays absent forever and the flag has to settle on false, otherwise the picker sits on a skeleton for good.
 */

const POLICY_ID = 'A1B2C3';
const CURRENT_USER_EMAIL = 'picker@test.com';

/** Signs the current user in and stores the workspace with the given role for them */
async function setCurrentUserRole(role: ValueOf<typeof CONST.POLICY.ROLE>) {
    await Onyx.merge(ONYXKEYS.SESSION, {
        email: CURRENT_USER_EMAIL,
        accountID: 1,
    });
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
        id: POLICY_ID,
        type: CONST.POLICY.TYPE.CORPORATE,
        role,
        employeeList: {[CURRENT_USER_EMAIL]: {email: CURRENT_USER_EMAIL, role}},
    });
}

const SEARCH_HASH = 123;
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;

/** Puts the hook on a Search page whose snapshot is SEARCH_HASH, so snapshot-aware Onyx reads resolve from the snapshot */
function SearchSnapshotWrapper({children}: {children: ReactNode}) {
    const searchQueryContext = useContext(SearchQueryContext);
    return React.createElement(SearchScopeProvider, null, React.createElement(SearchQueryContext.Provider, {value: {...searchQueryContext, currentSearchHash: SEARCH_HASH}}, children));
}

const mockGetPolicyCategories = jest.fn<void, [string]>();
const mockOpenPolicyTagsPage = jest.fn<void, [string]>();

jest.mock('@libs/actions/Policy/Category', () => {
    const actual = jest.requireActual<typeof PolicyCategory>('@libs/actions/Policy/Category');
    return {
        ...actual,
        getPolicyCategories: (policyID: string) => mockGetPolicyCategories(policyID),
    };
});

jest.mock('@libs/actions/Policy/Tag', () => {
    const actual = jest.requireActual<typeof PolicyTag>('@libs/actions/Policy/Tag');
    return {
        ...actual,
        openPolicyTagsPage: (policyID: string) => mockOpenPolicyTagsPage(policyID),
    };
});

const hooks = [
    {
        name: 'useLoadPolicyCategories',
        renderPicker: (policyID: string | undefined) => renderHook(() => useLoadPolicyCategories(policyID)),
        renderPickerOnSearch: (policyID: string) => renderHook(() => useLoadPolicyCategories(policyID), {wrapper: SearchSnapshotWrapper}),
        getIsLoading: (result: {isLoadingPolicyCategories?: boolean; isLoadingPolicyTags?: boolean}) => result.isLoadingPolicyCategories,
        mockRead: mockGetPolicyCategories,
    },
    {
        name: 'useLoadPolicyTags',
        renderPicker: (policyID: string | undefined) => renderHook(() => useLoadPolicyTags(policyID)),
        renderPickerOnSearch: (policyID: string) => renderHook(() => useLoadPolicyTags(policyID), {wrapper: SearchSnapshotWrapper}),
        getIsLoading: (result: {isLoadingPolicyCategories?: boolean; isLoadingPolicyTags?: boolean}) => result.isLoadingPolicyTags,
        mockRead: mockOpenPolicyTagsPage,
    },
] as const;

describe.each(hooks)('$name', ({renderPicker, renderPickerOnSearch, getIsLoading, mockRead}) => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockRead.mockClear();
        await Onyx.clear();
    });

    it.each([undefined, ''])('settles on not-loading and dispatches no read when policyID is %p', async (policyID) => {
        const {result} = renderPicker(policyID);

        // The flag is read on the very first render, before any Onyx subscription can settle, so it must already be
        // false there. Waiting only guards against it flipping true once the subscriptions land.
        expect(getIsLoading(result.current)).toBe(false);
        await waitFor(() => {
            expect(getIsLoading(result.current)).toBe(false);
        });
        expect(mockRead).not.toHaveBeenCalled();
    });

    it.each([CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.AUDITOR])('reports loading and dispatches a read for a %s when nothing is cached', async (role) => {
        // Given a role that Auth lets read the workspace's categories and tags
        await setCurrentUserRole(role);

        // When a picker for the workspace mounts
        const {result} = renderPicker(POLICY_ID);

        // Then the read is sent and the picker shows a skeleton until it lands
        await waitFor(() => {
            expect(mockRead).toHaveBeenCalledWith(POLICY_ID);
        });
        expect(getIsLoading(result.current)).toBe(true);
    });

    it('settles on not-loading and dispatches no read for a regular member', async () => {
        // Given a regular member, whom Auth rejects for this read, so sending it would only fail on every picker open
        await setCurrentUserRole(CONST.POLICY.ROLE.USER);

        // When a picker for the workspace mounts
        const {result} = renderPicker(POLICY_ID);

        // Then no read is sent and the picker shows the categories or tags already in Onyx instead of a skeleton
        await waitFor(() => {
            expect(getIsLoading(result.current)).toBe(false);
        });
        expect(mockRead).not.toHaveBeenCalled();
    });

    it('dispatches a read on Search when the live policy grants access but the snapshot still holds a member role', async () => {
        // Given a user who was promoted to admin after the Search snapshot was taken, so the snapshot still says member
        await setCurrentUserRole(CONST.POLICY.ROLE.ADMIN);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${SEARCH_HASH}`, {
            data: {
                [POLICY_KEY]: {
                    id: POLICY_ID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    role: CONST.POLICY.ROLE.USER,
                    employeeList: {[CURRENT_USER_EMAIL]: {email: CURRENT_USER_EMAIL, role: CONST.POLICY.ROLE.USER}},
                },
            },
        });

        // When an inline picker for the workspace mounts on that Search page
        renderPickerOnSearch(POLICY_ID);

        // Then the read is sent, because the permission comes from the live policy rather than the outdated snapshot
        await waitFor(() => {
            expect(mockRead).toHaveBeenCalledWith(POLICY_ID);
        });
    });
});

describe('useLoadPolicyTags hasLoadedPolicyTags', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockOpenPolicyTagsPage.mockClear();
        await Onyx.clear();
    });

    it('stays false until the tags read completes, then becomes true', async () => {
        // Given an admin of a policy whose tags were never read in this session, so any cached collection may be partial
        await setCurrentUserRole(CONST.POLICY.ROLE.ADMIN);
        const {result} = renderHook(() => useLoadPolicyTags(POLICY_ID));

        // When the read is dispatched but has not completed
        await waitFor(() => {
            expect(mockOpenPolicyTagsPage).toHaveBeenCalledWith(POLICY_ID);
        });

        // Then the hook does not claim the tags are loaded, so callers do not trust the tag list count yet
        expect(result.current.hasLoadedPolicyTags).toBe(false);

        // When the read completes
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${POLICY_ID}`, {isLoading: false, hasOnceLoaded: true});

        // Then the hook reports the tags as loaded, since a completed read holds every tag list
        await waitFor(() => {
            expect(result.current.hasLoadedPolicyTags).toBe(true);
        });
    });
});
