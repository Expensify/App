import type {NavigationState, ParamListBase, RouteProp, StackNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';

const preservedSplitNavigatorStates: Record<string, StackNavigationState<ParamListBase>> = {};

const cleanPreservedSplitNavigatorStates = (state: NavigationState) => {
    const currentSplitNavigatorKeys = state.routes.map((route) => route.key);

    for (const key of Object.keys(preservedSplitNavigatorStates)) {
        if (!currentSplitNavigatorKeys.includes(key)) {
            delete preservedSplitNavigatorStates[key];
        }
    }
};

const getPreservedSplitNavigatorState = (key: string) => preservedSplitNavigatorStates[key];

function usePreserveSplitNavigatorState(route: RouteProp<ParamListBase>, state: StackNavigationState<ParamListBase>) {
    useEffect(() => {
        preservedSplitNavigatorStates[route.key] = state;
    }, [route, state]);
}

export default usePreserveSplitNavigatorState;

export {getPreservedSplitNavigatorState, cleanPreservedSplitNavigatorStates};
