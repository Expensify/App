// Reanimated does not support runOnRuntime() on web
function runOnLiveMarkdownRuntime<Args extends unknown[], ReturnType>(worklet: (...args: Args) => ReturnType) {
    return worklet;
}

export default runOnLiveMarkdownRuntime;
