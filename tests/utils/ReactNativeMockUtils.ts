/**
 * Typed access to the methods that `__mocks__/react-native.ts` adds to `Linking` and `AppState`.
 * A module augmentation can't declare them under the React Native Strict TypeScript API, where both objects are instances of classes that are not exported.
 */
import type {AppStateStatus} from 'react-native';

import {AppState, Linking} from 'react-native';

type LinkingMock = typeof Linking & {setInitialURL: (url: string) => void};

type AppStateMock = typeof AppState & {emitCurrentTestState: (state: AppStateStatus) => void};

/** Sets the URL that `Linking.getInitialURL()` resolves with */
function setInitialURL(url: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the react-native mock adds this method to Linking
    (Linking as LinkingMock).setInitialURL(url);
}

/** Changes `AppState.currentState` and calls the `change` listeners with the new state */
function emitAppState(state: AppStateStatus) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the react-native mock adds this method to AppState
    (AppState as AppStateMock).emitCurrentTestState(state);
}

export {emitAppState, setInitialURL};
