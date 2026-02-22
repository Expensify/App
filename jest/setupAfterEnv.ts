import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

jest.useRealTimers();

// Auto-initialize Onyx for tests.
// Tests that already call Onyx.init() in their own beforeAll will safely re-configure Onyx —
// the second init() just re-runs initStoreValues and re-resolves the already-resolved deferred task.
beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});
