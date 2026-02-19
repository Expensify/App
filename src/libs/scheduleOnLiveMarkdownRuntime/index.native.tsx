import {getWorkletRuntime} from '@expensify/react-native-live-markdown';
import {scheduleOnRuntime} from 'react-native-worklets';

function scheduleOnLiveMarkdownRuntime<Args extends unknown[], ReturnType>(worklet: (...args: Args) => ReturnType, ...args: Args): void {
    scheduleOnRuntime(getWorkletRuntime(), worklet, ...args);
}

export default scheduleOnLiveMarkdownRuntime;
