import {Platform} from 'react-native';

const Storage = Platform.select({
    default: () => require('./WebStorage').default,
    native: () => require('./NativeStorage').default,
})();

export default Storage;
