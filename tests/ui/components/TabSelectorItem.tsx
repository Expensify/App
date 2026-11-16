import {render} from '@testing-library/react-native';

import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import Tooltip from '@components/Tooltip';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

// Mock the Tooltip component since it uses portals which aren't supported in RNTL
jest.mock('@components/Tooltip');
jest.mock('@libs/getPlatform', () => jest.fn(() => 'ios'));

// The mocked Tooltip renders nothing, so the tab is read from the element it wraps
function getTabAccessibilityLabel() {
    const tab = jest.mocked(Tooltip).mock.lastCall?.[0].children;
    return React.isValidElement<{accessibilityLabel?: string}>(tab) ? tab.props.accessibilityLabel : undefined;
}

describe('TabSelectorItem Component', () => {
    const title = 'Test Tab';
    const tabKey = 'test-tab';

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
                tabKey={tabKey}
            />,
        );

        // Then the tooltip should be rendered with correct content because the label is hidden
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: true,
                text: title,
            }),
            undefined,
        );
    });

    it('should not show tooltip for active tab', () => {
        // Given an active tab
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive={false}
                isActive
                tabKey={tabKey}
            />,
        );

        // When hovering over the tab button
        // Then the tooltip should not render because the tab is active
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: false,
                text: title,
            }),
            undefined,
        );
    });

    it('should not show tooltip when label is visible', () => {
        // Given an inactive tab with visible label
        render(
            <TabSelectorItem
                title={title}
                shouldShowLabelWhenInactive
                isActive={false}
                tabKey={tabKey}
            />,
        );

        // When hovering over the tab button
        // Then the tooltip should not render because the label is already visible
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldRender: false,
                text: title,
            }),
            undefined,
        );
    });

    it('adds the question to the tab label on native', () => {
        // Given a tab answering a question on iOS, where the group around the tabs is not read
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);

        // When it renders with the question
        render(
            <TabSelectorItem
                title="Person"
                tabKey={tabKey}
                groupAccessibilityLabel="Recipient type"
            />,
        );

        // Then screen readers hear the question with the tab
        expect(getTabAccessibilityLabel()).toBe('Person, Recipient type');
    });

    it('keeps the tab label as its title on web', () => {
        // Given a tab answering a question on web, where the group around the tabs carries the question
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);

        // When it renders with the question
        render(
            <TabSelectorItem
                title="Person"
                tabKey={tabKey}
                groupAccessibilityLabel="Recipient type"
            />,
        );

        // Then the tab is read by its title alone, so the question is not read twice
        expect(getTabAccessibilityLabel()).toBe('Person');
    });
});
