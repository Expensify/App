import {renderHook} from '@testing-library/react-native';

import usePolicyIcons from '@components/Avatar/connected/usePolicyIcons';

import * as useOnyxModule from '@hooks/useOnyx';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy123';
const OTHER_POLICY_ID = 'policy456';
const POLICY_NAME = 'Acme Workspace';
const OTHER_POLICY_NAME = 'Beta Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const FALLBACK_NAME = 'Pending Workspace';

const ACCOUNT_ID = 42;
const LOGIN = 'john@example.com';
const ACCOUNT_AVATAR_URL = 'https://example.com/uploaded-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

// Passthrough spy on `useOnyx`, so a test can assert which keys the hook subscribes to.
const useOnyxSpy = jest.spyOn(useOnyxModule, 'default');

describe('usePolicyIcons', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockPersonalDetails = {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, avatar: ACCOUNT_AVATAR_URL},
        };
        useOnyxSpy.mockClear();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['the uploaded avatar when the policy has one', {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL}, POLICY_AVATAR_URL, POLICY_NAME],
        // A workspace with no uploaded avatar stores an empty string, which has to fall through to the default avatar.
        ['the default avatar when avatarURL is an empty string', {id: POLICY_ID, name: POLICY_NAME, avatarURL: ''}, getDefaultWorkspaceAvatar(POLICY_NAME), POLICY_NAME],
        ['the default avatar when avatarURL is absent', {id: POLICY_ID, name: POLICY_NAME}, getDefaultWorkspaceAvatar(POLICY_NAME), POLICY_NAME],
    ])('should resolve %s', async (_case, policy, expectedSource, expectedName) => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePolicyIcons(POLICY_ID));

        expect(result.current).toEqual([
            {
                id: POLICY_ID,
                type: CONST.ICON_TYPE_WORKSPACE,
                source: expectedSource,
                name: expectedName,
            },
        ]);
    });

    it('should seed the icon from the fallback display name when the policy is not in Onyx', () => {
        const {result} = renderHook(() => usePolicyIcons(POLICY_ID, undefined, FALLBACK_NAME));

        expect(result.current).toEqual([
            {
                id: POLICY_ID,
                type: CONST.ICON_TYPE_WORKSPACE,
                source: getDefaultWorkspaceAvatar(FALLBACK_NAME),
                name: FALLBACK_NAME,
            },
        ]);
    });

    it('should fall back to the building avatar when neither the policy nor a fallback name is available', () => {
        const {result} = renderHook(() => usePolicyIcons(POLICY_ID));

        expect(result.current).toEqual([
            {
                id: POLICY_ID,
                type: CONST.ICON_TYPE_WORKSPACE,
                source: getDefaultWorkspaceAvatar(''),
                name: '',
            },
        ]);
    });

    it('should append the account icon after the workspace icon', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePolicyIcons(POLICY_ID, ACCOUNT_ID));

        expect(result.current).toHaveLength(2);
        expect(result.current.at(0)).toEqual(expect.objectContaining({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE}));
        expect(result.current.at(1)).toEqual(expect.objectContaining({id: ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, name: LOGIN}));
    });

    it('should resolve the icon again when the policy changes', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, {id: OTHER_POLICY_ID, name: OTHER_POLICY_NAME});
        await waitForBatchedUpdatesWithAct();

        const {result, rerender} = renderHook((policyID: string) => usePolicyIcons(policyID), {initialProps: POLICY_ID});
        rerender(OTHER_POLICY_ID);

        expect(result.current.at(0)).toEqual({
            id: OTHER_POLICY_ID,
            type: CONST.ICON_TYPE_WORKSPACE,
            source: getDefaultWorkspaceAvatar(OTHER_POLICY_NAME),
            name: OTHER_POLICY_NAME,
        });
    });

    it('should not subscribe to the whole policy collection when the policy ID is an empty string', () => {
        const {result} = renderHook(() => usePolicyIcons('', undefined, FALLBACK_NAME));

        // An empty policy ID has to resolve to a keyed miss, never to the collection root key.
        const subscribedKeys = useOnyxSpy.mock.calls.map(([key]) => key);
        expect(subscribedKeys).not.toContain(ONYXKEYS.COLLECTION.POLICY);
        expect(subscribedKeys).toContain(`${ONYXKEYS.COLLECTION.POLICY}undefined`);

        expect(result.current).toEqual([
            {
                id: '',
                type: CONST.ICON_TYPE_WORKSPACE,
                source: getDefaultWorkspaceAvatar(FALLBACK_NAME),
                name: FALLBACK_NAME,
            },
        ]);
    });
});
