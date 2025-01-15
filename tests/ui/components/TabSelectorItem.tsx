import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import Tooltip from '@components/Tooltip';
import CONST from '@src/CONST';

// Mock the Tooltip component since it uses portals which aren't supported in RNTL
jest.mock('@components/Tooltip', () => {
    return jest.fn(({children, shouldRender, text}: {children: React.ReactNode; shouldRender: boolean; text: string}) => {
        return (
            <>
                {shouldRender && <div data-testid="tooltip">{text}</div>}
                {children}
            </>
        );
    });
});

describe('TabSelectorItem Component', () => {
    const defaultProps = {
        title: 'Test Tab',
        icon: 'icon-home',
        onPress: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show tooltip for inactive tab with hidden label', () => {
        // Given an inactive tab with a hidden label
        render(
            <TabSelectorItem
                title="Test Tab"
                shouldShowLabelWhenInactive={false}
                isActive={false}
            />,
        );

        // When hovering over the tab button
        const button = screen.getByRole(CONST.ROLE.BUTTON, {name: defaultProps.title});
        fireEvent(button, 'hoverIn');

        // Then the tooltip should be rendered with correct content because the label is hidden
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: true,
                text: defaultProps.title,
            }),
            expect.any(Object),
        );
    });

    it('should not show tooltip for active tab', () => {
        // Given an active tab
        render(
            <TabSelectorItem
                title="Test Tab"
                shouldShowLabelWhenInactive={false}
                isActive
            />,
        );

        // When hovering over the tab button
        // Then the tooltip should not render because the tab is active
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: false,
                text: defaultProps.title,
            }),
            expect.any(Object),
        );
    });

    it('should not show tooltip when label is visible', () => {
        // Given an inactive tab with visible label
        render(
            <TabSelectorItem
                title="Test Tab"
                shouldShowLabelWhenInactive
                isActive={false}
            />,
        );

        // When hovering over the tab button
        // Then the tooltip should not render because the label is already visible
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: false,
                text: defaultProps.title,
            }),
            expect.any(Object),
        );
    });
});
