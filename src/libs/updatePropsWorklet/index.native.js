// _IS_FABRIC constant that react-native-reanimated adds to the JS runtime to determine if the app is running on the new arch or not.
// eslint-disable-next-line no-undef, no-underscore-dangle
const IS_FABRIC = global._IS_FABRIC;

export default function (viewTag, viewName, updates) {
    'worklet';

    if (IS_FABRIC) {
        // _updatePropsFabric is a function that is worklet function from react-native-reanimated which is not available on web
        // eslint-disable-next-line no-undef
        _updatePropsFabric([
            {
                shadowNodeWrapper: viewTag,
                updates,
            }
        ])
    } else {
        // _updatePropsPaper is a function that is worklet function from react-native-reanimated which is not available on web
        // eslint-disable-next-line no-undef
        _updatePropsPaper([
            {
                tag: viewTag,
                name: viewName,
                updates,
            },
        ]);
    }
}
