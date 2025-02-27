import {render} from '@testing-library/react-native';
import React from 'react';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import Tooltip from '@components/Tooltip';

// Mock the Tooltip component since it uses portals which aren't supported in RNTL
jest.mock('@components/Tooltip');

describe('TabSelectorItem Component', () => {
    const title = 'Test Tab';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show tooltip for inactive tab with hidden label', () => {
        // Given an inactive tab with a hidden label
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive={false}
                isActive={false}
            />,
        );

        // Then the tooltip should be rendered with correct content because the label is hidden
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: true,
                text: title,
            }),
            expect.any(Object),
        );
    });

    it('should not show tooltip for active tab', () => {
        // Given an active tab
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive={false}
                isActive
            />,
        );

        // When hovering over the tab button
        // Then the tooltip should not render because the tab is active
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: false,
                text: title,
            }),
            expect.any(Object),
        );
    });

    it('should not show tooltip when label is visible', () => {
        // Given an inactive tab with visible label
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive
                isActive={false}
            />,
        );

        // When hovering over the tab button
        // Then the tooltip should not render because the label is already visible
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: false,
                text: title,
            }),
            expect.any(Object),
        );
    });
});
