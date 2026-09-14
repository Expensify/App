import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

type MockPopoverMenuProps = {isVisible?: boolean; anchorPosition?: {horizontal: number; vertical: number}};

const mockMeasuredAnchor = {horizontal: 0, vertical: 0, width: 40, height: 40};
const mockWindowDimensions = {windowWidth: 1400, windowHeight: 900};
const mockMeasureCount = {current: 0};

/** Records every `PopoverMenu` render so assertions can read the `anchorPosition` it was last given while open. */
const mockPopoverRender = jest.fn<void, [MockPopoverMenuProps]>();

jest.mock('@hooks/useWindowDimensions', () => () => mockWindowDimensions);

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: () => {
        mockMeasureCount.current++;
        return Promise.resolve({...mockMeasuredAnchor});
    },
}));

jest.mock('@hooks/useOnyx', () => () => [undefined, {status: 'loaded'}]);

jest.mock('@components/PopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView} = jest.requireActual('react-native');
    function MockPopoverMenu({isVisible, anchorPosition}: MockPopoverMenuProps) {
        mockPopoverRender({isVisible, anchorPosition});
        return <RNView testID={isVisible ? 'popover-open' : 'popover-closed'} />;
    }
    return MockPopoverMenu;
});

jest.mock('@components/Icon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView} = jest.requireActual('react-native');
    function MockIcon() {
        return <RNView />;
    }
    return MockIcon;
});

jest.mock('@components/Tooltip/PopoverAnchorTooltip', () => {
    function MockTooltip({children}: {children?: ReactNode}) {
        return children;
    }
    return MockTooltip;
});

jest.mock('@components/Tooltip/EducationalTooltip', () => {
    function MockEducationalTooltip({children}: {children?: ReactNode}) {
        return children;
    }
    return MockEducationalTooltip;
});

const setMeasuredAnchor = (horizontal: number, vertical: number) => {
    mockMeasuredAnchor.horizontal = horizontal;
    mockMeasuredAnchor.vertical = vertical;
};

const menuElement = (
    <ThreeDotsMenu
        shouldSelfPosition
        testID="three-dots-menu"
        menuItems={[{text: 'Delete', onSelected: () => {}}]}
    />
);

/** The `anchorPosition` from the most recent render in which the popover was open. */
const lastOpenAnchorPosition = () => mockPopoverRender.mock.calls.map(([props]) => props).findLast((props) => props.isVisible)?.anchorPosition;

/** Lets a pending `calculatePopoverPosition` promise settle without running the reposition debounce. */
const flushPendingMeasurements = () =>
    act(async () => {
        jest.advanceTimersByTime(0);
    });

describe('ThreeDotsMenu repositioning', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        setMeasuredAnchor(1000, 300);
        mockWindowDimensions.windowWidth = 1400;
        mockWindowDimensions.windowHeight = 900;
        mockPopoverRender.mockClear();
        mockMeasureCount.current = 0;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('re-measures the anchor only after the layout has settled following a viewport change', async () => {
        const {rerender} = render(menuElement);

        fireEvent.press(screen.getByTestId('three-dots-menu'));
        await flushPendingMeasurements();

        expect(screen.getByTestId('popover-open')).toBeOnTheScreen();
        expect(lastOpenAnchorPosition()?.horizontal).toBe(1000);

        // The viewport shrinks. Surrounding layout (a virtualized list, for instance) has not repositioned the
        // anchor yet, so measuring at this point would still report the pre-resize coordinates.
        mockWindowDimensions.windowWidth = 1000;
        rerender(menuElement);
        await flushPendingMeasurements();

        // The surrounding layout settles and moves the anchor to its post-resize position.
        setMeasuredAnchor(700, 300);

        await act(async () => {
            jest.advanceTimersByTime(CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        });

        expect(lastOpenAnchorPosition()?.horizontal).toBe(700);
    });

    it('does not re-measure the anchor while the menu is closed', async () => {
        const {rerender} = render(menuElement);
        mockMeasureCount.current = 0;

        mockWindowDimensions.windowWidth = 1000;
        rerender(menuElement);
        await act(async () => {
            jest.advanceTimersByTime(CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        });

        expect(mockMeasureCount.current).toBe(0);
    });
});
