import hasRenderableChildren from '@libs/hasRenderableChildren';

import React from 'react';
import {View} from 'react-native';

describe('hasRenderableChildren', () => {
    it('returns false for children that render nothing', () => {
        // Given children React skips when rendering: nothing at all, a single empty value, and sibling conditionals that all came out empty
        // When checking each of them
        // Then none counts as renderable, unlike `!!children`, which is true for the array
        expect(hasRenderableChildren(undefined)).toBe(false);
        expect(hasRenderableChildren(false)).toBe(false);
        expect(hasRenderableChildren([false, null, undefined, ''])).toBe(false);
    });

    it('returns true when at least one child renders', () => {
        // Given sibling conditionals where only one came out as an element
        // When checking them
        // Then the one element makes them renderable
        expect(hasRenderableChildren([false, <View key="child" />])).toBe(true);
    });

    it('treats an empty string as nothing and other text as renderable', () => {
        // Given text children, which React renders as-is unless empty
        // When checking them
        // Then only the non-empty one counts
        expect(hasRenderableChildren('')).toBe(false);
        expect(hasRenderableChildren('text')).toBe(true);
    });
});
