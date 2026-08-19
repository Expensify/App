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

// A host View probe cannot detect a remount here, because React reuses a View fiber when the wrapper is also a View.
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
        const {validAttributes} = getAlwaysPaintedViewConfig();

        expect(createAttributePayload({style: {display: 'none'}}, validAttributes)).toEqual({display: 'contents'});
        expect(createAttributePayload({style: {display: 'flex'}}, validAttributes)).toEqual({display: 'contents'});
        expect(createAttributePayload({style: {opacity: 0.5, flex: 1}}, validAttributes)).toEqual({opacity: 0.5, flex: 1});
    });

    it('keeps the native host layout-neutral and takes its content out of touch handling while it is covered', () => {
        const {host, child} = getNativeNodes(
            render(
                <AlwaysPaintedView inert>
                    <View testID="content" />
                </AlwaysPaintedView>,
            ).toJSON,
        );

        expect(StyleSheet.flatten(host.props.style)).toEqual({display: 'contents'});
        expect(child.props['aria-hidden']).toBe(true);
        expect(child.props.collapsable).toBe(false);
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1, pointerEvents: 'none'});
    });

    it('lets touches pass through around the native content while it is not covered', () => {
        const {child} = getNativeNodes(
            render(
                <AlwaysPaintedView inert={false}>
                    <View testID="content" />
                </AlwaysPaintedView>,
            ).toJSON,
        );

        expect(child.props['aria-hidden']).toBe(false);
        expect(child.props.collapsable).toBe(false);
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1, pointerEvents: 'box-none'});
    });

    it('treats a left-out prop as not covered', () => {
        const {child} = getNativeNodes(
            render(
                <AlwaysPaintedView>
                    <View testID="content" />
                </AlwaysPaintedView>,
            ).toJSON,
        );

        expect(child.props['aria-hidden']).toBe(false);
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1, pointerEvents: 'box-none'});
    });

    it('keeps the children mounted when inert flips between left out and provided', () => {
        const handleUnmount = jest.fn();
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

        expect(handleUnmount).not.toHaveBeenCalled();
    });
});
