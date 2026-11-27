import {renderHook} from '@testing-library/react-native';

import useEndPeekOnFocusLeave from '@components/Navigation/useEndPeekOnFocusLeave/index.native';

describe('useEndPeekOnFocusLeave on native', () => {
    it('does not listen to focus or end the peek', () => {
        // Given a peeking surface on native, where no surface peeks on hover and focus moving across the page is a DOM event
        const endPeek = jest.fn();
        const addEventListener = jest.spyOn(document, 'addEventListener');

        // When the hook runs and focus lands somewhere on the page
        renderHook(() => useEndPeekOnFocusLeave({current: null}, true, endPeek));
        document.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

        // Then nothing listens to the focus and the peek is left alone, because the sidebar shares this hook with the web
        expect(addEventListener).not.toHaveBeenCalledWith('focusin', expect.anything());
        expect(endPeek).not.toHaveBeenCalled();

        addEventListener.mockRestore();
    });
});
