import type {FirebaseCrashlyticsTypes} from '@react-native-firebase/crashlytics';

type CrashlyticsModule = {
    log: FirebaseCrashlyticsTypes.Module['log'];
    recordError: FirebaseCrashlyticsTypes.Module['recordError'];
    setCrashlyticsCollectionEnabled: FirebaseCrashlyticsTypes.Module['setCrashlyticsCollectionEnabled'];
};

type CrashlyticsMock = () => CrashlyticsModule;

// <App> uses <ErrorBoundary> and we need to mock the imported crashlytics module
// due to an error that happens otherwise https://github.com/invertase/react-native-firebase/issues/2475
const crashlyticsMock: CrashlyticsMock = () => ({
    log: jest.fn(),
    recordError: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
});

export default crashlyticsMock;
