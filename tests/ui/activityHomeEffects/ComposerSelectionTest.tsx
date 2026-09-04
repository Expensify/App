import {act, render} from '@testing-library/react-native';

import Composer from '@components/Composer/implementation/index.native';

import React from 'react';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

const mockSetSelection = jest.fn<void, [start: number, end: number]>();

// The composer reaches its input through `setSelection`, which the shipped live-markdown mock does not have. This
// stands in for the input and publishes itself to the composer the way the real one does.
jest.mock('@components/RNMarkdownTextInput', () => {
    const mockReact = jest.requireActual<typeof React>('react');

    return {
        __esModule: true,
        default: ({ref}: {ref?: (input: {setSelection: typeof mockSetSelection} | null) => void}) => {
            mockReact.useEffect(() => {
                ref?.({setSelection: mockSetSelection});
                return () => ref?.(null);
            }, [ref]);
            return null;
        },
    };
});

const SELECTION = {start: 4, end: 4};

/**
 * The Concierge prompt on Home is this composer. Its selection effect exists to scroll the caret back into view when
 * the composer is toggled out of full size, and it deliberately depends on that size alone. An effect remount repeats
 * the move for a toggle that never happened, so a reveal would scroll a composer the user has scrolled away from.
 */
describe('Composer on native', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // The composer schedules its caret move on a timer, and only a fake clock installed here advances it.
        jest.useFakeTimers();
    });

    it('moves the caret once for the size it mounted with', async () => {
        const screenCover = renderScreenWithCover(
            <Composer
                value="Book a flight"
                selection={SELECTION}
                isComposerFullSize={false}
            />,
        );
        act(() => {
            jest.advanceTimersByTime(1);
        });
        // The composer sets the selection twice in a row, which is what scrolls the input to the caret.
        expect(mockSetSelection).toHaveBeenCalledTimes(2);

        await screenCover.hide();
        await screenCover.reveal();
        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(mockSetSelection).toHaveBeenCalledTimes(2);
        screenCover.unmount();
    });

    it('moves the caret when the composer leaves full size', () => {
        const {rerender} = render(
            <Composer
                value="Book a flight"
                selection={SELECTION}
                isComposerFullSize
            />,
        );
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(mockSetSelection).not.toHaveBeenCalled();

        rerender(
            <Composer
                value="Book a flight"
                selection={SELECTION}
                isComposerFullSize={false}
            />,
        );
        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(mockSetSelection).toHaveBeenCalledTimes(2);
    });
});
