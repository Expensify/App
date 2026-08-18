import type {RenderAPI} from '@testing-library/react-native';
import {render as renderNative} from '@testing-library/react-native';

import AlwaysPaintedViewNative, {getAlwaysPaintedViewConfig} from '@components/AlwaysPaintedView/index.native';

import type {ActivityProps, ComponentType, PropsWithChildren, ReactNode} from 'react';
import type {Root} from 'react-dom/client';

import {act, Activity} from 'react';
import {createRoot} from 'react-dom/client';
import {StyleSheet, View} from 'react-native';

/* eslint-disable testing-library/no-unnecessary-act -- this test drives a react-dom root directly, so its renders and cleanup must be wrapped in React act. */

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
}));

type WebAlwaysPaintedViewProps = PropsWithChildren<{inert?: boolean}>;

type CreateAttributePayload = (props: Record<string, unknown>, validAttributes: ReturnType<typeof getAlwaysPaintedViewConfig>['validAttributes']) => Record<string, unknown> | null;

const AlwaysPaintedViewWeb = jest.requireActual<{default: ComponentType<WebAlwaysPaintedViewProps>}>('@components/AlwaysPaintedView/index.tsx').default;
const {create: createAttributePayload} = jest.requireActual<{create: CreateAttributePayload}>('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload');

function ActivityProbe({mode}: {mode: ActivityProps['mode']}) {
    return (
        <Activity mode={mode}>
            <AlwaysPaintedViewWeb>
                <span data-testid="content" />
            </AlwaysPaintedViewWeb>
        </Activity>
    );
}

function mountWebRoot() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    return {
        render: (node: ReactNode) => {
            act(() => {
                root.render(node);
            });
        },
        getHostElement: () => {
            const element = container.querySelector<HTMLSpanElement>('[data-testid="content"]')?.parentElement;
            if (!element) {
                throw new Error('AlwaysPaintedView did not render a DOM element');
            }
            return element;
        },
        unmount: () => {
            act(() => {
                root.unmount();
            });
            container.remove();
        },
    };
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

    it('stays layout-neutral through React DOM Activity hide and reveal paths', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        render(<ActivityProbe mode="visible" />);
        const element = getHostElement();
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        render(<ActivityProbe mode="hidden" />);
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        render(<ActivityProbe mode="visible" />);
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        unmount();
    });

    it('refuses both display write paths React uses and forwards every other style write', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        render(
            <AlwaysPaintedViewWeb>
                <span data-testid="content" />
            </AlwaysPaintedViewWeb>,
        );
        const element = getHostElement();

        element.style.setProperty('display', 'none', 'important');
        expect(element.style.display).toBe('contents');

        element.style.display = 'block';
        expect(element.style.display).toBe('contents');

        element.style.setProperty('opacity', '0.5');
        expect(element.style.opacity).toBe('0.5');

        unmount();
    });

    it('takes the content out of the tab order only while it is covered', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        const renderInert = (inert: boolean) =>
            render(
                <AlwaysPaintedViewWeb inert={inert}>
                    <span data-testid="content" />
                </AlwaysPaintedViewWeb>,
            );

        renderInert(true);
        const element = getHostElement();
        expect(element.hasAttribute('inert')).toBe(true);

        renderInert(false);
        expect(element.hasAttribute('inert')).toBe(false);

        unmount();
    });

    it('keeps the native host layout-neutral and takes its content out of touch handling while it is covered', () => {
        const {host, child} = getNativeNodes(
            renderNative(
                <AlwaysPaintedViewNative inert>
                    <View testID="content" />
                </AlwaysPaintedViewNative>,
            ).toJSON,
        );

        expect(StyleSheet.flatten(host.props.style)).toEqual({display: 'contents'});
        expect(child.props['aria-hidden']).toBe(true);
        expect(child.props.collapsable).toBe(false);
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1, pointerEvents: 'none'});
    });

    it('lets touches pass through around the native content while it is not covered', () => {
        const {child} = getNativeNodes(
            renderNative(
                <AlwaysPaintedViewNative inert={false}>
                    <View testID="content" />
                </AlwaysPaintedViewNative>,
            ).toJSON,
        );

        expect(child.props['aria-hidden']).toBe(false);
        expect(child.props.collapsable).toBe(false);
        expect(StyleSheet.flatten(child.props.style)).toEqual({flex: 1, pointerEvents: 'box-none'});
    });

    it('renders no node for inert on native when a caller leaves the prop out', () => {
        const {child} = getNativeNodes(
            renderNative(
                <AlwaysPaintedViewNative>
                    <View testID="content" />
                </AlwaysPaintedViewNative>,
            ).toJSON,
        );

        expect(child.props.testID).toBe('content');
    });
});
