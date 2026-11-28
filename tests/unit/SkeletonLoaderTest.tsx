import {fireEvent, render, screen, within} from '@testing-library/react-native';

import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import SkeletonLoader, {SkeletonViewRect} from '@components/SkeletonLoader';
import {getSkeletonRadius, resolveSkeletonDimension} from '@components/SkeletonLoader/geometry';
import SkeletonRect from '@components/SkeletonRect';
import ItemListSkeletonView from '@components/Skeletons/ItemListSkeletonView';

import Accessibility from '@libs/Accessibility';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Rect} from 'react-native-svg';

jest.mock('@hooks/useThemeStyles', () => () => ({
    pAbsolute: {position: 'absolute'},
    pRelative: {position: 'relative'},
    overflowHidden: {overflow: 'hidden'},
    mr5: {marginRight: 20},
    flex1: {flex: 1},
    pointerEventsNone: {pointerEvents: 'none'},
}));
jest.mock('@hooks/useTheme', () => () => ({skeletonLHNIn: '#111111', skeletonLHNOut: '#333333'}));
jest.mock('@libs/Accessibility', () => ({useReducedMotion: jest.fn(() => false)}));

const palette = {backgroundColor: '#111111', foregroundColor: '#333333'};

function getStyle(testID: string): unknown {
    const style: unknown = StyleSheet.flatten(screen.getByTestId(testID, {includeHiddenElements: true}).props.style);
    return style;
}

function Shapes() {
    return (
        <>
            <SkeletonViewRect
                testID="bar"
                x={72}
                y={12.5}
                width="100%"
                height={8}
            />
            <SkeletonViewRect
                testID="circle"
                width={40}
                height={40}
                borderRadius={20}
            />
        </>
    );
}

