import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getPlatform from '@libs/getPlatform';
import type {TranslationPaths} from '@src/languages/types';

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);

const translate = (key: TranslationPaths) => {
    switch (key) {
        case 'accessibilityHints.contextMenuAvailable':
            return 'Context menu available. Press Shift+F10 to open.';
        case 'accessibilityHints.contextMenuAvailableMobileWeb':
            return 'Context menu available. Double-tap and hold to open.';
        case 'accessibilityHints.contextMenuAvailableNative':
            return 'Context menu available. Double-tap and hold to open.';
        default:
            return '';
    }
};

describe('getContextMenuAccessibilityHint', () => {
    it('returns the desktop web hint on web', () => {
        mockedGetPlatform.mockReturnValue('web');

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Press Shift+F10 to open.');
    });

    it('returns the mobile web hint on mobile web', () => {
        mockedGetPlatform.mockReturnValue('mobile-web');

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Double-tap and hold to open.');
    });

    it('returns the native hint on ios', () => {
        mockedGetPlatform.mockReturnValue('ios');

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Double-tap and hold to open.');
    });

    it('returns the native hint on android', () => {
        mockedGetPlatform.mockReturnValue('android');

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Double-tap and hold to open.');
    });
});
