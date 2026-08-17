import type {RenderAPI} from '@testing-library/react-native';
import {render} from '@testing-library/react-native';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import React from 'react';
import {StyleSheet, View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
}));

function getWrappers(toJSON: RenderAPI['toJSON']) {
    const outer = toJSON();
    if (!outer || Array.isArray(outer)) {
        throw new Error('CustomViewWrapper did not render the expected wrapper pair');
    }

    const inner = outer.children?.[0];
    if (!inner || typeof inner === 'string') {
        throw new Error('CustomViewWrapper did not render the expected inner wrapper');
    }

    return {inner, outer};
}

describe('CustomViewWrapper', () => {
    it('renders the outer view layout-neutral and keeps the inner view out of touch handling while inert', () => {
        const {toJSON} = render(
            <CustomViewWrapper inert>
                <View testID="content" />
            </CustomViewWrapper>,
        );

        const {inner, outer} = getWrappers(toJSON);
        expect(StyleSheet.flatten(outer.props.style)).toEqual({display: 'contents'});
        expect(inner.props['aria-hidden']).toBe(true);
        expect(inner.props.collapsable).toBe(false);
        expect(StyleSheet.flatten(inner.props.style)).toEqual({flex: 1, pointerEvents: 'none'});
    });

    it('lets touches pass through around the content when not inert', () => {
        const {toJSON} = render(
            <CustomViewWrapper>
                <View testID="content" />
            </CustomViewWrapper>,
        );

        const {inner} = getWrappers(toJSON);
        expect(inner.props['aria-hidden']).toBeUndefined();
        expect(inner.props.collapsable).toBe(false);
        expect(StyleSheet.flatten(inner.props.style)).toEqual({flex: 1, pointerEvents: 'box-none'});
    });
});
