import {act, renderHook, waitFor} from '@testing-library/react-native';

import {SearchQueryContext} from '@components/Search/SearchContext';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {SearchQueryContextValue} from '@components/Search/types';

import useCreateReport from '@hooks/useCreateReport';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {PropsWithChildren, ReactNode} from 'react';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * End-to-end check of the domain "preferred workspace" lock in useCreateReport, driven by real Onyx data through the real
 * usePreferredPolicy / useUserSecurityGroup chain. The mocked-useOnyx suite in useCreateReportTest cannot catch a broken
 * link in that chain, which is how #102130 shipped.
 */

// Plain literals on purpose: USER_EMAIL is read by a jest.mock factory, so babel hoists its declaration above the
// others and deriving it from USER_DOMAIN would evaluate to `user@undefined`.
const USER_DOMAIN = 'example.com';
const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 1;
const SECURITY_GROUP_ID = '123456';
const DOMAIN_ACCOUNT_ID = 42;
const ACTIVE_POLICY_ID = 'active-1';
const PREFERRED_POLICY_ID = 'preferred-1';
const OTHER_POLICY_ID = 'other-1';
const SEARCH_HASH = 987654;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: USER_ACCOUNT_ID, login: USER_EMAIL}),
}));

jest.mock('@hooks/useShouldShowEmptyReportConfirmation', () => jest.fn(() => false));

jest.mock('@hooks/useCreateEmptyReportConfirmation', () =>
    jest.fn(() => ({
        openCreateReportConfirmation: jest.fn(),
        CreateReportConfirmationModal: null,
    })),
);

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((cb: () => void) => cb()));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

function makeTeamPolicy(id: string): Policy {
    return createMock<Policy>({
        id,
        name: `${id} workspace`,
        role: CONST.POLICY.ROLE.USER,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'owner@example.com',
        ownerAccountID: 99,
        outputCurrency: CONST.CURRENCY.USD,
        employeeList: {},
    });
}

type SecurityGroupFixture = {
    /** Whether the membership entry uses the object form (sharedNVP key) or the legacy string form (securityGroup_ key) */
    membershipShape: 'sharedNVP' | 'legacy';
    isRestrictionEnabled: boolean;
};

async function setSecurityGroup({membershipShape, isRestrictionEnabled}: SecurityGroupFixture) {
    const securityGroup = {enableRestrictedPrimaryPolicy: isRestrictionEnabled, restrictedPrimaryPolicyID: PREFERRED_POLICY_ID};
    if (membershipShape === 'sharedNVP') {
        await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[USER_DOMAIN]: {securityGroupID: SECURITY_GROUP_ID, ownerAccountID: DOMAIN_ACCOUNT_ID}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${SECURITY_GROUP_ID}_${DOMAIN_ACCOUNT_ID}`, securityGroup);
        return;
    }
    await Onyx.set(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[USER_DOMAIN]: SECURITY_GROUP_ID});
    await Onyx.set(`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${SECURITY_GROUP_ID}`, securityGroup);
}

async function setWorkspaces(preferredPolicy: Policy) {
    const activePolicy = makeTeamPolicy(ACTIVE_POLICY_ID);
    const otherPolicy = makeTeamPolicy(OTHER_POLICY_ID);
    await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
    await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, ACTIVE_POLICY_ID);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${ACTIVE_POLICY_ID}`, activePolicy);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, otherPolicy);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${PREFERRED_POLICY_ID}`, preferredPolicy);
}

/** Mirrors the Reports empty view, which renders the create flow inside SearchScopeProvider with an active search hash */
function SearchScopeWrapper({children}: PropsWithChildren) {
    return (
        <SearchScopeProvider>
            <SearchQueryContext.Provider value={createMock<SearchQueryContextValue>({currentSearchHash: SEARCH_HASH})}>{children}</SearchQueryContext.Provider>
        </SearchScopeProvider>
    );
}

async function renderAndPress(wrapper?: (props: PropsWithChildren) => ReactNode) {
    const onCreateReport = jest.fn();
    const {result} = renderHook(() => useCreateReport({onCreateReport}), {wrapper});
    await waitFor(() => expect(result.current.isVisible).toBe(true));

    act(() => {
        result.current.createReport();
    });
    return onCreateReport;
}

describe('useCreateReport domain preferred workspace (real Onyx)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each([
        ['the security group lives under the sharedNVP key', 'sharedNVP'],
        ['the security group lives under the legacy securityGroup_ key', 'legacy'],
    ] as const)('creates on the preferred workspace instead of the active one when %s', async (_description, membershipShape) => {
        // Given a member of three workspaces whose domain security group locks them to a workspace that is not their active one
        await setSecurityGroup({membershipShape, isRestrictionEnabled: true});
        await setWorkspaces(makeTeamPolicy(PREFERRED_POLICY_ID));

        // When they press "Create report"
        const onCreateReport = await renderAndPress();

        // Then the report goes to the preferred workspace and no selector opens
        expect(onCreateReport).toHaveBeenCalledWith(expect.objectContaining({id: PREFERRED_POLICY_ID}), false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('creates on the active workspace when the security group does not enable the restriction', async () => {
        // Given a security group that names a preferred workspace but has the restriction switched off
        await setSecurityGroup({membershipShape: 'sharedNVP', isRestrictionEnabled: false});
        await setWorkspaces(makeTeamPolicy(PREFERRED_POLICY_ID));

        // When they press "Create report"
        const onCreateReport = await renderAndPress();

        // Then the user's own default workspace is used
        expect(onCreateReport).toHaveBeenCalledWith(expect.objectContaining({id: ACTIVE_POLICY_ID}), false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('falls back to the active workspace when the user is not a member of the preferred workspace', async () => {
        // Given the restriction points at a workspace the user is not in, so Onyx only holds the backend's {id, name} stub for it
        await setSecurityGroup({membershipShape: 'sharedNVP', isRestrictionEnabled: true});
        await setWorkspaces(createMock<Policy>({id: PREFERRED_POLICY_ID, name: 'Preferred'}));

        // When they press "Create report"
        const onCreateReport = await renderAndPress();

        // Then the lock cannot be honoured and the normal rules apply: the eligible active workspace is used
        expect(onCreateReport).toHaveBeenCalledWith(expect.objectContaining({id: ACTIVE_POLICY_ID}), false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('creates on the preferred workspace when rendered inside the Search scope whose snapshot lacks it', async () => {
        // Given a domain-locked user, and a Search snapshot (what the Reports empty view reads from) that only holds the active
        // workspace, so a snapshot-backed read would miss the preferred workspace and silently drop the lock
        await setSecurityGroup({membershipShape: 'sharedNVP', isRestrictionEnabled: true});
        await setWorkspaces(makeTeamPolicy(PREFERRED_POLICY_ID));
        const activePolicySnapshotKey = `${ONYXKEYS.COLLECTION.POLICY}${ACTIVE_POLICY_ID}` as const;
        await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${SEARCH_HASH}`, {data: {[activePolicySnapshotKey]: makeTeamPolicy(ACTIVE_POLICY_ID)}});

        // When they press "Create report" from inside the Search scope
        const onCreateReport = await renderAndPress(SearchScopeWrapper);

        // Then the hook reads live policies and the report still goes to the preferred workspace
        expect(onCreateReport).toHaveBeenCalledWith(expect.objectContaining({id: PREFERRED_POLICY_ID}), false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
