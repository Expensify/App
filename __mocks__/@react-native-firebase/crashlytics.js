// <App> uses <ErrorBoundary> and we need to mock the imported crashlytics module
// due to an error that happens otherwise https://github.com/invertase/react-native-firebase/issues/2475
export default () => ({
    log: jest.fn(),
    recordError: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
});
