import type {EdgeInsets} from 'react-native-safe-area-context';

function getLeftOffset(
    x: number,
    insets: EdgeInsets,
    bigScreenLeftOffset: number,
    shouldUseNarrowLayout: boolean,
    menuWidth: number,
    windowWidth: number,
    isInLandscapeMode: boolean,
): number {
    if (isInLandscapeMode) {
        // On Android devices, sometimes x takes into consideration the insets.left value, sometimes not
        // so in case it does we want to subtract it to get the correct left offset.
        if (x - insets.left >= 0) {
            return x - insets.left;
        }

        return x;
    }

    if (shouldUseNarrowLayout) {
        return x;
    }

    return bigScreenLeftOffset;
}

export default getLeftOffset;