describe('SkeletonLoader', () => {
    beforeEach(() => jest.mocked(Accessibility.useReducedMotion).mockReturnValue(false));

    it('preserves whole-canvas percentages, fractional offsets, clipping and corner radii', () => {
        // Given shapes that extend beyond the canvas after translation.
        render(
            <SkeletonLoader
                {...palette}
                width={200}
                height={64}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>,
        );
        // When resolving their View geometry.
        const bar = getStyle('bar');
        // Then percentages do not shrink to the remaining width, and clipping stays explicit.
        expect(bar).toMatchObject({left: 72, top: 12.5, width: '100%', height: 8, borderRadius: 2, overflow: 'hidden'});
        expect(getStyle('circle')).toMatchObject({width: 40, height: 40, borderRadius: 20});
        expect(getStyle('loader')).toMatchObject({overflow: 'hidden', height: 64});
    });

    it('keeps shape dimensions responsive when styles override the declared canvas width', () => {
        // Given a canvas whose actual width is changed by its caller's style.
        render(
            <SkeletonLoader
                {...palette}
                testID="loader"
                width={200}
                height={64}
                style={{width: 150}}
            >
                <Shapes />
            </SkeletonLoader>,
        );
        // When the caller's style overrides the canvas, without any measurement.
        const canvas = getStyle('loader');
        // Then shapes remain responsive to the overridden viewport.
        expect(getStyle('bar')).toMatchObject({width: '100%'});
        expect(canvas).toMatchObject({width: 150});
    });

    it('removes animation immediately for static mode and live reduced-motion changes', () => {
        // Given an animated loader with a non-default speed.
        const loader = (animate: boolean) => (
            <SkeletonLoader
                {...palette}
                animate={animate}
                speed={3}
                width={200}
                height={64}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>
        );
        const view = render(loader(true));
        expect(getStyle('loader-pulse')).toMatchObject({animationDuration: 3000});
        // When disabled by the caller, and then by the accessibility setting.
        view.rerender(loader(false));
        expect(screen.queryByTestId('loader-pulse', {includeHiddenElements: true})).toBeNull();
        view.rerender(loader(true));
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(true);
        view.rerender(loader(true));
        // Then shapes retain their base color without an animated foreground layer.
        expect(screen.queryByTestId('loader-pulse', {includeHiddenElements: true})).toBeNull();
        expect(getStyle('bar')).toMatchObject({backgroundColor: palette.backgroundColor});
    });

    it('fades a foreground shape group rather than the entire canvas', () => {
        // Given the pulse loader with two shapes.
        render(
            <SkeletonLoader
                {...palette}
                width={200}
                height={64}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>,
        );
        // When it renders both color layers.
        const pulseStyle = getStyle('loader-pulse');
        const foregroundShapes = within(screen.getByTestId('loader-pulse', {includeHiddenElements: true})).UNSAFE_getAllByType(SkeletonViewRect);
        // Then only the foreground group animates and shape identifiers remain unique.
        expect(screen.getAllByTestId('bar', {includeHiddenElements: true})).toHaveLength(1);
        expect(getStyle('bar')).not.toHaveProperty('animationName');
        expect(getStyle('circle')).not.toHaveProperty('animationName');
        expect(pulseStyle).toMatchObject({animationIterationCount: 'infinite'});
        expect(getStyle('loader')).not.toHaveProperty('animationName');
        expect(getStyle('bar')).toMatchObject({backgroundColor: palette.backgroundColor});
        expect(foregroundShapes).toHaveLength(2);
        for (const shape of foregroundShapes) {
            expect(StyleSheet.flatten(within(shape).UNSAFE_getByType(View).props.style)).toMatchObject({backgroundColor: palette.foregroundColor});
        }
    });

    it.each([0, NaN])('keeps base geometry static when speed is %s', (speed) => {
        // Given a loader with a speed that cannot run an animation.
        render(
            <SkeletonLoader
                {...palette}
                height={64}
                speed={speed}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>,
        );
        // When the shapes render.
        const bar = getStyle('bar');
        // Then base geometry stays visible without an animated foreground layer.
        expect(bar).toMatchObject({width: '100%', height: 8, backgroundColor: palette.backgroundColor});
        expect(screen.queryByTestId('loader-pulse', {includeHiddenElements: true})).toBeNull();
    });

    it('keeps the legacy rectangle available for unrelated SVG loaders', () => {
        // Given an unmigrated SVG consumer.
        const view = render(
            <SkeletonRect
                width={100}
                height={8}
            />,
        );
        // When rendering the unchanged default export.
        const rectangles = view.UNSAFE_getAllByType(Rect);
        // Then SVG geometry is retained, including the shared rounding rules.
        expect(rectangles.some((rect) => rect.props.width === 100 && rect.props.rx === 2)).toBe(true);
    });

    it('renders list callbacks as Views while retaining layout and single-row opacity', () => {
        // Given a fixed-count list using the sole geometry callback.
        const onLayout = jest.fn();
        const view = render(
            <ItemListSkeletonView
                fixedNumItems={1}
                gradientOpacityEnabled
                shouldAnimate={false}
                onLayout={onLayout}
                itemViewStyle={{width: 200}}
                renderSkeletonItem={() => <Shapes />}
            />,
        );
        // When the callback's new loader receives its actual layout.
        const loader = view.UNSAFE_getByType(SkeletonLoader);
        // Then row fading never divides by zero and height reservation remains intact.
        expect(StyleSheet.flatten(loader.props.style)).toMatchObject({opacity: 1, minHeight: 64, marginRight: 20});
        expect(screen.getByTestId('bar', {includeHiddenElements: true})).toBeTruthy();
        expect(view.UNSAFE_getAllByType(SkeletonViewRect)).toHaveLength(2);
    });

    it('fills the available list height and forwards the layout callback', () => {
        // Given a View list that derives its row count from available height.
        const onLayout = jest.fn();
        const view = render(
            <ItemListSkeletonView
                shouldAnimate={false}
                onLayout={onLayout}
                renderSkeletonItem={() => <Shapes />}
            />,
        );
        const event = {nativeEvent: {layout: {width: 200, height: 130, x: 0, y: 0}}};
        // When the outer list is measured.
        fireEvent(view.UNSAFE_getAllByType(View)[0], 'layout', event);
        // Then a partial final row is reserved and callers still receive the measurement.
        expect(onLayout).toHaveBeenCalledWith(event);
        expect(screen.getAllByTestId('bar', {includeHiddenElements: true})).toHaveLength(3);
    });

    it.each([undefined, '100%'] as const)('lays out percentage shapes without measurement with canvas width %s', (width) => {
        // Given a responsive loader with no numeric canvas dimensions.
        const loader = (animate: boolean) => (
            <SkeletonLoader
                {...palette}
                width={width}
                height="100%"
                animate={animate}
                testID="loader"
            >
                <SkeletonViewRect
                    testID="responsive"
                    x={12.5}
                    width="100%"
                    height="50%"
                />
            </SkeletonLoader>
        );
        const view = render(loader(true));
        // When no measurement is available, and then animation is disabled by either mechanism.
        expect(getStyle('responsive')).toMatchObject({left: 12.5, width: '100%', height: '50%'});
        expect(screen.getByTestId('loader-pulse', {includeHiddenElements: true})).toBeTruthy();
        view.rerender(loader(false));
        // Then static geometry never depends on an onLayout callback having fired.
        expect(getStyle('responsive')).toMatchObject({width: '100%', height: '50%'});
        expect(screen.queryByTestId('loader-pulse', {includeHiddenElements: true})).toBeNull();
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(true);
        view.rerender(loader(true));
        expect(getStyle('responsive')).toMatchObject({width: '100%', height: '50%'});
        expect(screen.queryByTestId('loader-pulse', {includeHiddenElements: true})).toBeNull();
    });

    it.each(['disabled', 'reduced-motion'])('starts pulse after initially %s motion is enabled without a resize', (mode) => {
        // Given a responsive loader with motion initially off.
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(mode === 'reduced-motion');
        const loader = (animate: boolean) => (
            <SkeletonLoader
                {...palette}
                height={64}
                animate={animate}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>
        );
        const view = render(loader(mode !== 'disabled'));
        expect(screen.queryByTestId('loader-pulse', {includeHiddenElements: true})).toBeNull();
        // When motion is enabled without another layout event.
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(false);
        view.rerender(loader(true));
        // Then pulse starts without waiting for layout and static geometry remains unchanged.
        expect(getStyle('loader-pulse')).toMatchObject({animationIterationCount: 'infinite'});
        expect(getStyle('bar')).toMatchObject({width: '100%'});
    });

    it('preserves base geometry through resize and motion changes', () => {
        // Given mounted geometry inside a responsive loader.
        const loader = (animate: boolean, speed = 1.2, width = 200) => (
            <SkeletonLoader
                {...palette}
                height={64}
                animate={animate}
                speed={speed}
                testID="loader"
                width={width}
            >
                <Shapes />
            </SkeletonLoader>
        );
        const view = render(loader(true));
        const baseShape = screen.getByTestId('bar', {includeHiddenElements: true});
        // When the canvas resizes and motion settings change.
        view.rerender(loader(true, 1.2, 320));
        expect(screen.getByTestId('bar', {includeHiddenElements: true})).toBe(baseShape);
        view.rerender(loader(false));
        view.rerender(loader(true, 3));
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(true);
        view.rerender(loader(true, 3));
        // Then the base shape remains mounted while the animated foreground comes and goes.
        expect(screen.getByTestId('bar', {includeHiddenElements: true})).toBe(baseShape);
    });

    it('keeps the loader non-interactive and hidden from accessibility', () => {
        // Given caller styles that would otherwise accept pointer events.
        render(
            <SkeletonLoader
                {...palette}
                height={64}
                style={{pointerEvents: 'auto'}}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>,
        );
        // When the loader is rendered.
        const bar = screen.getByTestId('bar', {includeHiddenElements: true});
        // Then it neither intercepts interaction nor exposes decorative geometry to accessibility.
        expect(getStyle('loader')).toMatchObject({pointerEvents: 'none'});
        expect(screen.getByTestId('loader', {includeHiddenElements: true})).toHaveProp('aria-hidden', true);
        expect(bar).toBeTruthy();
        expect(screen.queryByTestId('bar')).toBeNull();
    });

    it('migrates real options-list geometry, including circles and percentages, without SVG descendants', () => {
        // Given the real options-list caller rather than a synthetic opt-in callback.
        const view = render(
            <OptionsListSkeletonView
                fixedNumItems={3}
                shouldAnimate={false}
            />,
        );
        // When its row callbacks are rendered by the single View loader path.
        const rectangles = view.UNSAFE_getAllByType(SkeletonViewRect);
        // Then every row has View geometry and no legacy SVG rectangles.
        expect(view.UNSAFE_getAllByType(SkeletonLoader)).toHaveLength(3);
        expect(view.UNSAFE_queryAllByType(Rect)).toHaveLength(0);
        expect(rectangles[0].props).toMatchObject({x: 20, y: 12, width: 40, height: 40, borderRadius: 20});
        expect(rectangles.filter((rect) => rect.props.y === 38).map((rect): unknown => rect.props.width)).toEqual(['100%', '50%', '25%']);
    });
});

describe('SkeletonLoader geometry', () => {
    it.each([
        [8, 2],
        [9, 4],
        ['8', 2],
        ['9', 4],
        ['50%', 4],
        [NaN, 4],
        [-1, 2],
        [undefined, 4],
    ] as const)('uses radius %s → %s for View and legacy SVG heights', (height, expectedRadius) => {
        // Given a bar height, including legacy SVG strings and missing or invalid values.
        // When choosing the shared corner radius.
        const radius = getSkeletonRadius(height);
        // Then the small-bar boundary remains at 8, preserving legacy rounding.
        expect(radius).toBe(expectedRadius);
    });

    it.each([
        [8, 8],
        [9, 9],
        ['50%', '50%'],
        [NaN, 0],
        [-8, 0],
    ] as const)('resolves dimension %s → %s without measuring a parent', (dimension, expectedDimension) => {
        // Given a numeric or percentage dimension.
        // When resolving it for a View style.
        const resolved = resolveSkeletonDimension(dimension);
        // Then percentages remain declarative and invalid or negative pixel sizes collapse to zero.
        expect(resolved).toBe(expectedDimension);
    });
});
