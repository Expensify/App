/**
 * @jest-environment jsdom
 */
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {Dimensions, View} from 'react-native';
import type {ViewStyle} from 'react-native';
import useAnchoredPosition from '@components/Overlay/hooks/useAnchoredPosition/index.web';
import type {UseAnchoredPositionInput} from '@components/Overlay/hooks/useAnchoredPosition/shared';
import CONST from '@src/CONST';

jest.mock('@hooks/useThemeStyles', () => () => ({
    pFixed: {position: 'fixed'},
    overlayCenteringTransform: {transform: 'translateX(-50%)'},
}));

jest.mock('@styles/variables', () => ({
    __esModule: true,
    default: {gutterWidth: 8},
}));

const horizontal = CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL;
const vertical = CONST.MODAL.ANCHOR_ORIGIN_VERTICAL;

function makeAnchorRect(left: number, top: number, width: number, height: number) {
    return {left, top, right: left + width, bottom: top + height, width, height, x: left, y: top};
}

type ProbeState = {
    style: ViewStyle;
    isPositioned: boolean;
    available: {height: number; width: number};
};

function Probe({input, onState}: {input: UseAnchoredPositionInput; onState: (state: ProbeState) => void}) {
    const {style, isPositioned, available, onContentLayout} = useAnchoredPosition(input);
    onState({style, isPositioned, available});
    return (
        <View
            testID="probe-surface"
            onLayout={onContentLayout}
        />
    );
}

function dispatchLayout(width: number, height: number) {
    fireEvent(screen.getByTestId('probe-surface'), 'onLayout', {nativeEvent: {layout: {x: 0, y: 0, width, height}}});
}

describe('useAnchoredPosition (web) — centered pre-measure', () => {
    it('applies translateX(-50%) for centered alignment before measurement', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        expect(states.at(-1)?.style).toMatchObject({transform: 'translateX(-50%)'});
    });

    it('keeps isPositioned=false for centered alignment until first onLayout (so maxHeight is not applied during measurement)', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        expect(states.at(-1)?.isPositioned).toBe(false);
    });

    it('flips isPositioned=true for centered alignment once onLayout fires', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        dispatchLayout(150, 60);
        expect(states.at(-1)?.isPositioned).toBe(true);
    });

    it('drops the centering transform once measurement completes', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        dispatchLayout(150, 60);
        expect(states.at(-1)?.style).not.toHaveProperty('transform');
    });
});

describe('useAnchoredPosition (web) — width cap', () => {
    it('caps available.width to a content-independent bound (viewport minus both gutters), stable across content widths', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        const expectedWidth = Dimensions.get('window').width - 2 * 8;

        dispatchLayout(150, 60);
        const narrowContentWidth = states.at(-1)?.available.width;

        dispatchLayout(5000, 60);
        const wideContentWidth = states.at(-1)?.available.width;

        expect(narrowContentWidth).toBe(expectedWidth);
        expect(wideContentWidth).toBe(narrowContentWidth);
    });
});
