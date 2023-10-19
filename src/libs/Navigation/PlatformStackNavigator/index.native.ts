import {createNativeStackNavigator, NativeStackView as StackView} from '@react-navigation/native-stack';

function createPlatformStackNavigator() {
    return createNativeStackNavigator();
}

export {createPlatformStackNavigator, StackView};
