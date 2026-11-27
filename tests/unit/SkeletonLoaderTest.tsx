import {fireEvent, render, screen} from '@testing-library/react-native';

import SkeletonLoader from '@components/SkeletonLoader';
import SkeletonRect, {SkeletonViewRect} from '@components/SkeletonRect';
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
                height="8"
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
        expect(bar).toMatchObject({left: 72, top: 12.5, width: 200, height: 8, borderRadius: 2, overflow: 'hidden'});
        expect(getStyle('circle')).toMatchObject({width: 40, height: 40, borderRadius: 20});
        expect(getStyle('loader')).toMatchObject({overflow: 'hidden', height: 64});
        expect(getStyle('bar-shimmer')).toMatchObject({left: -72, width: 200, animationDuration: 1200});
    });

    it('uses measured dimensions when styles override the declared canvas width', () => {
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
        // When the layout reports the actual viewport.
        fireEvent(screen.getByTestId('loader', {includeHiddenElements: true}), 'layout', {nativeEvent: {layout: {width: 150, height: 64, x: 0, y: 0}}});
        // Then both the shape percentages and gradient use that viewport.
        expect(getStyle('bar')).toMatchObject({width: 150});
        expect(getStyle('bar-shimmer')).toMatchObject({width: 150});
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
            >
                <Shapes />
            </SkeletonLoader>
        );
        const view = render(loader(true));
        expect(getStyle('bar-shimmer')).toMatchObject({animationDuration: 3000});
        // When disabled by the caller, and then by the accessibility setting.
        view.rerender(loader(false));
        expect(screen.queryByTestId('bar-shimmer', {includeHiddenElements: true})).toBeNull();
        view.rerender(loader(true));
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(true);
        view.rerender(loader(true));
        // Then shapes retain their base color without any animated strips.
        expect(screen.queryByTestId('bar-shimmer', {includeHiddenElements: true})).toBeNull();
        expect(getStyle('bar')).toMatchObject({backgroundColor: palette.backgroundColor});
    });

    it('fades a foreground shape group rather than the entire canvas', () => {
        // Given the pulse comparison candidate.
        render(
            <SkeletonLoader
                {...palette}
                animation="pulse"
                width={200}
                height={64}
                testID="loader"
            >
                <Shapes />
            </SkeletonLoader>,
        );
        // When it renders both color layers.
        const pulseStyle = getStyle('loader-pulse');
        // Then only the foreground group animates and shape identifiers remain unique.
        expect(screen.getAllByTestId('bar', {includeHiddenElements: true})).toHaveLength(1);
        expect(screen.queryByTestId('bar-shimmer', {includeHiddenElements: true})).toBeNull();
        expect(pulseStyle).toMatchObject({animationIterationCount: 'infinite'});
        expect(getStyle('loader')).not.toHaveProperty('animationName');
    });

    it('leaves existing SVG rectangles and list callbacks on their legacy renderer', () => {
        // Given an existing list callback that returns SVG geometry.
        const view = render(
            <ItemListSkeletonView
                fixedNumItems={1}
                gradientOpacityEnabled
                shouldAnimate={false}
                renderSkeletonItem={() => (
                    <SkeletonRect
                        width={100}
                        height={8}
                    />
                )}
            />,
        );
        // When rendering without opting into View geometry.
        const rectangles = view.UNSAFE_getAllByType(Rect);
        // Then SVG geometry is retained, including the shared rounding rules.
        expect(rectangles.some((rect) => rect.props.width === 100 && rect.props.rx === 2)).toBe(true);
    });

    it('supports View list callbacks while retaining layout and single-row opacity', () => {
        // Given a fixed-count list using the new View callback.
        const onLayout = jest.fn();
        const view = render(
            <ItemListSkeletonView
                fixedNumItems={1}
                gradientOpacityEnabled
                shouldAnimate={false}
                onLayout={onLayout}
                itemViewStyle={{width: 200}}
                renderViewSkeletonItem={() => <Shapes />}
            />,
        );
        // When the callback's new loader receives its actual layout.
        const loader = view.UNSAFE_getByType(SkeletonLoader);
        // Then row fading never divides by zero and height reservation remains intact.
        expect(StyleSheet.flatten(loader.props.style)).toMatchObject({opacity: 1, minHeight: 64, marginRight: 20});
        expect(screen.getByTestId('bar', {includeHiddenElements: true})).toBeTruthy();
        expect(screen.queryByTestId('bar-shimmer', {includeHiddenElements: true})).toBeNull();
    });

    it('fills the available list height and forwards the layout callback', () => {
        // Given a View list that derives its row count from available height.
        const onLayout = jest.fn();
        const view = render(
            <ItemListSkeletonView
                shouldAnimate={false}
                onLayout={onLayout}
                renderViewSkeletonItem={() => <Shapes />}
            />,
        );
        const event = {nativeEvent: {layout: {width: 200, height: 130, x: 0, y: 0}}};
        // When the outer list is measured.
        fireEvent(view.UNSAFE_getAllByType(View)[0], 'layout', event);
        // Then a partial final row is reserved and callers still receive the measurement.
        expect(onLayout).toHaveBeenCalledWith(event);
        expect(screen.getAllByTestId('bar', {includeHiddenElements: true})).toHaveLength(3);
    });
});
