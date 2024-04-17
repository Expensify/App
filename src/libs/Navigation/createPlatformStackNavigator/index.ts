import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import createCommonStackNavigator from './createCommonStackNavigator';
import type {CommonNavigationEventMap, CommonNavigationOptions, CommonNavigator} from './types';
import type CreatePlatformStackNavigatorResult from './types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>(): CreatePlatformStackNavigatorResult<TStackParams> {
    const Stack = createStackNavigator<TStackParams>();
    const CommonNavigator = createCommonStackNavigator(Stack);

    return createNavigatorFactory<StackNavigationState<TStackParams>, CommonNavigationOptions, CommonNavigationEventMap, CommonNavigator<TStackParams>>(CommonNavigator)();
}

export default createPlatformStackNavigator;
