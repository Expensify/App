import {getWorkletRuntime} from '@expensify/react-native-live-markdown';
import {runOnRuntime} from 'react-native-reanimated';

function runOnLiveMarkdownRuntime<Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue) {
    return runOnRuntime(getWorkletRuntime(), worklet);
}

export default runOnLiveMarkdownRuntime;
