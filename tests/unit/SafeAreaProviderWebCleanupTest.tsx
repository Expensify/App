import {render} from '@testing-library/react-native';

import React from 'react';
// The bug lives in the web build of the provider. Jest resolves the bare specifier to the
// native build, so the web file is imported by path to exercise the code the browser runs.
// @ts-expect-error -- the package ships no type declarations for this internal path
import {NativeSafeAreaProvider} from 'react-native-safe-area-context/lib/module/NativeSafeAreaProvider.web';

/**
 * The provider appends a hidden measurement element to document.body on mount and removes it again
 * on unmount. Upstream removed it via document.body.removeChild(element), which throws NotFoundError
 * when the element is no longer a child of body. During a teardown race it is already detached, and
 * the throw escapes React's passive unmount chain as an uncaught error.
 */
function findMeasurementElement(): HTMLElement | undefined {
    return Array.from(document.body.children).find(
        (node): node is HTMLElement => node instanceof HTMLElement && node.style.position === 'fixed' && node.style.transitionProperty === 'padding',
    );
}

describe('NativeSafeAreaProvider web cleanup', () => {
    it('adds a single measurement element to the body while mounted', () => {
        const {unmount} = render(<NativeSafeAreaProvider onInsetsChange={() => {}} />);

        expect(findMeasurementElement()).toBeDefined();

        unmount();

        expect(findMeasurementElement()).toBeUndefined();
    });

    it('does not throw when the measurement element was detached before unmount', () => {
        const {unmount} = render(<NativeSafeAreaProvider onInsetsChange={() => {}} />);

        const element = findMeasurementElement();
        if (!element) {
            throw new Error('the provider did not add its measurement element');
        }

        // Reproduce the teardown race: the element is gone from the body before cleanup runs.
        element.remove();

        expect(() => unmount()).not.toThrow();
    });
});
