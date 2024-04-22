import Onyx from 'react-native-onyx';
import * as AppImport from '@libs/actions/App';
import * as OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager';
import * as ApplyUpdatesImport from '@libs/actions/OnyxUpdateManager/utils/applyUpdates';
import deferredUpdatesProxy from '@libs/actions/OnyxUpdateManager/utils/deferredUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const createTriggerPromise = () => {
    let trigger: () => void = () => undefined;
    const resetPromise = () =>
        new Promise<void>((resolve) => {
            trigger = resolve;
        });
    const promise = resetPromise();

    return {promise, trigger, resetPromise};
};

type AppActionsMock = typeof AppImport & {
    lastUpdateIdFromUpdatesProxy: Record<'lastUpdateIdFromUpdates', number>;
    getMissingOnyxUpdates: jest.Mock<Promise<void[]>>;
    getMissingOnyxUpdatesTriggeredPromise: Promise<void>;
    getMissingOnyxUpdatesDonePromise: Promise<void>;
};

jest.mock('@libs/actions/App', () => {
    const AppImplementation: typeof AppImport = jest.requireActual('@libs/actions/App');
    const AppOnyx: typeof Onyx = jest.requireActual('react-native-onyx').default;
    const APP_ONYXKEYS: typeof ONYXKEYS = jest.requireActual('@src/ONYXKEYS').default;
    const appCreateProxyForValue = jest.requireActual('@src/utils/createProxyForValue').default;

    const lastUpdateIdFromUpdatesValueInternal = {lastUpdateIdFromUpdates: 2};
    const lastUpdateIdFromUpdatesProxy = appCreateProxyForValue(lastUpdateIdFromUpdatesValueInternal, 'lastUpdateIdFromUpdates');
    const {lastUpdateIdFromUpdates} = lastUpdateIdFromUpdatesValueInternal;

    const {promise: getMissingOnyxUpdatesTriggeredPromise, trigger: getMissingOnyxUpdatesWasTriggered, resetPromise: resetGetMissingOnyxUpdatesTriggeredPromise} = createTriggerPromise();
    const {promise: getMissingOnyxUpdatesDonePromise, trigger: getMissingOnyxUpdatesDone, resetPromise: resetGetMissingOnyxUpdatesDonePromise} = createTriggerPromise();

    return {
        ...AppImplementation,
        lastUpdateIdFromUpdatesProxy,
        finalReconnectAppAfterActivatingReliableUpdates: jest.fn(() => Promise.resolve()),
        getMissingOnyxUpdatesTriggeredPromise,
        getMissingOnyxUpdatesDonePromise,
        getMissingOnyxUpdates: jest.fn(() => {
            resetGetMissingOnyxUpdatesDonePromise();
            getMissingOnyxUpdatesWasTriggered();

            const promise = AppOnyx.set(APP_ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIdFromUpdates);

            promise.finally(() => {
                getMissingOnyxUpdatesDone();
                resetGetMissingOnyxUpdatesTriggeredPromise();
            });

            return promise;
        }),
    } as AppActionsMock;
});

type ApplyUpdatesMock = typeof ApplyUpdatesImport & {
    applyUpdates: jest.Mock<Promise<void[]>>;
    applyUpdatesTriggeredPromise: Promise<void>;
};

jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates', () => {
    const AppOnyx: typeof Onyx = jest.requireActual('react-native-onyx').default;
    const APP_ONYXKEYS: typeof ONYXKEYS = jest.requireActual('@src/ONYXKEYS').default;

    const {promise: applyUpdatesTriggeredPromise, trigger: applyUpdatesTriggered, resetPromise: resetApplyUpdatesTriggeredPromise} = createTriggerPromise();

    return {
        applyUpdatesTriggeredPromise,
        applyUpdates: jest.fn((updates: DeferredUpdatesDictionary) => {
            applyUpdatesTriggered();

            const lastUpdateIdFromUpdates = Math.max(...Object.keys(updates).map(Number));

            const promise = AppOnyx.set(APP_ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIdFromUpdates);

            promise.finally(() => {
                resetApplyUpdatesTriggeredPromise();
            });

            return promise;
        }),
    } as ApplyUpdatesMock;
});

const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;
const {applyUpdates} = ApplyUpdates;

const createMockUpdate = (lastUpdateID: number): OnyxUpdatesFromServer => ({
    type: 'https',
    lastUpdateID,
    previousUpdateID: lastUpdateID - 1,
    request: {
        command: 'TestCommand',
        successData: [],
        failureData: [],
        finallyData: [],
        optimisticData: [],
    },
    response: {
        lastUpdateID,
        previousUpdateID: lastUpdateID - 1,
    },
    updates: [
        {
            eventType: 'test',
            data: [],
        },
    ],
});
const mockUpdate3 = createMockUpdate(3);
const mockUpdate4 = createMockUpdate(4);
const mockUpdate5 = createMockUpdate(5);
const mockUpdate6 = createMockUpdate(6);

const resetOnyxUpdateManager = async () => {
    App.lastUpdateIdFromUpdatesProxy.lastUpdateIdFromUpdates = 2;
    await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
    OnyxUpdateManager.resetDeferralLogicVariables();
};

describe('OnyxUpdateManager', () => {
    let lastUpdateIDAppliedToClient = 1;

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await resetOnyxUpdateManager();
        Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => (lastUpdateIDAppliedToClient = value ?? 1),
        });
        return waitForBatchedUpdates();
    });

    it('should fetch missing Onyx updates once, defer updates and apply after missing updates', () => {
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);

        return App.getMissingOnyxUpdatesTriggeredPromise
            .then(() => {
                expect(Object.keys(deferredUpdatesProxy.deferredUpdates)).toHaveLength(3);
            })
            .then(waitForBatchedUpdates)
            .then(() => OnyxUpdateManager.queryPromise)
            ?.then(() => {
                expect(lastUpdateIDAppliedToClient).toBe(5);
                expect(applyUpdates).toHaveBeenCalledTimes(1);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(applyUpdates).toHaveBeenCalledWith({3: mockUpdate3, 4: mockUpdate4, 5: mockUpdate5});
            });
    });

    it('should only apply deferred updates that are after the locally applied update', async () => {
        App.lastUpdateIdFromUpdatesProxy.lastUpdateIdFromUpdates = 3;

        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);

        return App.getMissingOnyxUpdatesTriggeredPromise
            .then(() => {
                expect(Object.keys(deferredUpdatesProxy.deferredUpdates)).toHaveLength(3);
                Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            })
            .then(waitForBatchedUpdates)
            .then(() => OnyxUpdateManager.queryPromise)
            ?.then(() => {
                expect(lastUpdateIDAppliedToClient).toBe(6);
                expect(applyUpdates).toHaveBeenCalledTimes(1);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(applyUpdates).toHaveBeenCalledWith({6: mockUpdate6});
            });
    });
});
