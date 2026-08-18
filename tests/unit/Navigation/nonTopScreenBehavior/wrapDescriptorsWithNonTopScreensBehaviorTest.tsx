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
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered'), [TOP_KEY]: buildDescriptor('Top')};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        expect(result).toBe(descriptors);
        expect(result[COVERED_KEY]).toBe(descriptors[COVERED_KEY]);
        expect(result[TOP_KEY]).toBe(descriptors[TOP_KEY]);
    });

    it('leaves a persistent screen untouched and still wraps the others', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(), ['Covered']);

        expect(result[COVERED_KEY]).toBe(descriptors[COVERED_KEY]);
        expect(renderWrapped(result[TOP_KEY]).type).toBe(ScreenActivityWrapper);
    });

    it.each([
        ['activity', ScreenActivityWrapper],
        ['freeze', ScreenFreezeWrapper],
    ] as const)('wraps a screen that picked %s around its original content and marks only the non-top one as blurred', (behavior, Wrapper) => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', behavior), [TOP_KEY]: buildDescriptor('Top', behavior)};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

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

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        expect(result[COVERED_KEY].route).toBe(descriptors[COVERED_KEY].route);
        expect(result[COVERED_KEY].options).toBe(descriptors[COVERED_KEY].options);
        expect(result[COVERED_KEY].render).not.toBe(descriptors[COVERED_KEY].render);
    });
});
