import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);

describe('getContextMenuAccessibilityProps', () => {
    it('merges the hint into the label on desktop web', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

        expect(
            getContextMenuAccessibilityProps({
                accessibilityLabel: 'Help',
                contextMenuHint: 'Context menu available. Press Shift+F10 to open.',
            }),
        ).toEqual({
            accessibilityLabel: 'Help. Context menu available. Press Shift+F10 to open.',
            accessibilityHint: undefined,
        });
    });

    it('merges the hint into the label on mobile web', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.MOBILE_WEB);

        expect(
            getContextMenuAccessibilityProps({
                accessibilityLabel: 'Help',
                contextMenuHint: 'Context menu available. Double-tap and hold to open.',
            }),
        ).toEqual({
            accessibilityLabel: 'Help. Context menu available. Double-tap and hold to open.',
            accessibilityHint: undefined,
        });
    });

    it('keeps the hint separate on native', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

        expect(
            getContextMenuAccessibilityProps({
                accessibilityLabel: 'Help',
                contextMenuHint: 'Context menu available. Double-tap and hold to open.',
            }),
        ).toEqual({
            accessibilityLabel: 'Help',
            accessibilityHint: 'Context menu available. Double-tap and hold to open.',
        });
    });

    it('preserves the native hint when adding a context-menu hint on native', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

        expect(
            getContextMenuAccessibilityProps({
                accessibilityLabel: 'Navigates to a chat. Test chat',
                nativeAccessibilityHint: 'Navigates to a chat. Test chat',
                contextMenuHint: 'Context menu available. Double-tap and hold to open.',
            }),
        ).toEqual({
            accessibilityLabel: 'Navigates to a chat. Test chat',
            accessibilityHint: 'Navigates to a chat. Test chat. Context menu available. Double-tap and hold to open.',
        });
    });

    it('returns the original label when no hint is provided', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);

        expect(
            getContextMenuAccessibilityProps({
                accessibilityLabel: 'Help',
            }),
        ).toEqual({
            accessibilityLabel: 'Help',
            accessibilityHint: undefined,
        });
    });
});
