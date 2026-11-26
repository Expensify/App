import scrollToTab from '@components/TabSelector/scrollToTab';
import type {ScrollToTabProps} from '@components/TabSelector/scrollToTab/types';

import variables from '@styles/variables';

import createMock from '../utils/createMock';

type TabRow = NonNullable<ScrollToTabProps['containerRef']['current']>;

const CONTAINER_X = 100;
const CONTAINER_WIDTH = 400;
const TAB_WIDTH = 100;
const SAFE_AREA_INSET = 80;
const SCROLL_MARGIN = variables.tabSelectorScrollMarginInline;

function createTabRow() {
    const scrollTo = jest.fn();
    const containerRef = {current: createMock<TabRow>({scrollTo})};
    return {scrollTo, containerRef};
}

describe('scrollToTab', () => {
    it('does not scroll to a tab that is fully visible', () => {
        // Given a tab that sits well inside a row that stays out of the horizontal safe area
        const {scrollTo, containerRef} = createTabRow();

        // When the tab is selected
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX: 250, tabWidth: TAB_WIDTH});

        // Then the row stays where the user left it, because moving it would only disorient them
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('scrolls a tab cut off on the right into view', () => {
        // Given a tab whose right side is past the right edge of the row
        const {scrollTo, containerRef} = createTabRow();
        const tabX = 450;

        // When the tab is selected
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX, tabWidth: TAB_WIDTH});

        // Then the row scrolls just far enough to show the whole tab with the scroll margin after it
        expect(scrollTo).toHaveBeenCalledWith({x: tabX + TAB_WIDTH + SCROLL_MARGIN - CONTAINER_WIDTH, animated: true});
    });

    it('scrolls a tab cut off on the left into view', () => {
        // Given a tab whose left side is before the left edge of the row
        const {scrollTo, containerRef} = createTabRow();
        const tabX = 50;

        // When the tab is selected
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX, tabWidth: TAB_WIDTH});

        // Then the row scrolls back so the tab starts after the scroll margin
        expect(scrollTo).toHaveBeenCalledWith({x: tabX - SCROLL_MARGIN, animated: true});
    });

    it('scrolls a tab out from under the right safe area', () => {
        // Given a row that reaches the screen edge through the right safe area, and a tab that is inside the row
        // but under that safe area, where something like the vertical tab bar covers it
        const {scrollTo, containerRef} = createTabRow();
        const tabX = 350;
        const safeAreaReach = {left: 0, right: SAFE_AREA_INSET};

        // When the tab is selected
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX, tabWidth: TAB_WIDTH, safeAreaReach});

        // Then the row scrolls until the tab and its scroll margin end where the safe area starts
        expect(scrollTo).toHaveBeenCalledWith({x: tabX + TAB_WIDTH + SCROLL_MARGIN - (CONTAINER_WIDTH - SAFE_AREA_INSET), animated: true});
    });

    it('scrolls a tab out from under the left safe area', () => {
        // Given a row that reaches the screen edge through the left safe area, and a tab that is inside the row
        // but under that safe area
        const {scrollTo, containerRef} = createTabRow();
        const tabX = 150;
        const safeAreaReach = {left: SAFE_AREA_INSET, right: 0};

        // When the tab is selected
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX, tabWidth: TAB_WIDTH, safeAreaReach});

        // Then the row scrolls back until the tab starts after the safe area and the scroll margin
        expect(scrollTo).toHaveBeenCalledWith({x: tabX - SAFE_AREA_INSET - SCROLL_MARGIN, animated: true});
    });

    it('does not scroll to a tab that is visible between the safe areas', () => {
        // Given a row that reaches into the safe area on both sides and a tab that is clear of both
        const {scrollTo, containerRef} = createTabRow();
        const safeAreaReach = {left: SAFE_AREA_INSET, right: SAFE_AREA_INSET};

        // When the tab is selected
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX: 200, tabWidth: TAB_WIDTH, safeAreaReach});

        // Then the row stays put, because the safe area only hides the tabs that are under it
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('scrolls without an animation when asked to', () => {
        // Given a tab cut off on the right in a row that was just laid out
        const {scrollTo, containerRef} = createTabRow();

        // When the tab is scrolled to with the animation turned off, as a row does while it is still mounting
        scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX: 450, tabWidth: TAB_WIDTH, animated: false});

        // Then the row jumps instead of sliding, so the user doesn't see it move on its first frame
        expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({animated: false}));
    });

    it('does nothing before the row is mounted', () => {
        // Given a row whose scroll view isn't mounted yet, so there is nothing to scroll
        const containerRef = {current: null};

        // When a tab that would be cut off is selected
        const scrollToUnmountedRow = () => scrollToTab({containerRef, containerX: CONTAINER_X, containerWidth: CONTAINER_WIDTH, tabX: 450, tabWidth: TAB_WIDTH});

        // Then the call is ignored instead of throwing, because tabs can report their layout before the row does
        expect(scrollToUnmountedRow).not.toThrow();
    });
});
