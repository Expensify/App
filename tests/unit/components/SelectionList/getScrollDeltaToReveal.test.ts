import getScrollDeltaToReveal, {EXTRA_SCROLL_PADDING} from '@components/SelectionList/hooks/useScrollToFocusedInput/getScrollDeltaToReveal';

// The visible part of the list runs from 100 to 600 in the window, so a view is in sight between 116 and 584
const VISIBLE_AREA = {top: 100, height: 500};
const VISIBLE_TOP = VISIBLE_AREA.top + EXTRA_SCROLL_PADDING;
const VISIBLE_BOTTOM = VISIBLE_AREA.top + VISIBLE_AREA.height - EXTRA_SCROLL_PADDING;

describe('getScrollDeltaToReveal', () => {
    it.each([
        ['a view that fits and sits above the list scrolls up until its top is the padding below the list top', {top: 20, height: 60}, 20 - VISIBLE_TOP],
        ['a view that fits and sits below the list scrolls down until its bottom is the padding above the list bottom', {top: 560, height: 60}, 620 - VISIBLE_BOTTOM],
        ['a view that is already in sight leaves the list where it is', {top: 300, height: 60}, 0],
        ['a tall view running past both edges scrolls until its bottom is in sight', {top: 50, height: 700}, 750 - VISIBLE_BOTTOM],
        ['a tall view whose top is in sight but whose bottom is clipped scrolls down to its bottom', {top: 200, height: 600}, 800 - VISIBLE_BOTTOM],
        ['a tall view that is entirely above the list scrolls up to its bottom', {top: -700, height: 600}, -100 - VISIBLE_BOTTOM],
        ['a tall view whose bottom is already in sight leaves the list where it is', {top: 20, height: 500}, 0],
    ])('%s', (_case, view, expectedDelta) => {
        // Given a view at this position relative to a list whose visible area runs from 116 to 584 once the padding is taken off
        // When the scroll needed to reveal it is computed
        const delta = getScrollDeltaToReveal(view, VISIBLE_AREA);

        // Then the list moves only as far as needed, and a view taller than the list is judged by its bottom, where a field shows its error
        expect(delta).toBe(expectedDelta);
    });
});
