import {act, render} from '@testing-library/react-native';

import GenericTooltip from '@components/Tooltip/GenericTooltip';
import TooltipSense from '@components/Tooltip/TooltipSense';
import type {GenericTooltipState} from '@components/Tooltip/types';

import type * as Reanimated from 'react-native-reanimated';

import React from 'react';

let mockAnimation: Reanimated.SharedValue<number> | undefined;

// The reanimated mock creates a new shared value on every render, so a value set in an event handler would be lost by the
// next render. Keep one shared value per component instance, like the real hook does.
jest.mock('react-native-reanimated', () => {
    const actualReanimated = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    const {useState} = jest.requireActual<typeof React>('react');
    return {
        ...actualReanimated,
        useSharedValue: <T,>(initialValue: T) => useState(() => actualReanimated.useSharedValue(initialValue))[0],
    };
});

jest.mock('@components/Tooltip/BaseGenericTooltip', () => ({
    __esModule: true,
    default: ({animation}: {animation: Reanimated.SharedValue<number>}) => {
        mockAnimation = animation;
        return null;
    },
}));

jest.mock('@components/Tooltip/TooltipSense', () => ({
    __esModule: true,
    default: {
        activate: jest.fn(),
        deactivate: jest.fn(),
        isActive: jest.fn(() => false),
    },
}));

jest.mock('@libs/Log', () => ({warn: jest.fn()}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({preferredLocale: 'en'})));

describe('GenericTooltip', () => {
    it('defers the instant TooltipSense show until the visible state commits', () => {
        // Given a tooltip that was shown once and hidden again, while TooltipSense is active because another tooltip was just hovered
        let tooltipState: GenericTooltipState | undefined;
        render(
            <GenericTooltip text="Tooltip">
                {(state) => {
                    tooltipState = state;
                    return null;
                }}
            </GenericTooltip>,
        );
        act(() => tooltipState?.showTooltip());
        act(() => tooltipState?.hideTooltip());
        jest.mocked(TooltipSense.isActive).mockReturnValue(true);

        // When the tooltip is shown again
        act(() => {
            tooltipState?.showTooltip();

            // Then it stays hidden until the visible state commits, because its target bounds are only re-measured on that commit
            // and showing it earlier would paint it at its previous position for a frame
            expect(mockAnimation?.get()).toBe(0);
        });

        // Then it shows instantly once the commit happened
        expect(mockAnimation?.get()).toBe(1);
    });
});
