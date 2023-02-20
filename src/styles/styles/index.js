import {Platform} from 'react-native';

const styles = Platform.select({
    ios: require('./styles.ios').default,
    default: require('./styles.native').default,
    android: require('./styles.android').default,
});

export default styles;
