import {renderHook, waitFor} from '@testing-library/react-native';

import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';

import type * as PolicyCategory from '@libs/actions/Policy/Category';
import type * as PolicyTag from '@libs/actions/Policy/Tag';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Both hooks own the picker's loading flag. Without a policyID no read is ever dispatched, so the loading state key
 * stays absent forever and the flag has to settle on false, otherwise the picker sits on a skeleton for good.
 */

const POLICY_ID = 'A1B2C3';

const mockGetPolicyCategories = jest.fn();
const mockOpenPolicyTagsPage = jest.fn();

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
        getIsLoading: (result: {isLoadingPolicyCategories?: boolean; isLoadingPolicyTags?: boolean}) => result.isLoadingPolicyCategories,
        mockRead: mockGetPolicyCategories,
    },
    {
        name: 'useLoadPolicyTags',
        renderPicker: (policyID: string | undefined) => renderHook(() => useLoadPolicyTags(policyID)),
        getIsLoading: (result: {isLoadingPolicyCategories?: boolean; isLoadingPolicyTags?: boolean}) => result.isLoadingPolicyTags,
        mockRead: mockOpenPolicyTagsPage,
    },
] as const;

describe.each(hooks)('$name', ({renderPicker, getIsLoading, mockRead}) => {
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

    it('reports loading and dispatches a read when a policyID is given and nothing is cached', async () => {
        const {result} = renderPicker(POLICY_ID);

        await waitFor(() => {
            expect(mockRead).toHaveBeenCalledWith(POLICY_ID);
        });
        expect(getIsLoading(result.current)).toBe(true);
    });
});
