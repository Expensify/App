import {renderHook, waitFor} from '@testing-library/react-native';

import useTimeSensitiveHomeAddress from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveHomeAddress';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const CURRENT_USER_EMAIL = 'member@expensify.com';
const POLICY_ID = '1';

function makeHomeAndOfficePolicy(isOfficeWorkArrangement?: boolean, hasOfficeWorkArrangement?: boolean): Policy {
    return {
        ...createRandomPolicy(Number(POLICY_ID)),
        commuterExclusions: {
            method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            ...(isOfficeWorkArrangement === undefined ? {} : {isOfficeWorkArrangement}),
        },
        employeeList: {[CURRENT_USER_EMAIL]: {email: CURRENT_USER_EMAIL, ...(hasOfficeWorkArrangement === undefined ? {} : {hasOfficeWorkArrangement})}},
    };
}

async function setUpWorkspace(policy: Policy) {
    await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL});
    await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: []});
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await waitForBatchedUpdates();
}

describe('useTimeSensitiveHomeAddress', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('asks for an address when the member is office-based under the workspace default', async () => {
        // Given an office-based workspace measuring commutes from home, and a member who never saved an address
        await setUpWorkspace(makeHomeAndOfficePolicy(true));

        // When the time sensitive items are resolved
        const {result} = renderHook(() => useTimeSensitiveHomeAddress());

        // Then the task appears, because their commute is measured from their home
        await waitFor(() => {
            expect(result.current.shouldShowAddHomeAddress).toBe(true);
        });
    });

    it('asks for an address when the workspace never saved an arrangement', async () => {
        // Given a workspace that turned the method on before the arrangement setting existed, so it stored neither
        await setUpWorkspace(makeHomeAndOfficePolicy());

        // When the time sensitive items are resolved
        const {result} = renderHook(() => useTimeSensitiveHomeAddress());

        // Then the task appears, because such a workspace measured every member's commute
        await waitFor(() => {
            expect(result.current.shouldShowAddHomeAddress).toBe(true);
        });
    });

    it('stays quiet when the workspace default is no regular workplace', async () => {
        // Given a workspace on the method whose members have no regular workplace
        await setUpWorkspace(makeHomeAndOfficePolicy(false));

        // When the time sensitive items are resolved
        const {result} = renderHook(() => useTimeSensitiveHomeAddress());

        // Then nothing is measured against their home, so there is nothing to ask them for
        await waitFor(() => {
            expect(result.current.shouldShowAddHomeAddress).toBe(false);
        });
    });

    it("stays quiet when the member's own arrangement overrides an office-based default", async () => {
        // Given an office-based workspace where this member was given their own no-regular-workplace arrangement
        await setUpWorkspace(makeHomeAndOfficePolicy(true, false));

        // When the time sensitive items are resolved
        const {result} = renderHook(() => useTimeSensitiveHomeAddress());

        // Then their own arrangement wins and the task stays hidden
        await waitFor(() => {
            expect(result.current.shouldShowAddHomeAddress).toBe(false);
        });
    });

    it("asks for an address when the member's own arrangement overrides a no-regular-workplace default", async () => {
        // Given a no-regular-workplace workspace where this member was given their own office-based arrangement
        await setUpWorkspace(makeHomeAndOfficePolicy(false, true));

        // When the time sensitive items are resolved
        const {result} = renderHook(() => useTimeSensitiveHomeAddress());

        // Then the task appears, because the server will measure their commute and block the expense without it
        await waitFor(() => {
            expect(result.current.shouldShowAddHomeAddress).toBe(true);
        });
    });
});
