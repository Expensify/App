/** iOS and Android can pop a modal with a swipe-back gesture before JS cleanup runs. */
function hasNativeSwipeBackGesture(): boolean {
    return true;
}

export default hasNativeSwipeBackGesture;
