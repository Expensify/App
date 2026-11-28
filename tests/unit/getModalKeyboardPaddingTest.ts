import getModalKeyboardPadding from '@libs/getModalKeyboardPadding';

describe('getModalKeyboardPadding', () => {
    it('keeps the bottom safe area when the keyboard is hidden', () => {
        // Given a HybridApp portrait modal with no keyboard
        // When the padding is calculated
        const padding = getModalKeyboardPadding({keyboardHeight: 0, frameHeight: 914, windowHeight: 842, safeAreaPaddingTop: 24, safeAreaPaddingBottom: 48});

        // Then the sheet still clears the navigation bar
        expect(padding).toBe(48);
    });

    it('does not pad the navigation bar twice in HybridApp portrait', () => {
        // Given a HybridApp portrait modal inset by the status and navigation bars, while the keyboard height includes the navigation bar
        // When the padding is calculated
        const padding = getModalKeyboardPadding({keyboardHeight: 334, frameHeight: 914, windowHeight: 842, safeAreaPaddingTop: 24, safeAreaPaddingBottom: 48});

        // Then the navigation bar overlap is subtracted so the sheet sits right on the keyboard
        expect(padding).toBe(286);
    });

    it('pads the full keyboard height in HybridApp landscape', () => {
        // Given a HybridApp landscape modal, where only the status bar insets the window
        // When the padding is calculated
        const padding = getModalKeyboardPadding({keyboardHeight: 200, frameHeight: 411, windowHeight: 387, safeAreaPaddingTop: 24, safeAreaPaddingBottom: 0});

        // Then nothing is subtracted from the keyboard height
        expect(padding).toBe(200);
    });

    it('pads the full keyboard height with edge-to-edge in portrait', () => {
        // Given a standalone edge-to-edge modal that covers the whole frame
        // When the padding is calculated
        const padding = getModalKeyboardPadding({keyboardHeight: 334, frameHeight: 914, windowHeight: 914, safeAreaPaddingTop: 24, safeAreaPaddingBottom: 48});

        // Then nothing is subtracted from the keyboard height
        expect(padding).toBe(334);
    });

    it('pads the keyboard height reported for the pane in split screen', () => {
        // Given the app in the lower split-screen pane, where the frame and window heights match
        // When the padding is calculated
        const padding = getModalKeyboardPadding({keyboardHeight: 67, frameHeight: 464, windowHeight: 464, safeAreaPaddingTop: 0, safeAreaPaddingBottom: 48});

        // Then the window-relative keyboard height is used as is
        expect(padding).toBe(67);
    });
});
