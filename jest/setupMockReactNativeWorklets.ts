/**
 * ref: https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-worklets/src/mock.ts
 * Could be replaced according to docs: https://docs.swmansion.com/react-native-worklets/docs/guides/testing
 * when mock.ts file is released
 */
function setupMockReactNativeWorklets() {
    function mockedRequestAnimationFrame(callback: (timestamp: number) => void): ReturnType<typeof setTimeout> {
        return setTimeout(() => callback(performance.now()), 0);
    }

    const NOOP = () => {};
    const NOOP_FACTORY = () => NOOP;
    const ID = <TValue>(value: TValue) => value;
    const IMMEDIATE_CALLBACK_INVOCATION = <TCallback>(callback: () => TCallback) => callback();

    jest.mock('react-native-worklets', () => ({
        isShareableRef: () => true,
        makeShareable: ID,
        makeShareableCloneOnUIRecursive: ID,
        makeShareableCloneRecursive: ID,
        shareableMappingCache: new Map(),
        getStaticFeatureFlag: () => false,
        setDynamicFeatureFlag: NOOP,
        // cspell:disable-next-line
        isSynchronizable: () => false,
        getRuntimeKind: () => 1,
        createWorkletRuntime: NOOP_FACTORY,
        runOnRuntime: ID,
        scheduleOnRuntime: IMMEDIATE_CALLBACK_INVOCATION,
        createSerializable: ID,
        isSerializableRef: ID,
        serializableMappingCache: new Map(),
        // cspell:disable-next-line
        createSynchronizable: ID,
        callMicrotasks: NOOP,
        executeOnUIRuntimeSync: ID,
        runOnJS<Args extends unknown[], ReturnValue>(fun: (...args: Args) => ReturnValue): (...args: Args) => void {
            return (...args) => queueMicrotask(args.length ? () => (fun as (...args: Args) => ReturnValue)(...args) : (fun as () => ReturnValue));
        },
        runOnUI<Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue): (...args: Args) => void {
            return (...args) => {
                mockedRequestAnimationFrame(() => {
                    worklet(...args);
                });
            };
        },
        runOnUIAsync<Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue): (...args: Args) => Promise<ReturnValue> {
            return (...args: Args) => {
                return new Promise<ReturnValue>((resolve) => {
                    mockedRequestAnimationFrame(() => {
                        const result = worklet(...args);
                        resolve(result);
                    });
                });
            };
        },
        runOnUISync: IMMEDIATE_CALLBACK_INVOCATION,
        scheduleOnRN<Args extends unknown[], ReturnValue>(fun: (...args: Args) => ReturnValue, ...args: Args): void {
            queueMicrotask(args.length ? () => (fun as (...args: Args) => ReturnValue)(...args) : (fun as () => ReturnValue));
        },
        scheduleOnUI<Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue, ...args: Args): void {
            mockedRequestAnimationFrame(() => {
                worklet(...args);
            });
        },
        // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
        unstable_eventLoopTask: NOOP_FACTORY,
        isWorkletFunction: () => false,
        WorkletsModule: {},
    }));
}

export default setupMockReactNativeWorklets;
