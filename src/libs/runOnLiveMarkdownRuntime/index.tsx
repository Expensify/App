// Reanimated does not support runOnRuntime() on web
function runOnLiveMarkdownRuntime<Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue) {
    return worklet;
}

export default runOnLiveMarkdownRuntime;
