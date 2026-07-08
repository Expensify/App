import {act, renderHook, waitFor} from '@testing-library/react-native';

import useChatWithAgent from '@hooks/useChatWithAgent';
import useOpenDMWithCreatedAgent from '@hooks/useOpenDMWithCreatedAgent';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useChatWithAgent');
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));

const mockChatWithAgent = jest.fn();
const mockUseChatWithAgent = jest.mocked(useChatWithAgent);
const mockGoBack = jest.mocked(Navigation.goBack);

const OPTIMISTIC_ACCOUNT_ID = -123456;
const REAL_ACCOUNT_ID = 22542959;
const optimisticAgentKey: OnyxKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${OPTIMISTIC_ACCOUNT_ID}`;
const realAgentKey: OnyxKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${REAL_ACCOUNT_ID}`;

describe('useOpenDMWithCreatedAgent', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockUseChatWithAgent.mockReturnValue(mockChatWithAgent);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('does nothing until asked to watch for a created agent', async () => {
        renderHook(() => useOpenDMWithCreatedAgent());

        await act(async () => {
            await Onyx.merge(realAgentKey, {});
            await waitForBatchedUpdates();
        });

        expect(mockChatWithAgent).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('opens the DM with the created agent once it appears, ignoring the optimistic entry', async () => {
        const {result} = renderHook(() => useOpenDMWithCreatedAgent());

        act(() => result.current(OPTIMISTIC_ACCOUNT_ID));
        await act(async () => {
            await Onyx.merge(optimisticAgentKey, {pendingAction: 'add'});
            await waitForBatchedUpdates();
        });
        expect(mockChatWithAgent).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.merge(realAgentKey, {});
            await waitForBatchedUpdates();
        });

        await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
        expect(mockChatWithAgent).toHaveBeenCalledTimes(1);
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('ignores another agent that is still an optimistic (pending ADD) entry', async () => {
        const {result} = renderHook(() => useOpenDMWithCreatedAgent());
        const otherOptimisticAgentKey: OnyxKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}999`;

        act(() => result.current(OPTIMISTIC_ACCOUNT_ID));
        await act(async () => {
            await Onyx.merge(optimisticAgentKey, {pendingAction: 'add'});
            await waitForBatchedUpdates();
        });

        // A second agent the user created shows up as a new optimistic entry (pendingAction ADD).
        // It must not be picked as the created agent.
        await act(async () => {
            await Onyx.merge(otherOptimisticAgentKey, {pendingAction: 'add'});
            await waitForBatchedUpdates();
        });
        expect(mockChatWithAgent).not.toHaveBeenCalled();

        // The created agent arrives from the server without an ADD pending action.
        await act(async () => {
            await Onyx.merge(realAgentKey, {});
            await waitForBatchedUpdates();
        });

        await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
    });

    it('does not treat an agent that loads after watching starts as the newly created one', async () => {
        // Cold open or direct link: the collection has not loaded yet when watching starts.
        const {result} = renderHook(() => useOpenDMWithCreatedAgent());
        const preExistingAgentKey: OnyxKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}555`;

        act(() => result.current(OPTIMISTIC_ACCOUNT_ID));

        // An existing agent loads before our optimistic entry. It must not be picked, since we don't record
        // existing agents until our entry is present.
        await act(async () => {
            await Onyx.merge(preExistingAgentKey, {});
            await waitForBatchedUpdates();
        });
        expect(mockChatWithAgent).not.toHaveBeenCalled();

        // The optimistic entry appears, so the existing agent is now recorded as already existing.
        await act(async () => {
            await Onyx.merge(optimisticAgentKey, {pendingAction: 'add'});
            await waitForBatchedUpdates();
        });
        expect(mockChatWithAgent).not.toHaveBeenCalled();

        // Only the created agent opens the DM.
        await act(async () => {
            await Onyx.merge(realAgentKey, {});
            await waitForBatchedUpdates();
        });

        await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledWith(REAL_ACCOUNT_ID, {shouldDismissModal: true}));
    });

    it('goes back instead of opening a DM when creation fails', async () => {
        const {result} = renderHook(() => useOpenDMWithCreatedAgent());

        act(() => result.current(OPTIMISTIC_ACCOUNT_ID));
        await act(async () => {
            await Onyx.merge(optimisticAgentKey, {pendingAction: 'add'});
            await waitForBatchedUpdates();
        });

        // Creation failed: the optimistic entry now has an error.
        await act(async () => {
            await Onyx.merge(optimisticAgentKey, {pendingAction: 'add', errors: {error: 'genericAdd'}});
            await waitForBatchedUpdates();
        });

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledTimes(1));
        expect(mockChatWithAgent).not.toHaveBeenCalled();
    });

    it('stops watching after opening a DM, and does not react to further collection changes', async () => {
        const {result} = renderHook(() => useOpenDMWithCreatedAgent());

        act(() => result.current(OPTIMISTIC_ACCOUNT_ID));
        await act(async () => {
            await Onyx.merge(optimisticAgentKey, {pendingAction: 'add'});
            await waitForBatchedUpdates();
        });
        await act(async () => {
            await Onyx.merge(realAgentKey, {});
            await waitForBatchedUpdates();
        });
        await waitFor(() => expect(mockChatWithAgent).toHaveBeenCalledTimes(1));

        const unrelatedAgentKey: OnyxKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}777`;
        await act(async () => {
            await Onyx.merge(unrelatedAgentKey, {});
            await waitForBatchedUpdates();
        });

        expect(mockChatWithAgent).toHaveBeenCalledTimes(1);
        expect(mockGoBack).not.toHaveBeenCalled();
    });
});
