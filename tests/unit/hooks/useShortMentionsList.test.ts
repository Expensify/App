import {renderHook, waitFor} from '@testing-library/react-native';

import useShortMentionsList from '@hooks/useShortMentionsList';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID_CURRENT_USER = 1;
const ACCOUNT_ID_COWORKER = 2;
const ACCOUNT_ID_STRANGER = 3;
const ACCOUNT_ID_NEW_HIRE = 4;

const personalDetailsList = {
    [ACCOUNT_ID_CURRENT_USER]: {accountID: ACCOUNT_ID_CURRENT_USER, login: 'user@acme.com'},
    [ACCOUNT_ID_COWORKER]: {accountID: ACCOUNT_ID_COWORKER, login: 'coworker@acme.com'},
    [ACCOUNT_ID_STRANGER]: {accountID: ACCOUNT_ID_STRANGER, login: 'stranger@gmail.com'},
};

describe('useShortMentionsList', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@acme.com', accountID: ACCOUNT_ID_CURRENT_USER});
    });

    it('returns usernames sharing the current user private domain', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const {result} = renderHook(() => useShortMentionsList());

        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual(['user', 'coworker']);
        });
    });

    it('returns an empty list when the current user is on a public domain', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@gmail.com'});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const {result} = renderHook(() => useShortMentionsList());
        await waitForBatchedUpdates();

        expect(result.current.availableLoginsList).toEqual([]);
    });

    it('shares one computed list across instances and does not re-render on unrelated personal details writes', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        let renderCount = 0;
        const first = renderHook(() => {
            renderCount++;
            return useShortMentionsList();
        });
        const second = renderHook(() => useShortMentionsList());

        await waitFor(() => {
            expect(first.result.current.availableLoginsList).toEqual(['user', 'coworker']);
        });

        expect(second.result.current.availableLoginsList).toBe(first.result.current.availableLoginsList);

        const listBefore = first.result.current.availableLoginsList;
        const rendersBefore = renderCount;

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_COWORKER]: {avatar: 'https://example.com/new-avatar.png'},
        });
        await waitForBatchedUpdates();

        expect(first.result.current.availableLoginsList).toBe(listBefore);
        expect(renderCount).toBe(rendersBefore);
    });

    it('updates when someone joins the domain', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const {result} = renderHook(() => useShortMentionsList());

        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual(['user', 'coworker']);
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_NEW_HIRE]: {accountID: ACCOUNT_ID_NEW_HIRE, login: 'newcomer@acme.com'},
        });

        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual(['user', 'coworker', 'newcomer']);
        });
    });
});
