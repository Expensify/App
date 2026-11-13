import getFollowOffset from '@hooks/useKeyboardDrivenScroll/getFollowOffset';

describe('getFollowOffset', () => {
    it('moves the content by the share of the keyboard animation done so far', () => {
        // Given content at the top and a keyboard a quarter of the way up
        // When the offset is computed for that frame
        const offset = getFollowOffset({startOffset: 0, startKeyboardHeight: 0, endKeyboardHeight: 300, keyboardHeight: 75, targetOffset: 200});

        // Then the content is a quarter of the way to the target, so it moves with the keyboard
        expect(offset).toBe(50);
    });

    it('keeps the content between where it started and the target', () => {
        // Given keyboard heights outside the animation range, as can happen on the first and last frames
        const params = {startOffset: 100, startKeyboardHeight: 0, endKeyboardHeight: 300, targetOffset: 200};

        // When the offset is computed for them
        // Then the content doesn't move past either end
        expect(getFollowOffset({...params, keyboardHeight: -10})).toBe(100);
        expect(getFollowOffset({...params, keyboardHeight: 320})).toBe(200);
    });

    it('follows a keyboard that gets shorter', () => {
        // Given an open keyboard halfway through getting 40 px shorter
        // When the offset is computed for that frame
        const offset = getFollowOffset({startOffset: 120, startKeyboardHeight: 300, endKeyboardHeight: 260, keyboardHeight: 280, targetOffset: 160});

        // Then the content is halfway to the target too, as the distance is negative on both sides of the division
        expect(offset).toBe(140);
    });

    it('goes straight to the target when the keyboard does not change height', () => {
        // Given a keyboard event with the same start and end height
        // When the offset is computed for it
        const offset = getFollowOffset({startOffset: 0, startKeyboardHeight: 300, endKeyboardHeight: 300, keyboardHeight: 300, targetOffset: 120});

        // Then there is no animation to follow, so the content takes the target
        expect(offset).toBe(120);
    });

    it('does not move past the top for a negative target', () => {
        // Given a target above the top of the content
        // When the keyboard is fully up
        const offset = getFollowOffset({startOffset: 100, startKeyboardHeight: 0, endKeyboardHeight: 300, keyboardHeight: 300, targetOffset: -50});

        // Then the content stops at the top
        expect(offset).toBe(0);
    });
});
