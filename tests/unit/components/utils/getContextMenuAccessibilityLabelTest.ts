import getContextMenuAccessibilityLabel from '@components/utils/getContextMenuAccessibilityLabel';
import getPlatform from '@libs/getPlatform';

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);

const translate = (key: 'common.yourReviewIsRequired' | 'accessibilityHints.contextMenuAvailable') => {
    const translations = {
        'common.yourReviewIsRequired': 'Your review is required',
        'accessibilityHints.contextMenuAvailable': 'Context menu available. Press Shift+F10 to open.',
    };

    return translations[key];
};

describe('getContextMenuAccessibilityLabel', () => {
    beforeEach(() => {
        mockedGetPlatform.mockReturnValue('web');
    });

    it('returns the base label parts joined with periods', () => {
        expect(
            getContextMenuAccessibilityLabel({
                labelParts: ['Help', 'Opens in a new tab'],
                translate,
            }),
        ).toBe('Help. Opens in a new tab');
    });

    it('appends the review-required text when requested', () => {
        expect(
            getContextMenuAccessibilityLabel({
                labelParts: ['Workspace name'],
                translate,
                shouldShowReviewRequired: true,
            }),
        ).toBe('Workspace name. Your review is required');
    });

    it('appends the context-menu hint on web when requested', () => {
        expect(
            getContextMenuAccessibilityLabel({
                labelParts: ['Help'],
                translate,
                shouldShowContextMenuHint: true,
            }),
        ).toBe('Help. Context menu available. Press Shift+F10 to open.');
    });

    it('does not append the context-menu hint on non-web platforms', () => {
        mockedGetPlatform.mockReturnValue('android');

        expect(
            getContextMenuAccessibilityLabel({
                labelParts: ['Help'],
                translate,
                shouldShowContextMenuHint: true,
            }),
        ).toBe('Help');
    });
});
