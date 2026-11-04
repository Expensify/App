import type MoveAccessibilityFocus from '@libs/Accessibility/moveAccessibilityFocus/types';
import type {AccessibilityFocusTarget} from '@libs/Accessibility/moveAccessibilityFocus/types';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

const moveAccessibilityFocus = jest.requireActual<{default: MoveAccessibilityFocus}>('@libs/Accessibility/moveAccessibilityFocus/index.ts').default;

describe('moveAccessibilityFocus on web', () => {
    it('focuses the element behind an input ref', () => {
        // Given the ref object an input hands out as its focus target
        const element = document.createElement('input');
        const focus = jest.spyOn(element, 'focus');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a DOM input stands in for the input's web ref
        const target = {current: element} as unknown as AccessibilityFocusTarget;

        // When focus moves to it
        moveAccessibilityFocus(target);

        // Then the element behind the ref takes focus, which a web screen reader follows
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('focuses a view passed directly', () => {
        // Given a view the caller holds, which on web is its DOM element
        const element = document.createElement('div');
        const focus = jest.spyOn(element, 'focus');

        // When focus moves to it
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- on web a view is its DOM element
        moveAccessibilityFocus(element as unknown as ComponentRef<typeof View>);

        // Then the view itself takes focus
        expect(focus).toHaveBeenCalledTimes(1);
    });
});
