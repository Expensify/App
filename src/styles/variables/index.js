import {Platform} from 'react-native';

const variables = Platform.select({
    web: require('./variables.web').default,
    default: require('./variables.native').default,
});

export default variables;
