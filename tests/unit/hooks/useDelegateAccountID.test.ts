import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import ONYXKEYS from '@src/ONYXKEYS';

const ACCOUNT_ID_ALICE = 1;
const ACCOUNT_ID_BOB = 2;
const ACCOUNT_ID_CAROL = 3;

describe('useDelegateAccountID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('returns the accountID of the delegate when both account and personal details are set', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@test.com'},
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, login: 'bob@test.com'},
        });
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'bob@test.com'}});

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBe(ACCOUNT_ID_BOB);
        });
    });

    it('matches the delegate email case-insensitively', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@test.com'},
        });
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'ALICE@TEST.COM'}});

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBe(ACCOUNT_ID_ALICE);
        });
    });

    it('returns undefined when there is no delegate set on the account', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@test.com'},
        });

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });
    });

    it('returns undefined when the delegate email does not match any personal detail', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@test.com'},
        });
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'unknown@test.com'}});

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });
    });

    it('returns undefined when personal details list is not set', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'bob@test.com'}});

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });
    });

    it('updates when the delegate email changes', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@test.com'},
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, login: 'bob@test.com'},
        });
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'alice@test.com'}});

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBe(ACCOUNT_ID_ALICE);
        });

        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'bob@test.com'}});

        await waitFor(() => {
            expect(result.current).toBe(ACCOUNT_ID_BOB);
        });
    });

    it('updates when the matching personal detail is added later', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'carol@test.com'}});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@test.com'},
        });

        const {result} = renderHook(() => useDelegateAccountID());

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_CAROL]: {accountID: ACCOUNT_ID_CAROL, login: 'carol@test.com'},
        });

        await waitFor(() => {
            expect(result.current).toBe(ACCOUNT_ID_CAROL);
        });
    });
});
