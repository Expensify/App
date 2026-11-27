import {render, screen} from '@testing-library/react-native';

import ChartTooltip from '@components/Charts/components/ChartTooltip';
import FSClassView from '@components/FSClassView';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

import createSharedValueMock from '../utils/createSharedValueMock';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
}));

// On web the portal moves the tooltip to <body>, out of the views above the chart. The mock marks where that happens, so
// classes above it don't count, and drops the anchor, which needs a measured chart.
const mockPortalTestID = 'chart-tooltip-portal';
jest.mock('@components/Charts/components/ChartTooltipPortal', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return ({children}: {children: React.ReactNode}) => <View testID={mockPortalTestID}>{children}</View>;
});
jest.mock('@components/Charts/components/ChartTooltipAnchor', () => () => null);

const LABEL = 'Airfare';

const TOOLTIP_POSITION = createSharedValueMock({x: 0, y: 0});

function renderTooltip() {
    return (
        <ChartTooltip
            label={LABEL}
            chartWidth={300}
            initialTooltipPosition={TOOLTIP_POSITION}
            onDismiss={() => {}}
        >
            {null}
        </ChartTooltip>
    );
}

/** The FullStory class the tooltip's label is recorded with: the closest one set between the label and the portal */
function getTooltipFSClass(): string | undefined {
    const label = screen.getByText(LABEL);
    let element: typeof label | null = label;
    while (element && (element.props as {testID?: string}).testID !== mockPortalTestID) {
        const fsClass = (element.props as {fsClass?: string}).fsClass;
        if (fsClass) {
            return fsClass;
        }
        element = element.parent;
    }
    return undefined;
}

describe('ChartTooltip FullStory class', () => {
    it('is unmasked when no masked container is above the chart', () => {
        // Given a chart rendered like on Insights, with no FSClassView above it

        // When its tooltip renders, which happens in a portal outside the app root's class
        render(renderTooltip());

        // Then the tooltip sets fs-unmask itself, so it's recorded like the rest of the app
        expect(getTooltipFSClass()).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });

    it('takes the class of a masked container above the chart', () => {
        // Given a chart rendered inside a masked container
        // When its tooltip renders in the portal
        render(<FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>{renderTooltip()}</FSClassView>);

        // Then the tooltip keeps the container's mask, since the portal moves it out of that container
        expect(getTooltipFSClass()).toBe(CONST.FULLSTORY.CLASS.MASK);
    });
});
