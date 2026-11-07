import {renderHook, waitFor} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useShortMentionsList from '@hooks/useShortMentionsList';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
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

function UserDataProviders({children}: {children: React.ReactNode}) {
    return React.createElement(OnyxListItemProvider, null, React.createElement(CurrentUserPersonalDetailsProvider, null, children));
}

describe('useShortMentionsList', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@acme.com', accountID: ACCOUNT_ID_CURRENT_USER});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
    });

    it('returns usernames sharing the current user private domain', async () => {
        const {result} = renderHook(() => useShortMentionsList());

        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual(['user', 'coworker']);
        });
    });

    it('returns an empty list when the current user switches to a public domain', async () => {
        const {result} = renderHook(() => useShortMentionsList());

        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual(['user', 'coworker']);
        });

        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@gmail.com'});

        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual([]);
        });
    });

    it('shares one computed list across instances and does not re-render on unrelated personal details writes', async () => {
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

    it('returns the same lists when it re-renders with unchanged data', async () => {
        // Given the hook with both lists loaded
        const {result, rerender} = renderHook(() => useShortMentionsList(), {wrapper: UserDataProviders});
        await waitFor(() => {
            expect(result.current.availableLoginsList).toEqual(['user', 'coworker']);
            expect(result.current.currentUserMentions).toEqual(['user', 'user@acme.com']);
        });
        const {availableLoginsList, currentUserMentions} = result.current;

        // When the hook re-renders without any data change
        rerender({});

        // Then both lists keep their identity, because the composer's parser depends on them and a new list would register a new parser on every keystroke
        expect(result.current.availableLoginsList).toBe(availableLoginsList);
        expect(result.current.currentUserMentions).toBe(currentUserMentions);
    });

    it('updates when someone joins the domain', async () => {
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
