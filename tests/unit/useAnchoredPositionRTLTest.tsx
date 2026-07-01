import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {I18nManager, View} from 'react-native';
import type {ViewStyle} from 'react-native';
import useAnchoredPositionShared from '@components/Overlay/hooks/useAnchoredPosition/shared';
import type {UseAnchoredPositionInput} from '@components/Overlay/hooks/useAnchoredPosition/shared';
import CONST from '@src/CONST';

jest.mock('@styles/variables', () => ({
    __esModule: true,
    default: {gutterWidth: 8},
}));

let isRTL = false;

beforeAll(() => {
    Object.defineProperty(I18nManager, 'isRTL', {configurable: true, get: () => isRTL});
});

beforeEach(() => {
    isRTL = false;
});

const horizontal = CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL;
const vertical = CONST.MODAL.ANCHOR_ORIGIN_VERTICAL;

function makeAnchorRect(left: number, top: number, width: number, height: number) {
    return {left, top, right: left + width, bottom: top + height, width, height, x: left, y: top};
}

type ProbeState = {
    edgeStyle: ViewStyle;
    isPositioned: boolean;
};

function Probe({input, onState}: {input: UseAnchoredPositionInput; onState: (state: ProbeState) => void}) {
    const {edgeStyle, isPositioned, onContentLayout} = useAnchoredPositionShared(input);
    onState({edgeStyle, isPositioned});
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

describe('useAnchoredPositionShared — RTL', () => {
    it('renders LEFT-aligned content with `left` style in LTR', () => {
        isRTL = false;
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        expect(states.at(-1)?.edgeStyle).toMatchObject({left: 100});
        expect(states.at(-1)?.edgeStyle).not.toHaveProperty('right');
    });

    it('flips LEFT → `right` style when RTL is on', () => {
        isRTL = true;
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        expect(states.at(-1)?.edgeStyle).toHaveProperty('right');
        expect(states.at(-1)?.edgeStyle).not.toHaveProperty('left');
    });

    it('flips RIGHT → `left` style when RTL is on', () => {
        isRTL = true;
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.RIGHT, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        expect(states.at(-1)?.edgeStyle).toHaveProperty('left');
        expect(states.at(-1)?.edgeStyle).not.toHaveProperty('right');
    });

    it('does NOT flip CENTER alignment under RTL — center is symmetric', () => {
        isRTL = true;
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        expect(states.at(-1)?.edgeStyle).toHaveProperty('left');
        expect(states.at(-1)?.edgeStyle).not.toHaveProperty('right');
    });

    it('RTL flip survives a content-layout cycle (still uses `right` after measure)', () => {
        isRTL = true;
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        dispatchLayout(150, 60);
        expect(states.at(-1)?.isPositioned).toBe(true);
        expect(states.at(-1)?.edgeStyle).toHaveProperty('right');
        expect(states.at(-1)?.edgeStyle).not.toHaveProperty('left');
    });
});

describe('useAnchoredPositionShared — centered horizontal clamping', () => {
    it('clamps a wide centered surface near the LEFT viewport edge to the gutter', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(0, 100, 40, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}}
                onState={(state) => states.push(state)}
            />,
        );
        dispatchLayout(800, 60);
        const left = Reflect.get(states.at(-1)?.edgeStyle ?? {}, 'left');
        expect(typeof left).toBe('number');
        expect(left).toBeGreaterThanOrEqual(8);
    });
});

describe('useAnchoredPositionShared — vertical CENTER', () => {
    it('positions content centered over the anchor when vertical alignment is CENTER', () => {
        const states: ProbeState[] = [];
        render(
            <Probe
                input={{anchorRect: makeAnchorRect(100, 200, 200, 100), alignment: {horizontal: horizontal.LEFT, vertical: vertical.CENTER}}}
                onState={(state) => states.push(state)}
            />,
        );
        dispatchLayout(150, 80);
        const style = states.at(-1)?.edgeStyle ?? {};
        expect(Reflect.get(style, 'bottom')).toBeUndefined();
        expect(Reflect.get(style, 'top')).toBe(210);
    });
});
