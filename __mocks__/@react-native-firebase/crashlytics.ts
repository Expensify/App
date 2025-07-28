// <App> uses <ErrorBoundary> and we need to mock the imported crashlytics module
// due to an error that happens otherwise https://github.com/invertase/react-native-firebase/issues/2475
const getCrashlytics = jest.fn();
const log = jest.fn();
const recordError = jest.fn();
const setCrashlyticsCollectionEnabled = jest.fn();
const setUserId = jest.fn();

export {getCrashlytics, log, recordError, setCrashlyticsCollectionEnabled, setUserId};
