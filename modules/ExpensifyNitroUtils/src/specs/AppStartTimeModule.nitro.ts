import type {HybridObject} from 'react-native-nitro-modules';

interface AppStartTimeModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    /**
     * Gets the app start time in milliseconds since epoch.
     * The native layer records this in MainApplication.onCreate() on Android
     * and AppDelegate.didFinishLaunchingWithOptions() on iOS.
     * Returns 0 if the start time was never recorded.
     */
    readonly appStartTime: number;
}

export default AppStartTimeModule;
