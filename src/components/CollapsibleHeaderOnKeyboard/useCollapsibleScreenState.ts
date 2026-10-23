import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';

import type {SharedValue} from 'react-native-reanimated';

import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';
import {useSharedValue} from 'react-native-reanimated';

type CollapsibleScreenState = {
    isFocused: boolean;
    isInLandscapeMode: boolean;
    isFocusedSV: SharedValue<boolean>;
    isInLandscapeModeSV: SharedValue<boolean>;
};

function useCollapsibleScreenState(): CollapsibleScreenState {
    const isFocused = useIsFocused();

    const {windowWidth, windowHeight} = useWindowDimensions();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const isFocusedSV = useSharedValue(isFocused);
    const isInLandscapeModeSV = useSharedValue(isInLandscapeMode);
    useEffect(() => {
        isFocusedSV.set(isFocused);
    }, [isFocused, isFocusedSV]);
    useEffect(() => {
        isInLandscapeModeSV.set(isInLandscapeMode);
    }, [isInLandscapeMode, isInLandscapeModeSV]);

    return {isFocused, isInLandscapeMode, isFocusedSV, isInLandscapeModeSV};
}

export default useCollapsibleScreenState;
