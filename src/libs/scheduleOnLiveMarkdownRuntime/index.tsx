// Reanimated does not support runOnRuntime() on web
function scheduleOnLiveMarkdownRuntime<Args extends unknown[], ReturnType>(worklet: (...args: Args) => ReturnType) {
    return worklet;
}

export default scheduleOnLiveMarkdownRuntime;
