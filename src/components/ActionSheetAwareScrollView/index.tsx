import React from 'react';

import type {RenderActionSheetAwareScrollViewComponent} from './types';

import {Actions, ActionSheetAwareScrollViewProvider, useActionSheetAwareScrollViewActions, useActionSheetAwareScrollViewState} from './ActionSheetAwareScrollViewContext';
import AnimatedActionSheetAwareScrollView from './AnimatedActionSheetAwareScrollView';

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
const renderScrollComponent: RenderActionSheetAwareScrollViewComponent = (props) => {
    return <AnimatedActionSheetAwareScrollView {...props} />;
};

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
const renderInvertedScrollComponent: RenderActionSheetAwareScrollViewComponent = (props) => {
    return (
        <AnimatedActionSheetAwareScrollView
            inverted
            {...props}
        />
    );
};

export {renderScrollComponent, renderInvertedScrollComponent, ActionSheetAwareScrollViewProvider, Actions, useActionSheetAwareScrollViewState, useActionSheetAwareScrollViewActions};
