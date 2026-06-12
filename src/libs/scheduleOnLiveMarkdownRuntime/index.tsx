// scheduleOnRuntime() isn't supported in web by react-native-worklets
function scheduleOnLiveMarkdownRuntime<Args extends unknown[], ReturnType>(worklet: (...args: Args) => ReturnType, ...args: Args): void {
    worklet(...args);
}

export default scheduleOnLiveMarkdownRuntime;
