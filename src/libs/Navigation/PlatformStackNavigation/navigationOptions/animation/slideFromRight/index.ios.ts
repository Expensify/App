import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import Animations from '../index';

// default transition is causing weird keyboard appearance: - https://github.com/Expensify/App/issues/37257
// so we are using `simple_push` which is similar to default and not causing keyboard transition issues
const transition: NativeStackNavigationOptions = {animation: Animations.SIMPLE_PUSH};

export default transition;
