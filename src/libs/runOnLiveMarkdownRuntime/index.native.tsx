import {getWorkletRuntime} from '@expensify/react-native-live-markdown';
import {runOnRuntime} from 'react-native-reanimated';

function runOnLiveMarkdownRuntime<Args extends unknown[], ReturnType>(worklet: (...args: Args) => ReturnType) {
    return runOnRuntime(getWorkletRuntime(), worklet);
}

export default runOnLiveMarkdownRuntime;
