import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePersonalDetailsByEmail from '@hooks/usePersonalDetailsByEmail';
import ONYXKEYS from '@src/ONYXKEYS';

const ACCOUNT_ID_ALICE = 1;
const ACCOUNT_ID_BOB = 2;

describe('usePersonalDetailsByEmail', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should remap personal details by email', async () => {
        const personalDetailsList = {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: 'alice@test.com'},
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, displayName: 'Bob', login: 'bob@test.com'},
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const {result} = renderHook(() => usePersonalDetailsByEmail());

        await waitFor(() => {
            expect(result.current).toBeDefined();
            expect(result.current?.['alice@test.com']).toEqual(personalDetailsList[ACCOUNT_ID_ALICE]);
            expect(result.current?.['bob@test.com']).toEqual(personalDetailsList[ACCOUNT_ID_BOB]);
        });
    });

    it('should fall back to the original key when login is missing', async () => {
        const personalDetailsList = {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice'},
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const {result} = renderHook(() => usePersonalDetailsByEmail());

        await waitFor(() => {
            expect(result.current).toBeDefined();
            expect(result.current?.[String(ACCOUNT_ID_ALICE)]).toEqual(personalDetailsList[ACCOUNT_ID_ALICE]);
        });
    });

    it('should return undefined when personal details list is not set', () => {
        const {result} = renderHook(() => usePersonalDetailsByEmail());

        expect(result.current).toBeUndefined();
    });

    it('should update when personal details change in Onyx', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: 'alice@test.com'},
        });

        const {result} = renderHook(() => usePersonalDetailsByEmail());

        await waitFor(() => {
            expect(result.current?.['alice@test.com']).toBeDefined();
            expect(result.current?.['bob@test.com']).toBeUndefined();
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, displayName: 'Bob', login: 'bob@test.com'},
        });

        await waitFor(() => {
            expect(result.current?.['bob@test.com']).toBeDefined();
            expect(result.current?.['bob@test.com']?.accountID).toBe(ACCOUNT_ID_BOB);
        });
    });
});
