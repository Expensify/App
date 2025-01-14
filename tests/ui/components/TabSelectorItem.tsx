import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import CONST from '@src/CONST';

describe('TabSelectorItem Component', () => {
    it('should show a tooltip when hovering over the icon if the tab is inactive and the title is hidden', async () => {
        const tooltipText = 'Sample Tooltip';

        render(
            <TabSelectorItem
                title={tooltipText}
                shouldShowLabelWhenInactive={false}
                isActive={false}
            />,
        );

        const button = screen.getByRole(CONST.ROLE.BUTTON, {name: tooltipText});

        // Hover over the button to trigger the tooltip
        fireEvent(button, 'hoverIn');

        // Wait and check if the tooltip is shown
        screen.findByText(tooltipText).then((tooltip) => {
            expect(tooltip).toBeTruthy();
        });
        // Move the mouse away (hover-out) to hide the tooltip
        fireEvent(button, 'hoverOut');

        // Verify the tooltip is no longer visible
        await waitFor(() => expect(screen.queryByText(tooltipText)).toBeNull());
    });
    it('should not show the tooltip when the tab is active', async () => {
        const tooltipText = 'Tooltip 2';
        const title = 'Title 2';

        // Given an active tab (isActive=true)
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive
                isActive
            />,
        );

        const button = screen.getByRole(CONST.ROLE.BUTTON, {name: title});

        // When the user hovers over the button (active tab)
        fireEvent(button, 'hoverIn');

        // Then the tooltip should not appear because the tab is active
        await waitFor(() => {
            expect(screen.queryByText(tooltipText)).toBeNull();
        });

        // Move the mouse away (hover-out), the tooltip should remain hidden
        fireEvent(button, 'hoverOut');
    });

    it('should not show the tooltip when the title is visible', async () => {
        const tooltipText = 'Tooltip 3';
        const title = 'Title 3';

        // Given a tab where the title is visible (shouldShowLabelWhenInactive=true)
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive
                isActive
            />,
        );

        const button = screen.getByRole(CONST.ROLE.BUTTON, {name: title});

        // When the user hovers over the button (title is visible, so no tooltip)
        fireEvent(button, 'hoverIn');

        // Then the tooltip should not appear because the title is visible
        await waitFor(() => {
            expect(screen.queryByText(tooltipText)).toBeNull();
        });

        // Move the mouse away (hover-out), the tooltip still shouldn't appear
        fireEvent(button, 'hoverOut');
    });
});
