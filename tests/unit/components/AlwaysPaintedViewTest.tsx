import type {RenderAPI} from '@testing-library/react-native';
import {render} from '@testing-library/react-native';

import AlwaysPaintedView, {getAlwaysPaintedViewConfig} from '@components/AlwaysPaintedView/index.native';

import {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
}));

type CreateAttributePayload = (props: Record<string, unknown>, validAttributes: ReturnType<typeof getAlwaysPaintedViewConfig>['validAttributes']) => Record<string, unknown> | null;

const {create: createAttributePayload} = jest.requireActual<{create: CreateAttributePayload}>('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload');

// A host View runs no effect, so it cannot report its own unmount and the probe has to be a function component.
function UnmountProbe({onUnmount}: {onUnmount: () => void}) {
    useEffect(() => onUnmount, [onUnmount]);
    return <View testID="content" />;
}

function getNativeNodes(toJSON: RenderAPI['toJSON']) {
    const host = toJSON();
    if (!host || Array.isArray(host)) {
        throw new Error('AlwaysPaintedView did not render a native host node');
    }

    const child = host.children?.[0];
    if (!child || typeof child === 'string') {
        throw new Error('AlwaysPaintedView did not render a child node');
    }

    return {child, host};
}

describe('AlwaysPaintedView', () => {
    it('rewrites every display value to contents and leaves the other styles alone', () => {
        // Given the native view config that the component registers
        const {validAttributes} = getAlwaysPaintedViewConfig();

        // When React builds the attribute payload for a style write
        // Then any display value turns into contents, so nothing can give the host a box of its own, and the other styles pass through
        expect(createAttributePayload({style: {display: 'none'}}, validAttributes)).toEqual({display: 'contents'});
        expect(createAttributePayload({style: {display: 'flex'}}, validAttributes)).toEqual({display: 'contents'});
        expect(createAttributePayload({style: {opacity: 0.5, flex: 1}}, validAttributes)).toEqual({opacity: 0.5, flex: 1});
    });

    it('keeps the native host layout-neutral and takes its content out of touch handling while it is covered', () => {
        // Given content wrapped in AlwaysPaintedView
        // When it renders covered
        const {host, child} = getNativeNodes(
            render(
                <AlwaysPaintedView inert>
                    <View testID="content" />
                </AlwaysPaintedView>,
            ).toJSON,
        );

        // Then the host holds no layout of its own, and the content takes neither touches nor accessibility focus
        expect(StyleSheet.flatten(host.props.style)).toEqual({display: 'contents'});
        expect(child.props['aria-hidden']).toBe(true);
        expect(child.props.collapsable).toBe(false);
        expect(child.props.pointerEvents).toBe('none');
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1});
    });

    it('lets touches pass through around the native content while it is not covered', () => {
        // Given content wrapped in AlwaysPaintedView
        // When it renders uncovered
        const {child} = getNativeNodes(
            render(
                <AlwaysPaintedView inert={false}>
                    <View testID="content" />
                </AlwaysPaintedView>,
            ).toJSON,
        );

        // Then touches reach the content again, while the wrapper stays uncollapsed so its style keeps being applied
        expect(child.props['aria-hidden']).toBe(false);
        expect(child.props.collapsable).toBe(false);
        expect(child.props.pointerEvents).toBe('box-none');
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1});
    });

    it('treats a left-out prop as not covered', () => {
        // Given content wrapped in AlwaysPaintedView
        // When it renders without the inert prop
        const {child} = getNativeNodes(
            render(
                <AlwaysPaintedView>
                    <View testID="content" />
                </AlwaysPaintedView>,
            ).toJSON,
        );

        // Then it behaves like an uncovered screen, which is what a caller that never covers its content gets
        expect(child.props['aria-hidden']).toBe(false);
        expect(child.props.pointerEvents).toBe('box-none');
    });

    it('keeps the children mounted when inert flips between left out and provided', () => {
        // Given content that reports its own unmount
        const handleUnmount = jest.fn();
        // When the inert prop is left out, then provided, then left out again
        const {rerender} = render(
            <AlwaysPaintedView>
                <UnmountProbe onUnmount={handleUnmount} />
            </AlwaysPaintedView>,
        );
        rerender(
            <AlwaysPaintedView inert>
                <UnmountProbe onUnmount={handleUnmount} />
            </AlwaysPaintedView>,
        );
        rerender(
            <AlwaysPaintedView>
                <UnmountProbe onUnmount={handleUnmount} />
            </AlwaysPaintedView>,
        );

        // Then the children are never unmounted, so toggling the prop keeps their state
        expect(handleUnmount).not.toHaveBeenCalled();
    });
});
