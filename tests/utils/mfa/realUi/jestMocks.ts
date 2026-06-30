// eslint-disable-next-line no-restricted-imports -- this mock replaces useInspectedMachine with the plain @xstate/react adapter so the modal-lifecycle contract runs without the dev-only inspector wiring.
import {useMachine} from '@xstate/react';
import type {AnyStateMachine} from 'xstate';
import {biometricsMock, pendingModalClose} from './mocks';

/**
 * jest.mock factory bodies for the model-based MFA UI test, kept out of the test file so it reads as
 * mock registrations plus test logic. Each is called from a `jest.mock(..., () => require(...).xMock())`
 * factory, so it returns a ready-to-use mock module (`__esModule` + `default`).
 */

/** Drops the dev-only Stately inspector wiring. The provider just needs the plain @xstate/react adapter. */
function inspectedMachineMock() {
    // Named `use*` so rules-of-hooks treats it as a custom hook (it calls useMachine).
    const useInspectedMachineMock = (machine: AnyStateMachine) => useMachine(machine);
    return {
        __esModule: true,
        default: useInspectedMachineMock,
    };
}

/** Native / WebAuthn biometrics are out of scope for the modal-lifecycle contract, so this returns the shared biometrics mock. */
function biometricsHookMock() {
    return {
        __esModule: true,
        default: () => biometricsMock,
    };
}

/** Browser/Android back-history wiring is a separate concern from the machine <-> UI contract. */
function syncHistoryMock() {
    return {
        __esModule: true,
        default: () => {},
    };
}

/**
 * Supplies the Navigation methods the flow drives with real behavior and resolves any other
 * `Navigation.*` the render path touches to a no-op jest.fn() via the Proxy.
 *
 * `runAfterTransition` runs its callback immediately (no active navigation transition in jsdom).
 * `runAfterUpcomingTransition` captures the navigator's teardown callback so MODAL_CLOSED is driven
 * from the event map, not a timer.
 */
function navigationMock() {
    const navigationMethodStubs: Record<string, unknown> = {
        runAfterTransition: (callback: () => void) => {
            callback();
            return {cancel: () => {}};
        },
        runAfterUpcomingTransition: (callback: () => void) => {
            pendingModalClose.capture(callback);
            return {cancel: () => pendingModalClose.clear()};
        },
        isNavigationReady: () => Promise.resolve(),
    };
    return {
        __esModule: true,
        default: new Proxy(navigationMethodStubs, {
            get: (target, property) => {
                if (typeof property === 'string' && property in target) {
                    return target[property];
                }
                return jest.fn();
            },
        }),
    };
}

export {inspectedMachineMock, biometricsHookMock, syncHistoryMock, navigationMock};
