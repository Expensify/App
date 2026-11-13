import {act, renderHook} from '@testing-library/react-native';

import useMergeSyncResultsPage from '@hooks/useMergeSyncResultsPage';

import type MergeSyncResult from '@libs/API/MergeSyncResult';
import type {HRConnectionName} from '@libs/merge/HRUtils';
import type {RecruitingConnectionName} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ConnectionName, PolicyConnectionSyncProgress, PolicyConnectionSyncStage} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = '1A2B3C';
const SYNC_PROGRESS_KEY = `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${POLICY_ID}` as const;
const RESULTS_ROUTE = 'workspaces/1A2B3C/hr-sync-results';

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockIsFocused,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

// The real hook reads the owning screen's navigation state, which a hook test has no reason to build.
const mockBuildDynamicRoute = jest.fn((suffix: string) => `workspaces/${POLICY_ID}/${suffix}`);
jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => mockBuildDynamicRoute);

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
            callback();
            return {cancel: jest.fn()};
        }),
    },
}));

const mockNavigate = jest.mocked(Navigation.navigate);
const mockRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);
const RESULT = {addedEmployeesCount: 2, removedEmployeesCount: 1, skippedEmployees: [{id: '7', name: 'Al Ex', reason: 'No email address.'}]};
const RUNNING = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE;
const JOB_DONE = CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

/** Build one sync progress entry. Each backend update carries a fresh timestamp, therefore the caller supplies it. */
function syncProgress(
    stageInProgress: PolicyConnectionSyncStage,
    timestamp: string,
    result?: MergeSyncResult,
    connectionName: ConnectionName = CONST.POLICY.CONNECTIONS.NAME.GUSTO,
): PolicyConnectionSyncProgress {
    return {
        connectionName,
        stageInProgress,
        timestamp,
        ...(result ? {result} : {}),
    };
}

/** Push one backend update into Onyx the way the sync API does, then let the hook render on it. */
async function pushSyncProgress(...args: Parameters<typeof syncProgress>) {
    await act(async () => {
        await Onyx.merge(SYNC_PROGRESS_KEY, syncProgress(...args));
        await waitForBatchedUpdates();
    });
}

/** Toggle the app's modal state the way opening or closing a modal on top does, then let the hook render on it. */
async function setModalVisible(isVisible: boolean) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: isVisible});
        await waitForBatchedUpdates();
    });
}

async function renderWith(
    initialProgress: Parameters<typeof syncProgress>,
    connectedConnectionName: HRConnectionName | RecruitingConnectionName | undefined = CONST.POLICY.CONNECTIONS.NAME.GUSTO,
) {
    await pushSyncProgress(...initialProgress);
    return renderHook(() => useMergeSyncResultsPage(POLICY_ID, connectedConnectionName));
}

