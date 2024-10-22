import {BackHandler, NativeModules} from 'react-native';
import navigationRef from '@navigation/navigationRef';

// We need to do some custom handling for the back button on Android for actions related to the search page.
function setupCustomAndroidBackHandler() {
    const onBackPress = () => {
        const rootState = navigationRef.getRootState();
        const isLastScreenOnStack = rootState?.routes?.length === 1 && (rootState?.routes.at(0)?.state?.routes?.length ?? 1) === 1;
        if (NativeModules.HybridAppModule && isLastScreenOnStack) {
            NativeModules.HybridAppModule.exitApp();
        }

        // Handle all other cases with default handler.
        return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
}

export default setupCustomAndroidBackHandler;
