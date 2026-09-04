import {act} from '@testing-library/react-native';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement/index.ios';

import React from 'react';
import {AccessibilityInfo, View} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

const ERROR_MESSAGE = 'Enter an amount';

function FormHelpMessageProbe() {
    useAccessibilityAnnouncement(ERROR_MESSAGE, true);
    return <View testID="form-help-message" />;
}

/**
 * Menu items on Home render form help messages, which announce themselves to VoiceOver. The announcement belongs to
 * the message, not to the mount, and the hook already keeps the last announced message in a ref that a cover leaves
 * alone. This pins that: a reveal must not read the same error out a second time.
 */
describe('useAccessibilityAnnouncement on iOS', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // The announcement waits for the accessibility tree, and only a fake clock installed here advances it.
        jest.useFakeTimers();
    });

    it('announces an unchanged message once across a cover and reveal', async () => {
        const announceForAccessibility = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
        const screenCover = renderScreenWithCover(<FormHelpMessageProbe />);
        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(announceForAccessibility).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();
        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(announceForAccessibility).toHaveBeenCalledTimes(1);
        screenCover.unmount();
        announceForAccessibility.mockRestore();
    });
});
