import {render, screen} from '@testing-library/react-native';

import Popover from '@components/Popover';
import type * as PopoverWeb from '@components/Popover/index';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {ComponentRef} from 'react';
import type * as ReactDOM from 'react-dom';
import type {View as ViewComponent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

// Only the web popover chooses between the two, and jest resolves the native variant by default
jest.mock('@components/Popover', () => jest.requireActual<typeof PopoverWeb>('@components/Popover/index.tsx'));

// The overlay-free popover is portalled to the document body, which is outside the tree the queries search
jest.mock('react-dom', () => ({...jest.requireActual<typeof ReactDOM>('react-dom'), createPortal: (children: React.ReactNode) => children}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useSidePanelState', () => jest.fn(() => ({isSidePanelTransitionEnded: true})));

// Each stands in for one of the two the popover picks between, so which one it picked can be read off the tree
jest.mock('@components/Modal', () => {
    const {View: MockedView} = jest.requireActual<{View: typeof ViewComponent}>('react-native');
    return (props: {children?: React.ReactNode}) => <MockedView testID="with-overlay">{props.children}</MockedView>;
});

jest.mock('@components/PopoverWithoutOverlay', () => {
    const {View: MockedView} = jest.requireActual<{View: typeof ViewComponent}>('react-native');
    return (props: {children?: React.ReactNode}) => <MockedView testID="without-overlay">{props.children}</MockedView>;
});

const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

type LayoutOptions = {isSmallScreenWidth: boolean; shouldUseNarrowLayout: boolean};

function PopoverUnderTest({shouldAllowWithoutOverlayInNarrowPane}: {shouldAllowWithoutOverlayInNarrowPane: boolean}) {
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    return (
        <Popover
            isVisible
            onClose={() => {}}
            withoutOverlay
            shouldAllowWithoutOverlayInNarrowPane={shouldAllowWithoutOverlayInNarrowPane}
            anchorPosition={{left: 0, top: 0}}
            anchorRef={anchorRef}
        >
            <View />
        </Popover>
    );
}

function renderPopover(layout: LayoutOptions, shouldAllowWithoutOverlayInNarrowPane: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    mockedUseResponsiveLayout.mockReturnValue({...layout, isInNarrowPaneModal: false} as ReturnType<typeof useResponsiveLayout>);

    return render(<PopoverUnderTest shouldAllowWithoutOverlayInNarrowPane={shouldAllowWithoutOverlayInNarrowPane} />);
}

/** A right hand pane on a wide screen, which reports a narrow layout while the window itself is wide */
const RIGHT_HAND_PANE = {isSmallScreenWidth: false, shouldUseNarrowLayout: true};
const WIDE_SCREEN = {isSmallScreenWidth: false, shouldUseNarrowLayout: false};
const SMALL_SCREEN = {isSmallScreenWidth: true, shouldUseNarrowLayout: true};

describe('Popover overlay choice', () => {
    afterEach(() => {
        mockedUseResponsiveLayout.mockReset();
    });

    it('never reaches the choice on a wide screen', () => {
        // Given a wide screen, where a popover is already shown beside its anchor
        renderPopover(WIDE_SCREEN, true);

        // When it renders
        // Then it takes the path it always did, so opting in changes nothing outside a narrow pane
        expect(screen.getByTestId('with-overlay')).toBeTruthy();
    });

    it('takes the overlay in a narrow pane by default', () => {
        // Given the same popover in a right hand pane, which is assumed to have no room beside the anchor
        renderPopover(RIGHT_HAND_PANE, false);

        // When it renders
        // Then it falls back to the full modal
        expect(screen.getByTestId('with-overlay')).toBeTruthy();
    });

    it('skips the overlay in a narrow pane for a caller that opts in', () => {
        // Given a popover that knows it fits beside its anchor even in a pane, such as the calendar beside a date field
        renderPopover(RIGHT_HAND_PANE, true);

        // When it renders
        // Then it keeps the overlay-free popover, so what is being typed stays visible behind it
        expect(screen.getByTestId('without-overlay')).toBeTruthy();
    });

    it('takes the overlay on a small screen even for a caller that opts in', () => {
        // Given that same caller on a window with no room beside the anchor at all
        renderPopover(SMALL_SCREEN, true);

        // When it renders
        // Then the full modal comes back, since opting in is judged on screen size rather than on the pane
        expect(screen.getByTestId('with-overlay')).toBeTruthy();
    });
});
