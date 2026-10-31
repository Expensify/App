import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type {ThreeDotsMenuHandle} from '@components/ThreeDotsMenu/types';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React, {createRef} from 'react';

type MockPopoverMenuProps = {isVisible?: boolean; anchorPosition?: {horizontal: number; vertical: number}};

const mockMeasuredAnchor = {horizontal: 0, vertical: 0, width: 40, height: 40};
const mockMeasureCount = {current: 0};

/** Records every `PopoverMenu` render so assertions can read the `anchorPosition` it was last given while open. */
const mockPopoverRender = jest.fn<void, [MockPopoverMenuProps]>();

// Stable identities, so the menu's reposition effect doesn't re-run on every render
const mockPopoverPosition = {
    calculatePopoverPosition: () => {
        mockMeasureCount.current++;
        return Promise.resolve({...mockMeasuredAnchor});
    },
};
const anchorAlignment = {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP};
const menuItems = [{text: 'Delete', onSelected: () => {}}];

jest.mock('@hooks/usePopoverPosition', () => () => mockPopoverPosition);

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

/** The `anchorPosition` from the most recent render in which the popover was open. */
const lastOpenAnchorPosition = () => mockPopoverRender.mock.calls.map(([props]) => props).findLast((props) => props.isVisible)?.anchorPosition;

const renderMenu = () => {
    const menuRef = createRef<ThreeDotsMenuHandle>();
    render(
        <ThreeDotsMenu
            shouldSelfPosition
            testID="three-dots-menu"
            threeDotsMenuRef={menuRef}
            anchorAlignment={anchorAlignment}
            menuItems={menuItems}
        />,
    );
    return menuRef;
};

describe('ThreeDotsMenu updateMenuPosition', () => {
    beforeEach(() => {
        setMeasuredAnchor(1000, 300);
        mockPopoverRender.mockClear();
        mockMeasureCount.current = 0;
    });

    it('moves the open menu to the anchor position measured when the caller reports the anchor moved', async () => {
        // Given an open menu anchored to a button
        const menuRef = renderMenu();
        fireEvent.press(screen.getByTestId('three-dots-menu'));
        expect(await screen.findByTestId('popover-open')).toBeOnTheScreen();
        expect(lastOpenAnchorPosition()?.horizontal).toBe(1000);

        // When the button moves without a window resize (for example, a list row gets its new width a frame later)
        // and the row asks the menu to re-measure
        setMeasuredAnchor(1200, 300);
        await act(async () => {
            menuRef.current?.updateMenuPosition?.();
        });

        // Then the popover follows the button to its new position
        expect(lastOpenAnchorPosition()?.horizontal).toBe(1200);
    });

    it('does not measure the anchor while the menu is closed', async () => {
        // Given a closed menu
        const menuRef = renderMenu();

        // When the row reports a layout change
        await act(async () => {
            menuRef.current?.updateMenuPosition?.();
        });

        // Then the menu skips the measurement, since there is no popover to move
        expect(mockMeasureCount.current).toBe(0);
    });
});
