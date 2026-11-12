// react-native-web caches window.location.href when its Linking module loads, and the app then routes that URL.
// Evaluating @appduct/web first lets it strip #appduct= before that, so the Appduct link is never read as a deep
// link. Dev only: a release bundle drops the require. registerAppductTools' later import() gets this same module.
if (__DEV__) {
    require('@appduct/web');
}
