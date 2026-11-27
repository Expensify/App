import type isInLandscapeModeType from '@libs/isInLandscapeMode';

const mockIsTablet = jest.fn<boolean, []>();

jest.mock('@libs/isTablet', () => ({
    __esModule: true,
    default: () => mockIsTablet(),
}));

/**
 * Jest resolves `@libs/isInLandscapeMode` to the native file. It reads `isTablet()` once when it is loaded, so it is loaded
 * again for each kind of device.
 */
function loadIsInLandscapeMode(isTabletDevice: boolean): typeof isInLandscapeModeType {
    mockIsTablet.mockReturnValue(isTabletDevice);

    let isInLandscapeMode: typeof isInLandscapeModeType | undefined;
    jest.isolateModules(() => {
        isInLandscapeMode = jest.requireActual<{default: typeof isInLandscapeModeType}>('@libs/isInLandscapeMode').default;
    });

    if (!isInLandscapeMode) {
        throw new Error('Failed to load isInLandscapeMode');
    }
    return isInLandscapeMode;
}

describe('isInLandscapeMode on native', () => {
    it('follows the window orientation on a phone', () => {
        // Given a phone, whose window never gets as big as a tablet's
        const isInLandscapeMode = loadIsInLandscapeMode(false);

        // When the window is wider than it is tall
        // Then the phone is in landscape mode, because the window is too short for the regular layout
        expect(isInLandscapeMode(852, 393)).toBe(true);

        // When the window is taller than it is wide
        // Then the phone is not in landscape mode
        expect(isInLandscapeMode(393, 852)).toBe(false);
    });

    it('is never in landscape mode on a tablet', () => {
        // Given a device that reports itself as a tablet
        const isInLandscapeMode = loadIsInLandscapeMode(true);

        // When the window is wider than it is tall
        // Then it is not in landscape mode, because a tablet has room for the regular layout in any orientation
        expect(isInLandscapeMode(1133, 744)).toBe(false);
    });

    it('is not in landscape mode on an unfolded foldable phone', () => {
        // Given a foldable phone, which reports itself as a phone even when it is unfolded
        const isInLandscapeMode = loadIsInLandscapeMode(false);

        // When it is unfolded, so its window is wider than it is tall but as big as a tablet's
        // Then it is not in landscape mode, so that screens keep their regular layout instead of the one meant for a short window
        expect(isInLandscapeMode(951, 669)).toBe(false);
    });

    it('follows the window orientation again once a foldable phone is folded', () => {
        // Given a foldable phone that was unfolded the last time the orientation was read
        const isInLandscapeMode = loadIsInLandscapeMode(false);
        expect(isInLandscapeMode(951, 669)).toBe(false);

        // When it is folded and its cover screen is held sideways
        // Then it is in landscape mode, because the window is read on every call and is now as short as a phone's
        expect(isInLandscapeMode(678, 466)).toBe(true);
    });

    it('treats a window whose short side is exactly the tablet minimum as a tablet window', () => {
        // Given a phone
        const isInLandscapeMode = loadIsInLandscapeMode(false);

        // When the short side of its window is one point below the tablet minimum
        // Then it is still in landscape mode
        expect(isInLandscapeMode(900, 599)).toBe(true);

        // When the short side reaches the tablet minimum
        // Then it is not in landscape mode
        expect(isInLandscapeMode(900, 600)).toBe(false);
    });
});
