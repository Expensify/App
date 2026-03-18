import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);

const translate = (key: TranslationPaths) => {
    switch (key) {
        case 'accessibilityHints.contextMenuAvailable':
            return 'Context menu available. Press Shift+F10 to open.';
        case 'accessibilityHints.contextMenuAvailableNative':
            return 'Context menu available. Double-tap and hold to open.';
        default:
            return '';
    }
};

describe('getContextMenuAccessibilityHint', () => {
    it('returns the desktop web hint on web', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Press Shift+F10 to open.');
    });

    it('returns the mobile web hint on mobile web', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.MOBILE_WEB);

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Double-tap and hold to open.');
    });

    it('returns the native hint on ios', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Double-tap and hold to open.');
    });

    it('returns the native hint on android', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

        expect(getContextMenuAccessibilityHint({translate})).toBe('Context menu available. Double-tap and hold to open.');
    });
});
