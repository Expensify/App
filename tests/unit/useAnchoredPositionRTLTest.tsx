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

function makeProbe(): {capture: () => ProbeState; Probe: (props: {input: UseAnchoredPositionInput}) => React.ReactElement} {
    let snapshot: ProbeState = {edgeStyle: {}, isPositioned: false};
    function Probe({input}: {input: UseAnchoredPositionInput}) {
        const {edgeStyle, isPositioned, onContentLayout} = useAnchoredPositionShared(input);
        snapshot = {edgeStyle, isPositioned};
        return (
            <View
                testID="probe-surface"
                onLayout={onContentLayout}
            />
        );
    }
    return {Probe, capture: () => snapshot};
}

function dispatchLayout(width: number, height: number) {
    fireEvent(screen.getByTestId('probe-surface'), 'onLayout', {nativeEvent: {layout: {x: 0, y: 0, width, height}}});
}

describe('useAnchoredPositionShared — RTL', () => {
    it('renders LEFT-aligned content with `left` style in LTR', () => {
        isRTL = false;
        const {Probe, capture} = makeProbe();
        render(<Probe input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}} />);
        expect(capture().edgeStyle).toMatchObject({left: 100});
        expect(capture().edgeStyle).not.toHaveProperty('right');
    });

    it('flips LEFT → `right` style when RTL is on', () => {
        isRTL = true;
        const {Probe, capture} = makeProbe();
        render(<Probe input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}} />);
        expect(capture().edgeStyle).toHaveProperty('right');
        expect(capture().edgeStyle).not.toHaveProperty('left');
    });

    it('flips RIGHT → `left` style when RTL is on', () => {
        isRTL = true;
        const {Probe, capture} = makeProbe();
        render(<Probe input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.RIGHT, vertical: vertical.TOP}}} />);
        expect(capture().edgeStyle).toHaveProperty('left');
        expect(capture().edgeStyle).not.toHaveProperty('right');
    });

    it('does NOT flip CENTER alignment under RTL — center is symmetric', () => {
        isRTL = true;
        const {Probe, capture} = makeProbe();
        render(<Probe input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.CENTER, vertical: vertical.TOP}}} />);
        expect(capture().edgeStyle).toHaveProperty('left');
        expect(capture().edgeStyle).not.toHaveProperty('right');
    });

    it('RTL flip survives a content-layout cycle (still uses `right` after measure)', () => {
        isRTL = true;
        const {Probe, capture} = makeProbe();
        render(<Probe input={{anchorRect: makeAnchorRect(100, 100, 200, 40), alignment: {horizontal: horizontal.LEFT, vertical: vertical.TOP}}} />);
        dispatchLayout(150, 60);
        expect(capture().isPositioned).toBe(true);
        expect(capture().edgeStyle).toHaveProperty('right');
        expect(capture().edgeStyle).not.toHaveProperty('left');
    });
});
