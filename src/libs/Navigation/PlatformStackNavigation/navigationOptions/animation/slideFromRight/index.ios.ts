import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

// default transition is causing weird keyboard appearance: - https://github.com/Expensify/App/issues/37257
// so we are using `simple_push` which is similar to default and not causing keyboard transition issues
const transition: NativeStackNavigationOptions = {animation: 'simple_push'};

export default transition;
