import type {HybridObject} from 'react-native-nitro-modules';

interface AppStartTimeModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    /**
     * Gets the app start time in milliseconds since epoch.
     * The native layer records this in MainApplication.onCreate() on Android
     * and AppDelegate.didFinishLaunchingWithOptions() on iOS.
     * Returns 0 if the start time was never recorded.
     */
    readonly appStartTime: number;

    /**
     * Gets the named startup stage timestamps (milliseconds since epoch) recorded by the
     * native layer during app launch. The markers are cleared whenever the app start time
     * is reset, so every entry belongs to the current startup. Returns an empty record
     * when no markers were recorded.
     */
    readonly appStartupMarkers: Record<string, number>;
}

export default AppStartTimeModule;
