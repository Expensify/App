import React from 'react';
import {screen, render, fireEvent} from '@testing-library/react-native';
import {PortalProvider} from '@gorhom/portal';
import Text from '../../src/components/Text';
// eslint-disable-next-line import/extensions
import Tooltip from '../../src/components/Tooltip/index.js'; // Note: manually importing the web version for the sake of this test
import * as DeviceCapabilities from '../../src/libs/DeviceCapabilities';

jest.mock('../../src/libs/DeviceCapabilities');
jest.mock('../../src/components/withWindowDimensions', () => ({
    __esModule: true,
    default: Component => props => (
        <Component
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            windowWidth={1600}
            windowHeight={900}
            isSmallScreenWidth={false}
            isMediumScreenWidth={false}
        />
    ),
    withWindowDimensions: {},
}));

describe('TooltipTest', () => {
    const TestTooltipComponent = (
        <PortalProvider>
            <Tooltip
                text="close"
                onHoverIn={() => {console.log('RORY_DEBUG onHoverIn called on tooltip')}}
            >
                <Text>Hover me</Text>
            </Tooltip>
        </PortalProvider>
    );

    it('Shows text in tooltips', () => {
        // Given a device that supports hover
        DeviceCapabilities.hasHoverSupport = jest.fn().mockImplementation(() => true);

        // When we initially render the tooltip
        render(TestTooltipComponent);

        // The wrapped component should be rendered
        const textElement = screen.queryByText('Hover me');
        expect(textElement).not.toBeNull();

        // But the tooltip text should not be rendered
        let tooltipText = screen.queryByText('close');
        expect(tooltipText).toBeNull();

        // When we hover over the wrapped component
        fireEvent(textElement, 'hoverIn');

        // Then the tooltip text should be displayed
        tooltipText = screen.queryByText('close');
        expect(tooltipText).not.toBeNull();
    });

    it('Does not show on devices without hover capability', () => {
        // Given a device that does not support hover
        DeviceCapabilities.hasHoverSupport = jest.fn().mockImplementation(() => false);

        // When we initially render the tooltip
        render(TestTooltipComponent);

        // The wrapped component should be rendered
        const textElement = screen.queryByText('Hover me');
        expect(textElement).not.toBeNull();

        // But the tooltip text should not be rendered
        let tooltipText = screen.queryByText('close');
        expect(tooltipText).toBeNull();

        // When we hover over the wrapped component
        fireEvent(textElement, 'hoverIn');

        // Then the tooltip text should be not displayed
        tooltipText = screen.queryByText('close');
        expect(tooltipText).toBeNull();
    });
});
