import {Dimensions} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import variables from '../../../../styles/variables';
import createCustomModalStackNavigator from '../createCustomModalStackNavigator';

const shouldUseCustomModalStack = Dimensions.get('window').width > variables.mobileResponsiveWidthBreakpoint;

// Setup the modal stack navigators so we only have to create them once
const SettingsModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();
const NewChatModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();
const NewGroupModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();
const SearchModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();
const ProfileModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();
const IOURequestModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();
const IOUBillModalStack = shouldUseCustomModalStack ? createCustomModalStackNavigator() : createStackNavigator();

export {
    SettingsModalStack,
    NewChatModalStack,
    NewGroupModalStack,
    SearchModalStack,
    ProfileModalStack,
    IOURequestModalStack,
    IOUBillModalStack,
};
