import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import ScreenFreezeWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenFreezeWrapper';
import wrapDescriptorsWithNonTopScreensBehavior from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/wrapDescriptorsWithNonTopScreensBehavior';
import type {NonTopScreenBehavior, PlatformSpecificNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';
import type {ReactElement} from 'react';

import React, {isValidElement} from 'react';
import {View} from 'react-native';

type TestDescriptor = {
    route: {name: string};
    options: PlatformSpecificNavigationOptions & {nonTopScreenBehavior?: NonTopScreenBehavior};
    render: () => React.JSX.Element;
};

type WrapperProps = {
    isScreenBlurred: boolean;
    routeKey: string;
    routeName: string;
    children: React.ReactNode;
};

function buildState(routes: Array<{key: string; name: string}>, index: number): PlatformStackNavigationState<ParamListBase> {
    return {
        key: 'stack-1',
        index,
        routeNames: routes.map((route) => route.name),
        routes: routes.map((route) => ({...route, params: undefined})),
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
    };
}

function buildDescriptors(routes: Array<{key: string; name: string}>, behavior?: NonTopScreenBehavior): Record<string, TestDescriptor> {
    return Object.fromEntries(
        routes.map((route) => [
            route.key,
            {
                route: {name: route.name},
                options: behavior ? {nonTopScreenBehavior: behavior} : {},
                render: jest.fn(() => <View testID={route.name} />),
            },
        ]),
    );
}

/** Reads the props of the wrapper element a descriptor renders, failing the test when the screen was left unwrapped. */
function getWrapperElement(descriptor: TestDescriptor): ReactElement<WrapperProps> {
    const element: unknown = descriptor.render();
    if (!isValidElement<WrapperProps>(element)) {
        throw new Error('The descriptor did not render a valid element');
    }
    return element;
}

const ROUTES = [
    {key: 'key-bottom', name: 'BottomScreen'},
    {key: 'key-middle', name: 'MiddleScreen'},
    {key: 'key-top', name: 'TopScreen'},
];

describe('wrapDescriptorsWithNonTopScreensBehavior', () => {
    describe.each<[NonTopScreenBehavior, React.ComponentType<WrapperProps>]>([
        ['activity', ScreenActivityWrapper],
        ['freeze', ScreenFreezeWrapper],
    ])('with the %s behavior', (behavior, ExpectedWrapper) => {
        it('wraps every screen with the wrapper matching the behavior', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

            for (const key of Object.keys(descriptors)) {
                expect(getWrapperElement(wrapped[key]).type).toBe(ExpectedWrapper);
            }
        });

        it('marks only the covered screens as blurred', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

            expect(getWrapperElement(wrapped['key-top']).props.isScreenBlurred).toBe(false);
            expect(getWrapperElement(wrapped['key-middle']).props.isScreenBlurred).toBe(true);
            expect(getWrapperElement(wrapped['key-bottom']).props.isScreenBlurred).toBe(true);
        });

        it('follows the state index instead of the route order', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            // The middle route is the top one while the stack is animating back to it.
            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 1));

            expect(getWrapperElement(wrapped['key-middle']).props.isScreenBlurred).toBe(false);
            expect(getWrapperElement(wrapped['key-top']).props.isScreenBlurred).toBe(true);
        });

        it('passes the route key and name of each screen to the wrapper', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

            const middleProps = getWrapperElement(wrapped['key-middle']).props;
            expect(middleProps.routeKey).toBe('key-middle');
            expect(middleProps.routeName).toBe('MiddleScreen');
        });

        it('renders the original screen content inside the wrapper', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));
            const children = getWrapperElement(wrapped['key-top']).props.children;

            expect(descriptors['key-top'].render).toHaveBeenCalledTimes(1);
            expect(isValidElement(children)).toBe(true);
        });

        it('does not call the original render function while wrapping', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

            for (const key of Object.keys(descriptors)) {
                expect(descriptors[key].render).not.toHaveBeenCalled();
            }
        });

        it('keeps every descriptor key and leaves the passed descriptors untouched', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);
            const originalRenderFunctions = Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, descriptor.render]));

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

            expect(Object.keys(wrapped)).toEqual(Object.keys(descriptors));
            for (const [key, render] of Object.entries(originalRenderFunctions)) {
                expect(descriptors[key].render).toBe(render);
                expect(wrapped[key].render).not.toBe(render);
            }
        });

        it('leaves persistent screens unwrapped so they stay visible and interactive', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2), ['BottomScreen']);

            expect(wrapped['key-bottom']).toBe(descriptors['key-bottom']);
            expect(getWrapperElement(wrapped['key-middle']).type).toBe(ExpectedWrapper);
        });

        it('treats every screen as blurred when the state index points at no route', () => {
            const descriptors = buildDescriptors(ROUTES, behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 99));

            for (const key of Object.keys(descriptors)) {
                expect(getWrapperElement(wrapped[key]).props.isScreenBlurred).toBe(true);
            }
        });

        it('returns an empty result for an empty stack', () => {
            expect(wrapDescriptorsWithNonTopScreensBehavior({}, buildState([], 0))).toEqual({});
        });

        it('wraps a descriptor whose route is not part of the state', () => {
            // A screen can still be rendered for one commit after its route has been removed from the state.
            const descriptors = buildDescriptors([...ROUTES, {key: 'key-removed', name: 'RemovedScreen'}], behavior);

            const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

            expect(getWrapperElement(wrapped['key-removed']).props.isScreenBlurred).toBe(true);
        });
    });

    it('picks the wrapper of each screen from its own options', () => {
        const descriptors = buildDescriptors(ROUTES);
        descriptors['key-bottom'].options = {nonTopScreenBehavior: 'activity'};
        descriptors['key-middle'].options = {nonTopScreenBehavior: 'freeze'};

        const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

        expect(getWrapperElement(wrapped['key-bottom']).type).toBe(ScreenActivityWrapper);
        expect(getWrapperElement(wrapped['key-middle']).type).toBe(ScreenFreezeWrapper);
    });

    it('leaves a screen unwrapped when it picked no behavior', () => {
        const descriptors = buildDescriptors(ROUTES);

        const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

        for (const key of Object.keys(descriptors)) {
            expect(wrapped[key]).toBe(descriptors[key]);
        }
    });

    it('leaves a screen unwrapped when it picked the none behavior', () => {
        const descriptors = buildDescriptors(ROUTES, 'none');

        const wrapped = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(ROUTES, 2));

        expect(wrapped['key-middle']).toBe(descriptors['key-middle']);
    });
});
