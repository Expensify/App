import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Factory mocks share these functions across the isolated module registries each test loads.
const mockClearWorkboxRecoveryCaches = jest.fn(() => Promise.resolve());
jest.mock('@libs/clearWorkboxRecoveryCaches', () => ({
    __esModule: true,
    default: () => mockClearWorkboxRecoveryCaches(),
}));

const mockLogAlert = jest.fn();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {alert: (...args: unknown[]) => mockLogAlert(...args)},
}));

const mockOnyxSet = jest.fn();
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {set: (...args: unknown[]) => mockOnyxSet(...args)},
}));

type UpdateRequiredModule = typeof import('../../src/libs/actions/UpdateRequired/index');

function loadWebUpdateRequired(): UpdateRequiredModule {
    let updateRequired: UpdateRequiredModule | undefined;
    jest.isolateModules(() => {
        updateRequired = jest.requireActual<UpdateRequiredModule>('../../src/libs/actions/UpdateRequired/index.ts');
    });
    if (!updateRequired) {
        throw new Error('Failed to load UpdateRequired');
    }
    return updateRequired;
}

describe('UpdateRequired (web)', () => {
    const reloadMock = jest.fn();
    const originalLocation = window.location;

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {reload: reloadMock},
        });
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        sessionStorage.clear();
    });

    it('clears the cache and reloads on the first 426 instead of showing the Update Required screen', async () => {
        // Given a web app that has not tried reloading for a 426 yet
        const {alertUser} = loadWebUpdateRequired();

        // When a request gets a 426
        alertUser();
        await waitForBatchedUpdates();

        // Then the cache is cleared and the page reloads, because the stale bundle can only be replaced by a reload
        expect(mockClearWorkboxRecoveryCaches).toHaveBeenCalledTimes(1);
        expect(reloadMock).toHaveBeenCalledTimes(1);
        expect(mockOnyxSet).not.toHaveBeenCalled();
    });

    it('reloads only once when several requests get a 426 at the same time', async () => {
        // Given a web app that has not tried reloading for a 426 yet
        const {alertUser} = loadWebUpdateRequired();

        // When several requests get a 426 before the page reloads
        alertUser();
        alertUser();
        await waitForBatchedUpdates();

        // Then only one reload is triggered and the Update Required screen is not shown
        expect(reloadMock).toHaveBeenCalledTimes(1);
        expect(mockLogAlert).not.toHaveBeenCalled();
    });

    it('shows the Update Required screen and logs an alert when the reloaded app still gets a 426', async () => {
        // Given the app already reloaded once for a 426 in this tab
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.UPDATE_REQUIRED_RELOADED, 'true');
        const {alertUser} = loadWebUpdateRequired();

        // When the reloaded app gets another 426
        alertUser();
        await waitForBatchedUpdates();

        // Then it stops reloading to avoid a loop, shows the Update Required screen, and alerts because this should not happen
        expect(reloadMock).not.toHaveBeenCalled();
        expect(mockLogAlert).toHaveBeenCalledTimes(1);
        expect(mockOnyxSet).toHaveBeenCalledWith(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED, true);
    });

    it('shows the Update Required screen without reloading when sessionStorage is unusable', async () => {
        // Given sessionStorage throws, so the reload attempt can't be recorded
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });
        const {alertUser} = loadWebUpdateRequired();

        // When a request gets a 426
        alertUser();
        await waitForBatchedUpdates();

        // Then it does not reload, since without a record every reload would get a 426 and reload again forever
        expect(reloadMock).not.toHaveBeenCalled();
        expect(mockOnyxSet).toHaveBeenCalledWith(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED, true);
    });
});
