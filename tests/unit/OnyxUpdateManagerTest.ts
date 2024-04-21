import Onyx from 'react-native-onyx';
import * as AppImport from '@libs/actions/App';
import * as OnyxUpdateManagerImport from '@libs/actions/OnyxUpdateManager';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const lastAppliedMissingUpdateIDOnyxKey = 'lastAppliedMissingUpdateID';

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
    getMissingOnyxUpdates: jest.Mock<Promise<void[]>>;
    getMissingOnyxUpdatesTriggeredPromise: Promise<void>;
};

jest.mock('@libs/actions/App', () => {
    const AppImplementation: typeof AppImport = jest.requireActual('@libs/actions/App');
    const AppOnyx: typeof Onyx = jest.requireActual('react-native-onyx').default;
    const APP_ONYXKEYS: typeof ONYXKEYS = jest.requireActual('@src/ONYXKEYS').default;

    let appLastAppliedMissingUpdateID = 2;
    AppOnyx.connect({
        // @ts-expect-error ignore invalid onyx key
        key: 'lastAppliedMissingUpdateID',
        callback: (value) => (appLastAppliedMissingUpdateID = (value as number | null) ?? 2),
    });

    const {promise: getMissingOnyxUpdatesTriggeredPromise, trigger: getMissingOnyxUpdatesWasTriggered, resetPromise: resetGetMissingOnyxUpdatesPromise} = createTriggerPromise();

    return {
        ...AppImplementation,
        finalReconnectAppAfterActivatingReliableUpdates: jest.fn(() => Promise.resolve()),
        getMissingOnyxUpdatesTriggeredPromise,
        getMissingOnyxUpdates: jest.fn(() => {
            getMissingOnyxUpdatesWasTriggered();

            const promise = AppOnyx.set(APP_ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, appLastAppliedMissingUpdateID);

            promise.finally(() => {
                resetGetMissingOnyxUpdatesPromise();
            });

            return promise;
        }),
    } as AppActionsMock;
});

type OnyxUpdateManagerMock = typeof OnyxUpdateManagerImport & {
    applyUpdates: jest.Mock<Promise<Response[]>>;
    applyUpdatesTriggeredPromise: Promise<void>;
};

jest.mock('@libs/actions/OnyxUpdateManager', () => {
    const OnyxUpdateManagerImplementation: typeof OnyxUpdateManagerImport = jest.requireActual('@libs/actions/OnyxUpdateManager');

    const {promise: applyUpdatesTriggeredPromise, trigger: applyUpdatesTriggered, resetPromise: resetApplyUpdatesTriggeredPromise} = createTriggerPromise();

    // return {
    //     ...OnyxUpdateManagerImplementation,
    //     applyUpdatesTriggeredPromise,
    //     applyUpdates: jest.fn((updates: DeferredUpdatesDictionary) => {
    //         applyUpdatesTriggered();

    //         const promise = OnyxUpdateManagerImplementation.applyUpdates(updates);

    //         promise.finally(() => {
    //             resetApplyUpdatesTriggeredPromise();
    //         });

    //         return promise;
    //     }),
    // } as OnyxUpdateManagerMock;

    return new Proxy(OnyxUpdateManagerImplementation, {
        get: (target, prop) => {
            switch (prop) {
                case 'applyUpdatesTriggeredPromise':
                    return applyUpdatesTriggeredPromise;
                case 'applyUpdates':
                    return jest.fn((updates: DeferredUpdatesDictionary) => {
                        applyUpdatesTriggered();

                        console.log('apply updates triggered');

                        const promise = OnyxUpdateManagerImplementation.applyUpdates(updates);

                        promise.finally(() => {
                            resetApplyUpdatesTriggeredPromise();
                        });

                        return promise;
                    });
                default:
                    return target[prop as keyof typeof OnyxUpdateManagerImport];
            }
        },
    }) as OnyxUpdateManagerMock;
});

const App = AppImport as AppActionsMock;
const OnyxUpdateManager = OnyxUpdateManagerImport as OnyxUpdateManagerMock;

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
    // @ts-expect-error ignore invalid onyx key
    await Onyx.set(lastAppliedMissingUpdateIDOnyxKey, 2);
    await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
    OnyxUpdateManager.resetDeferralLogicVariables();
};

describe('OnyxUpdateManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await resetOnyxUpdateManager();
        return waitForBatchedUpdates();
    });

    it('should fetch missing Onyx updates once, defer updates and apply after missing updates', () => {
        let lastUpdateIDAppliedToClient = 0;
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => (lastUpdateIDAppliedToClient = value ?? 0),
        });

        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate3);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);

        return App.getMissingOnyxUpdatesTriggeredPromise
            .then(() => {
                expect(Object.keys(OnyxUpdateManager.deferredUpdates)).toHaveLength(3);
            })
            .then(waitForBatchedUpdates)
            .then(() => OnyxUpdateManager.queryPromise)
            ?.then(() => {
                expect(lastUpdateIDAppliedToClient).toBe(5);
                expect(OnyxUpdateManager.applyUpdates).toHaveBeenCalledTimes(1);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(OnyxUpdateManager.applyUpdates).toHaveBeenCalledWith({3: mockUpdate3, 4: mockUpdate4, 5: mockUpdate5});
            });
    });

    it('should only apply deferred updates that are after the locally applied update', async () => {
        let lastUpdateIDAppliedToClient = 0;
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => (lastUpdateIDAppliedToClient = value ?? 0),
        });

        // @ts-expect-error ignore invalid onyx key
        await Onyx.set(lastAppliedMissingUpdateIDOnyxKey, 3);

        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate4);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate5);
        OnyxUpdateManager.handleOnyxUpdateGap(mockUpdate6);

        return App.getMissingOnyxUpdatesTriggeredPromise
            .then(() => {
                expect(Object.keys(OnyxUpdateManager.deferredUpdates)).toHaveLength(3);
                Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5);
            })
            .then(waitForBatchedUpdates)
            .then(() => OnyxUpdateManager.queryPromise)
            ?.then(() => {
                expect(lastUpdateIDAppliedToClient).toBe(6);
                expect(OnyxUpdateManager.applyUpdates).toHaveBeenCalledTimes(1);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(OnyxUpdateManager.applyUpdates).toHaveBeenCalledWith({6: mockUpdate6});
            });
    });
});
