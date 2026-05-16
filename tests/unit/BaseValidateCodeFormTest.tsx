import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import WideRHPContextProvider from '@components/WideRHPContextProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type TransitionEvent = {data?: {closing?: boolean}};
type TransitionHandler = (event?: TransitionEvent) => void;
type MagicCodeInputHandle = {focusLastSelected: () => void; focus: () => void; clear: () => void; blur: () => void};

type MockStateShape = {
    focusLastSelected: jest.Mock;
    transitionEndHandlers: TransitionHandler[];
    unsubscribeTransitionEnd: jest.Mock;
    addListener: jest.Mock;
    windowReady: {resolve: () => void; promise: Promise<void>};
    isMobileSafariReturn: boolean;
};

// Mock state held on globalThis so jest.mock factories (which get hoisted above all other
// code) can access these objects without "cannot read property of undefined".
const STATE_KEY = 'baseValidateCodeFormTestState';
type GlobalWithMockState = typeof globalThis & {[STATE_KEY]?: MockStateShape};

const mockGetState = (): MockStateShape | undefined => (globalThis as GlobalWithMockState)[STATE_KEY];

const mockEnsureState = (): MockStateShape => {
    const existing = mockGetState();
    if (existing) {
        return existing;
    }
    const state: MockStateShape = {
        focusLastSelected: jest.fn(),
        transitionEndHandlers: [],
        unsubscribeTransitionEnd: jest.fn(),
        addListener: jest.fn(),
        windowReady: {resolve: () => {}, promise: Promise.resolve()},
        isMobileSafariReturn: false,
    };
    state.addListener.mockImplementation((event: string, handler: TransitionHandler) => {
        if (event === 'transitionEnd') {
            state.transitionEndHandlers.push(handler);
        }
        return state.unsubscribeTransitionEnd;
    });
    (globalThis as GlobalWithMockState)[STATE_KEY] = state;
    return state;
};

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    const ReactActual = jest.requireActual<typeof React>('react');
    // Stable navigation object so useCallback([navigation]) doesn't change across renders.
    const stableNavigation = {
        addListener: (...args: [string, TransitionHandler]): (() => void) => {
            const state = (globalThis as GlobalWithMockState)[STATE_KEY];
            if (!state) {
                return () => {};
            }
            return state.addListener(...args) as () => void;
        },
        navigate: jest.fn(),
    };
    return {
        ...(actualNav as Record<string, unknown>),
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
        useFocusEffect: (callback: () => undefined | (() => void)) => {
            ReactActual.useEffect(() => callback(), [callback]);
        },
        useNavigation: () => stableNavigation,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/isWindowReadyToFocus', () => ({
    __esModule: true,
    default: () => {
        const state = (globalThis as GlobalWithMockState)[STATE_KEY];
        return state?.windowReady?.promise ?? Promise.resolve();
    },
}));

jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/Browser'),
    isMobileSafari: () => (globalThis as GlobalWithMockState)[STATE_KEY]?.isMobileSafariReturn ?? false,
}));

jest.mock('@components/MagicCodeInput', () => {
    const ReactActual = jest.requireActual<typeof React>('react');
    const RNActual = jest.requireActual<{View: React.ComponentType<{testID?: string}>}>('react-native');
    const ViewActual = RNActual.View;
    const MockMagicCodeInput = ReactActual.forwardRef((_props: Record<string, unknown>, ref: React.Ref<MagicCodeInputHandle>) => {
        ReactActual.useImperativeHandle(
            ref,
            () => ({
                focusLastSelected: () => {
                    (globalThis as GlobalWithMockState)[STATE_KEY]?.focusLastSelected();
                },
                focus: jest.fn(),
                clear: jest.fn(),
                blur: jest.fn(),
            }),
            [],
        );
        return <ViewActual testID="mock-magic-code-input" />;
    });
    MockMagicCodeInput.displayName = 'MockMagicCodeInput';
    return {__esModule: true, default: MockMagicCodeInput};
});

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <HTMLEngineProvider>
                <LocaleContextProvider>
                    <WideRHPContextProvider>{children}</WideRHPContextProvider>
                </LocaleContextProvider>
            </HTMLEngineProvider>
        </OnyxListItemProvider>
    );
}

function renderForm() {
    return render(
        <BaseValidateCodeForm
            validateCodeActionErrorField="actionVerified"
            handleSubmitForm={jest.fn()}
            clearError={jest.fn()}
            sendValidateCode={jest.fn()}
        />,
        {wrapper: Wrapper},
    );
}

describe('BaseValidateCodeForm focus behavior on screen focus', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        mockEnsureState();
    });

    beforeEach(async () => {
        const state = mockEnsureState();
        state.focusLastSelected.mockClear();
        state.addListener.mockClear();
        state.unsubscribeTransitionEnd.mockClear();
        state.transitionEndHandlers.length = 0;
        state.isMobileSafariReturn = false;
        state.windowReady.promise = new Promise<void>((resolve) => {
            state.windowReady.resolve = resolve;
        });
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('focuses the input synchronously on mobile Safari', async () => {
        const state = mockEnsureState();
        state.isMobileSafariReturn = true;

        renderForm();
        await waitForBatchedUpdatesWithAct();

        expect(state.focusLastSelected).toHaveBeenCalledTimes(1);
        expect(state.addListener).not.toHaveBeenCalled();
    });

    it('focuses the input after transitionEnd fires and isWindowReadyToFocus resolves', async () => {
        const state = mockEnsureState();
        state.isMobileSafariReturn = false;

        renderForm();
        await waitForBatchedUpdatesWithAct();

        expect(state.addListener).toHaveBeenCalledWith('transitionEnd', expect.any(Function));
        expect(state.focusLastSelected).not.toHaveBeenCalled();

        await act(async () => {
            for (const handler of state.transitionEndHandlers) {
                handler({data: {closing: false}});
            }
        });
        expect(state.focusLastSelected).not.toHaveBeenCalled();

        await act(async () => {
            state.windowReady.resolve();
            await state.windowReady.promise;
        });
        await waitForBatchedUpdatesWithAct();

        expect(state.focusLastSelected).toHaveBeenCalledTimes(1);
    });

    it('does not focus the input when transitionEnd fires with closing=true', async () => {
        const state = mockEnsureState();
        state.isMobileSafariReturn = false;

        renderForm();
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            for (const handler of state.transitionEndHandlers) {
                handler({data: {closing: true}});
            }
            state.windowReady.resolve();
            await state.windowReady.promise;
        });
        await waitForBatchedUpdatesWithAct();

        expect(state.focusLastSelected).not.toHaveBeenCalled();
    });

    it('unsubscribes the transitionEnd listener on unmount', async () => {
        const state = mockEnsureState();
        state.isMobileSafariReturn = false;

        const {unmount} = renderForm();
        await waitForBatchedUpdatesWithAct();
        expect(state.addListener).toHaveBeenCalledWith('transitionEnd', expect.any(Function));

        unmount();
        expect(state.unsubscribeTransitionEnd).toHaveBeenCalled();
    });

    it('focuses only once when both transitionEnd and the fallback timeout fire', async () => {
        const state = mockEnsureState();
        state.isMobileSafariReturn = false;

        jest.useFakeTimers();
        try {
            renderForm();
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                for (const handler of state.transitionEndHandlers) {
                    handler({data: {closing: false}});
                }
                jest.advanceTimersByTime(2000);
                state.windowReady.resolve();
                await state.windowReady.promise;
            });
            await waitForBatchedUpdatesWithAct();

            expect(state.focusLastSelected).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });
});
