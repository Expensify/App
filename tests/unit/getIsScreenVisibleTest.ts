import getIsScreenVisible from '@components/ScreenWrapper/getIsScreenVisible';

describe('getIsScreenVisible', () => {
    it('counts the screen on top as visible on every layout', () => {
        // Given a focused screen
        // When its visibility is asked on a small and on a wide layout
        const onSmallScreen = getIsScreenVisible({isFocused: true, isSmallScreenWidth: true, isSidebarOfFocusedSplitNavigator: false, displayedRHPWidth: undefined});
        const onWideScreen = getIsScreenVisible({isFocused: true, isSmallScreenWidth: false, isSidebarOfFocusedSplitNavigator: false, displayedRHPWidth: undefined});

        // Then it is visible on both
        expect(onSmallScreen).toBe(true);
        expect(onWideScreen).toBe(true);
    });

    it('counts a super-wide RHP screen under a narrower panel on a wide layout as visible, since the report stays dimmed to its left', () => {
        // Given a super-wide report table with an expense opened on top of it, which should highlight in the background
        // When its visibility is asked while the expense panel has focus
        const isVisible = getIsScreenVisible({isFocused: false, isSmallScreenWidth: false, isSidebarOfFocusedSplitNavigator: false, displayedRHPWidth: 'super-wide'});

        // Then it is visible
        expect(isVisible).toBe(true);
    });

    it('counts a wide RHP screen under a narrower panel on a wide layout as visible', () => {
        // Given a report in a wide RHP with a narrower panel opened on top of it
        // When its visibility is asked
        const isVisible = getIsScreenVisible({isFocused: false, isSmallScreenWidth: false, isSidebarOfFocusedSplitNavigator: false, displayedRHPWidth: 'wide'});

        // Then it is visible
        expect(isVisible).toBe(true);
    });

    it('does not count a central-pane screen under an RHP as visible, even on a wide layout', () => {
        // Given a chat behind an open report, which may turn super-wide and cover it
        // When its visibility is asked
        const isVisible = getIsScreenVisible({isFocused: false, isSmallScreenWidth: false, isSidebarOfFocusedSplitNavigator: false, displayedRHPWidth: undefined});

        // Then it is not visible
        expect(isVisible).toBe(false);
    });

    it('does not count a covered RHP screen as visible on a small screen, where the panel on top fills it', () => {
        // Given a super-wide report under another panel on a small screen, where every RHP is full width
        // When its visibility is asked
        const isVisible = getIsScreenVisible({isFocused: false, isSmallScreenWidth: true, isSidebarOfFocusedSplitNavigator: false, displayedRHPWidth: 'super-wide'});

        // Then it is not visible
        expect(isVisible).toBe(false);
    });

    it('counts the sidebar of a split navigator beside its focused screen on a wide layout as visible', () => {
        // Given the workspace sidebar beside a focused workspace page
        // When the sidebar's visibility is asked
        const isVisible = getIsScreenVisible({isFocused: false, isSmallScreenWidth: false, isSidebarOfFocusedSplitNavigator: true, displayedRHPWidth: undefined});

        // Then it is visible
        expect(isVisible).toBe(true);
    });

    it('does not count the sidebar of a split navigator as visible on a small screen unless it is focused', () => {
        // Given the workspace sidebar under one of its pages on a small screen
        // When the sidebar's visibility is asked
        const isVisible = getIsScreenVisible({isFocused: false, isSmallScreenWidth: true, isSidebarOfFocusedSplitNavigator: true, displayedRHPWidth: undefined});

        // Then it is not visible
        expect(isVisible).toBe(false);
    });
});
