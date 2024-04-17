import type {ParamListBase} from '@react-navigation/native';
import type {CommonNavigatorProps, CommonStack} from './types';

function createCommonStackNavigator<TStackParams extends ParamListBase>(Stack: CommonStack<TStackParams>) {
    return ({screenOptions, initialRouteName, children}: CommonNavigatorProps<TStackParams>): React.ReactElement => (
        <Stack.Navigator
            screenOptions={screenOptions}
            initialRouteName={initialRouteName}
        >
            {children}
        </Stack.Navigator>
    );
}

export default createCommonStackNavigator;
