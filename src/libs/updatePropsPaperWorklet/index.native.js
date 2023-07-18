export default function (viewTag, viewName, updates) {
    'worklet';

    // _updatePropsPaper is a function that is worklet function from react-native-reanimated which is not available on web
    // eslint-disable-next-line no-undef
    _updatePropsPaper(viewTag, viewName, updates);
}
