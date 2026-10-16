/** Web and desktop have no swipe-back gesture that could pop a modal outside of JS. */
function hasNativeSwipeBackGesture(): boolean {
    return false;
}

export default hasNativeSwipeBackGesture;