describe('useMergeSyncResultsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockIsFocused = true;
        mockNavigate.mockClear();
        mockBuildDynamicRoute.mockClear();
        mockRunAfterTransitions.mockReset();
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            callback();
            return {cancel: jest.fn()};
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('opens the results screen when the result arrives in a later update than the JOB_DONE stage', async () => {
        await renderWith([RUNNING, '2026-08-26 10:00:00.000']);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000');
        expect(mockNavigate).not.toHaveBeenCalled();

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:06.000', RESULT);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(RESULTS_ROUTE);
    });

    it('opens the results screen when the result arrives with the JOB_DONE stage', async () => {
        await renderWith([RUNNING, '2026-08-26 10:00:00.000']);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens the results screen one time when a result-less JOB_DONE update follows the result', async () => {
        await renderWith([RUNNING, '2026-08-26 10:00:00.000']);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);

        // Onyx merges the later update, therefore the result stays on the entry.
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:06.000');
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens nothing for a sync that finished before the hook mounted', async () => {
        await renderWith([JOB_DONE, '2026-08-26 10:00:05.000', RESULT]);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:06.000');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('opens the results screen for each sync the user runs', async () => {
        await renderWith([RUNNING, '2026-08-26 10:00:00.000']);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);
        expect(mockNavigate).toHaveBeenCalledTimes(1);

        await pushSyncProgress(RUNNING, '2026-08-26 10:05:00.000');
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:05:05.000', RESULT);
        expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it('opens the recruiting results screen for the connected recruiting provider', async () => {
        const mergeATS = CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS;
        await renderWith([RUNNING, '2026-08-26 10:00:00.000', undefined, mergeATS], mergeATS);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT, mergeATS);
        expect(mockBuildDynamicRoute).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_RECRUITING_SYNC_RESULTS.path);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens nothing for a sync of a connection other than the connected one', async () => {
        const xero = CONST.POLICY.CONNECTIONS.NAME.XERO;
        await renderWith([CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.XERO_SYNC_STEP, '2026-08-26 10:00:00.000', undefined, xero]);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT, xero);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('opens the results screen held back by a modal even once another integration takes the sync progress over', async () => {
        await renderWith([RUNNING, '2026-08-26 10:00:00.000']);
        await setModalVisible(true);

        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);
        expect(mockNavigate).not.toHaveBeenCalled();

        await pushSyncProgress(CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.XERO_SYNC_STEP, '2026-08-26 10:00:06.000', undefined, CONST.POLICY.CONNECTIONS.NAME.XERO);
        await setModalVisible(false);

        expect(mockBuildDynamicRoute).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('holds the results screen while the user is on another screen and opens it when they come back', async () => {
        // Given a sync that finishes while a modal holds its results screen back
        const {rerender} = await renderWith([RUNNING, '2026-08-26 10:00:00.000']);
        await setModalVisible(true);
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);

        // When the user moves to another screen before the results screen opens
        mockIsFocused = false;
        rerender({});
        await setModalVisible(false);

        // Then nothing opens on top of the other screen, which isn't a valid base for the results route
        expect(mockNavigate).not.toHaveBeenCalled();

        // When the user comes back to the screen that watched the sync
        mockIsFocused = true;
        rerender({});

        // Then the held results screen opens one time, built on that screen
        expect(mockBuildDynamicRoute).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(RESULTS_ROUTE);
    });

    it('cancels queued navigation on blur and opens results exactly once after refocus', async () => {
        // Given a completed sync whose navigation is waiting for a transition to finish
        const pendingCallbacks = new Set<Parameters<typeof TransitionTracker.runAfterTransitions>[0]['callback']>();
        const cancelHandles: jest.Mock[] = [];
        mockRunAfterTransitions.mockImplementation(({callback}) => {
            pendingCallbacks.add(callback);
            const cancel = jest.fn(() => pendingCallbacks.delete(callback));
            cancelHandles.push(cancel);
            return {cancel};
        });
        const flushTransitions = () => {
            act(() => {
                const callbacks = [...pendingCallbacks];
                pendingCallbacks.clear();
                for (const callback of callbacks) {
                    callback();
                }
            });
        };
        const {rerender} = await renderWith([RUNNING, '2026-08-26 10:00:00.000']);
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);
        expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);
        expect(mockRunAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(mockNavigate).not.toHaveBeenCalled();

        // When the user leaves before the transition finishes, cleanup must cancel the old navigation
        mockIsFocused = false;
        rerender({});
        expect(cancelHandles.at(0)).toHaveBeenCalledTimes(1);
        expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);
        flushTransitions();

        // Then no results open over the other screen
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockBuildDynamicRoute).not.toHaveBeenCalled();

        // When the user returns, a fresh transition can open the held result
        mockIsFocused = true;
        rerender({});
        expect(mockRunAfterTransitions).toHaveBeenCalledTimes(2);
        expect(mockNavigate).not.toHaveBeenCalled();
        flushTransitions();

        // Then the result opens once and is consumed, even if focus changes again
        expect(mockBuildDynamicRoute).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(RESULTS_ROUTE);
        mockIsFocused = false;
        rerender({});
        mockIsFocused = true;
        rerender({});
        flushTransitions();
        expect(mockRunAfterTransitions).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens the results screen over an RHP that is still open', async () => {
        // Given a sync started from the HR panel, which leaves the modal state visible for as long as the RHP is open
        await renderWith([RUNNING, '2026-08-26 10:00:00.000']);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {isVisible: true, willAlertModalBecomeVisible: false});
            await waitForBatchedUpdates();
        });

        // When the sync finishes
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);

        // Then the results open right away on top of the panel, since nothing is opening over it
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('opens nothing on a screen that was covered for the whole sync', async () => {
        // Given Connections covered by its HR panel while a sync runs and finishes, so the panel is the one showing the results
        mockIsFocused = false;
        const {rerender} = await renderWith([RUNNING, '2026-08-26 10:00:00.000']);
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);

        // When the panel closes and Connections is focused again
        mockIsFocused = true;
        rerender({});
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then Connections opens nothing, so the results are never opened a second time
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('opens nothing on a screen that was covered partway through the sync', async () => {
        // Given Connections watching a sync that started while it was showing, then covered by its HR panel before the sync finishes
        const {rerender} = await renderWith([RUNNING, '2026-08-26 10:00:00.000']);
        mockIsFocused = false;
        rerender({});
        await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);

        // When the panel closes and Connections is focused again
        mockIsFocused = true;
        rerender({});
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then Connections opens nothing, because the panel on top already showed these results
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    describe('without a connection to watch', () => {
        it('opens the results screen for whichever HR or recruiting provider syncs', async () => {
            await renderWith([RUNNING, '2026-08-26 10:00:00.000'], undefined);

            await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT);
            expect(mockBuildDynamicRoute).toHaveBeenCalledWith(DYNAMIC_ROUTES.WORKSPACE_HR_SYNC_RESULTS.path);
            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });

        it('opens nothing for a non-HR connection', async () => {
            const xero = CONST.POLICY.CONNECTIONS.NAME.XERO;
            await renderWith([CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.XERO_SYNC_STEP, '2026-08-26 10:00:00.000', undefined, xero], undefined);

            await pushSyncProgress(JOB_DONE, '2026-08-26 10:00:05.000', RESULT, xero);
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
