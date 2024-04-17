import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import createCommonStackNavigator from './createCommonStackNavigator';
import type {CommonNavigationEventMap, CommonNavigationOptions, CommonNavigator} from './types';
import type CreatePlatformStackNavigatorResult from './types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>(): CreatePlatformStackNavigatorResult<TStackParams> {
    const NativeStack = createNativeStackNavigator<TStackParams>();
    const CommonNavigator = createCommonStackNavigator(NativeStack);

    return createNavigatorFactory<StackNavigationState<TStackParams>, CommonNavigationOptions, CommonNavigationEventMap, CommonNavigator<TStackParams>>(CommonNavigator)();
}

export default createPlatformStackNavigator;
