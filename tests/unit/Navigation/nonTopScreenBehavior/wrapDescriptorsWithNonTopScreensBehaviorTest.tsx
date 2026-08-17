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

        expect(result[COVERED_KEY]).toBe(descriptors[COVERED_KEY]);
        expect(result[TOP_KEY]).toBe(descriptors[TOP_KEY]);
    });

    it('leaves a persistent screen untouched even when it picked a behavior', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState(), ['Covered']);

        expect(result[COVERED_KEY]).toBe(descriptors[COVERED_KEY]);
        expect(result[TOP_KEY]).not.toBe(descriptors[TOP_KEY]);
    });

    it('wraps a screen that picked activity in ScreenActivityWrapper around its original content', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());
        const element = renderWrapped(result[COVERED_KEY]);

        expect(element.type).toBe(ScreenActivityWrapper);
        expect(element.props.children).toEqual(<Text>Covered</Text>);
    });

    it('wraps a screen that picked freeze in ScreenFreezeWrapper', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'freeze'), [TOP_KEY]: buildDescriptor('Top', 'freeze')};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        expect(renderWrapped(result[COVERED_KEY]).type).toBe(ScreenFreezeWrapper);
    });

    it('marks only the non-top screen as blurred', () => {
        const descriptors = {[COVERED_KEY]: buildDescriptor('Covered', 'activity'), [TOP_KEY]: buildDescriptor('Top', 'activity')};

        const result = wrapDescriptorsWithNonTopScreensBehavior(descriptors, buildState());

        expect(renderWrapped(result[COVERED_KEY]).props.isScreenBlurred).toBe(true);
        expect(renderWrapped(result[TOP_KEY]).props.isScreenBlurred).toBe(false);
    });
});
