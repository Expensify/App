import Text from '@components/Text';

import type NonTopScreenWrapperProps from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/nonTopScreenWrapperTypes';
import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import ScreenFreezeWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenFreezeWrapper';
import wrapDescriptorsWithNonTopScreensBehavior from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/wrapDescriptorsWithNonTopScreensBehavior';
import type {NonTopScreenBehavior, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';
import type {ReactElement} from 'react';

import React from 'react';

const COVERED_KEY = 'covered-route';
const TOP_KEY = 'top-route';

function buildDescriptor(name: string, behavior?: NonTopScreenBehavior) {
    return {
        route: {name},
        options: behavior === undefined ? {} : {nonTopScreenBehavior: behavior},
        render: () => <Text>{name}</Text>,
    };
}

function buildState(): PlatformStackNavigationState<ParamListBase> {
    return {
        key: 'stack-test',
        index: 1,
        routeNames: ['Covered', 'Top'],
        routes: [
            {key: COVERED_KEY, name: 'Covered'},
            {key: TOP_KEY, name: 'Top'},
        ],
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
    };
}

function renderWrapped(descriptor: {render: () => React.JSX.Element}): ReactElement<NonTopScreenWrapperProps> {
    return descriptor.render();
}

describe('wrapDescriptorsWithNonTopScreensBehavior', () => {
    it('leaves a screen that picked no behavior untouched', () => {
        // Given descriptors of screens that picked no non-top behavior
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered'), [TOP_KEY]: buildDescriptor('Top')};

        // When they are wrapped
        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        // Then the same object comes back, so a navigator without an opted-in screen renders exactly as before
        expect(result).toBe(descriptors);
        expect(result[COVERED_KEY]).toBe(descriptors[COVERED_KEY]);
        expect(result[TOP_KEY]).toBe(descriptors[TOP_KEY]);
    });

    it('keeps the wrappers present and blurs no screen when the navigation state has no top route', () => {
        // Given descriptors of screens that picked the activity behavior, and a state that carries no route
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};
        const state = {...buildState(), routes: [], index: 0};

        // When they are wrapped
        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, state);

        // Then every screen keeps its wrapper and none of them is blurred, so a state without a top route cannot hide the whole navigator
        for (const key of [COVERED_KEY, TOP_KEY]) {
            const wrapped = renderWrapped(result[key]);
            expect(wrapped.type).toBe(ScreenActivityWrapper);
            expect(wrapped.props.isScreenBlurred).toBe(false);
        }
    });

    it('leaves a persistent screen untouched and still wraps the others', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};

        // Given descriptors of two screens that picked the activity behavior
        // When one of them is passed as a persistent screen
        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(), ['Covered']);

        // Then it is left untouched, while the other one is still wrapped
        expect(result[COVERED_KEY]).toBe(descriptors[COVERED_KEY]);
        expect(renderWrapped(result[TOP_KEY]).type).toBe(ScreenActivityWrapper);
    });

    it.each([
        ['activity', ScreenActivityWrapper],
        ['freeze', ScreenFreezeWrapper],
    ] as const)('wraps a screen that picked %s around its original content and marks only the non-top one as blurred', (behavior, Wrapper) => {
        // Given descriptors of a covered and a top screen that both picked the same behavior
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', behavior), [TOP_KEY]: buildDescriptor('Top', behavior)};

        // When they are wrapped
        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        // Then each one keeps its original content inside the wrapper of the picked behavior, and only the covered one is blurred
        const covered = renderWrapped(result[COVERED_KEY]);
        expect(covered.type).toBe(Wrapper);
        expect(covered.props.children).toEqual(<Text>Covered</Text>);
        expect(covered.props.isScreenBlurred).toBe(true);

        const top = renderWrapped(result[TOP_KEY]);
        expect(top.type).toBe(Wrapper);
        expect(top.props.children).toEqual(<Text>Top</Text>);
        expect(top.props.isScreenBlurred).toBe(false);
    });

    it('replaces only the render function of a wrapped descriptor', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};

        // Given descriptors of screens that picked the activity behavior
        // When they are wrapped
        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        // Then only the render function is replaced, so the navigator still reads the very same route and options objects
        expect(result[COVERED_KEY].route).toBe(descriptors[COVERED_KEY].route);
        expect(result[COVERED_KEY].options).toBe(descriptors[COVERED_KEY].options);
        expect(result[COVERED_KEY].render).not.toBe(descriptors[COVERED_KEY].render);
    });
});
