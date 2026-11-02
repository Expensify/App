import {act, render, screen} from '@testing-library/react-native';

import GenericTooltip from '@components/Tooltip/GenericTooltip';
import TooltipSense from '@components/Tooltip/TooltipSense';
import type {GenericTooltipState} from '@components/Tooltip/types';

import type * as Reanimated from 'react-native-reanimated';

import React, {useEffect} from 'react';
import {View} from 'react-native';

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

jest.mock('@components/Tooltip/BaseGenericTooltip', () => {
    const mockReact = jest.requireActual<typeof React>('react');
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    return {
        __esModule: true,
        default: ({animation}: {animation: Reanimated.SharedValue<number>}) => {
            mockAnimation = animation;
            return mockReact.createElement(MockView, {testID: 'tooltip-bubble'});
        },
    };
});

jest.mock('@components/Tooltip/TooltipSense', () => ({
    __esModule: true,
    default: {
        activate: jest.fn(),
        deactivate: jest.fn(),
        isActive: jest.fn(() => false),
    },
}));

jest.mock('@libs/Log', () => ({warn: jest.fn()}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        preferredLocale: 'en',
        translate: (key: string) => key,
    })),
);

function MountCounter({onMount}: {onMount: () => void}) {
    useEffect(() => {
        onMount();
    }, [onMount]);
    return <View testID="tooltip-child" />;
}

describe('GenericTooltip', () => {
    it('does not remount its children when the text toggles between empty and non-empty', () => {
        // Given a tooltip with no text, wrapping a child that counts its mounts. Callers such as a text input toggle `text`
        // to turn the tooltip on and off, and a remount would drop the input's focus.
        const onMount = jest.fn();
        const renderTooltip = (text: string) => <GenericTooltip text={text}>{() => <MountCounter onMount={onMount} />}</GenericTooltip>;
        const {rerender} = render(renderTooltip(''));

        // When the text is set and then cleared again
        rerender(renderTooltip('Full report field name'));
        rerender(renderTooltip(''));

        // Then the child is only mounted once
        expect(onMount).toHaveBeenCalledTimes(1);
    });

    it('renders only its children when the text is empty, and shows the bubble without remounting them once the text is set', () => {
        // Given a tooltip with no text that is hovered. The children still receive `showTooltip`, so a hover can happen
        // while there is nothing to show.
        const onMount = jest.fn();
        let tooltipState: GenericTooltipState | undefined;
        const renderTooltip = (text: string) => (
            <GenericTooltip text={text}>
                {(state) => {
                    tooltipState = state;
                    return <MountCounter onMount={onMount} />;
                }}
            </GenericTooltip>
        );
        const {rerender} = render(renderTooltip(''));
        act(() => {
            tooltipState?.showTooltip();
        });

        // Then the children render but no tooltip bubble does, because there is no content
        expect(screen.getByTestId('tooltip-child')).toBeOnTheScreen();
        expect(screen.queryByTestId('tooltip-bubble')).not.toBeOnTheScreen();

        // When the text is set while the tooltip is still hovered
        rerender(renderTooltip('Full report field name'));

        // Then the bubble renders and the child was not remounted
        expect(screen.getByTestId('tooltip-bubble')).toBeOnTheScreen();
        expect(onMount).toHaveBeenCalledTimes(1);
    });

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
