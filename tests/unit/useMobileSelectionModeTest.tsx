import {act, renderHook} from '@testing-library/react-native';

import useMobileSelectionMode from '@hooks/useMobileSelectionMode';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import ONYXKEYS from '@src/ONYXKEYS';

import {useIsFocused} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNavigation = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNavigation,
        __esModule: true,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@libs/actions/MobileSelectionMode', () => ({
    __esModule: true,
    turnOnMobileSelectionMode: jest.fn(),
    turnOffMobileSelectionMode: jest.fn(),
}));

const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedTurnOffMobileSelectionMode = jest.mocked(turnOffMobileSelectionMode);

describe('useMobileSelectionMode', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('does not clear selection mode when a subscriber mounts unfocused while selection is already on', async () => {
        // Given selection mode is already on, turned on by another (focused) screen
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE, true);
        });
        mockedUseIsFocused.mockReturnValue(false);

        // When a subscriber mounts on a still-mounted background screen
        renderHook(() => useMobileSelectionMode());
        await waitForBatchedUpdates();

        // Then it must not wipe the selection mode the focused screen owns
        expect(mockedTurnOffMobileSelectionMode).not.toHaveBeenCalled();
    });

    it('clears stale selection mode when a subscriber mounts focused while selection is already on', async () => {
        // Given selection mode was left on from a previous screen
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE, true);
        });
        mockedUseIsFocused.mockReturnValue(true);

        // When the subscriber mounts on the focused screen
        renderHook(() => useMobileSelectionMode());
        await waitForBatchedUpdates();

        // Then the stale selection mode is cleared
        expect(mockedTurnOffMobileSelectionMode).toHaveBeenCalled();
    });

    it('defers the stale-selection cleanup until the screen becomes focused', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE, true);
        });
        mockedUseIsFocused.mockReturnValue(false);

        const {rerender} = renderHook(() => useMobileSelectionMode());
        await waitForBatchedUpdates();
        expect(mockedTurnOffMobileSelectionMode).not.toHaveBeenCalled();

        // When the screen becomes focused, the deferred cleanup runs
        mockedUseIsFocused.mockReturnValue(true);
        rerender({});
        await waitForBatchedUpdates();

        expect(mockedTurnOffMobileSelectionMode).toHaveBeenCalled();
    });

    it('does not clear selection mode when it was already off at mount', async () => {
        mockedUseIsFocused.mockReturnValue(true);

        renderHook(() => useMobileSelectionMode());
        await waitForBatchedUpdates();

        expect(mockedTurnOffMobileSelectionMode).not.toHaveBeenCalled();
    });
});
