import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';

import {useSyncExternalStore} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';

function subscribeToDimensionsChange(onChange: () => void) {
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
}

function getScreenHeight() {
    return Dimensions.get('screen').height;
}

function useWindowDimensionsForAutoCompleteSuggestions() {
    const {width} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const StyleUtils = useStyleUtils();
    const {paddingBottom: bottomInset, paddingTop: topInset} = StyleUtils.getPlatformSafeAreaPadding(insets ?? undefined);

    // The screen height is subscribed to, because reading Dimensions during render doesn't re-render on rotation, so the
    // menu would keep being positioned against the height of the previous orientation.
    const screenHeight = useSyncExternalStore(subscribeToDimensionsChange, getScreenHeight);

    // For Android devices with API level 35 or higher, useWindowDimensions returns the screen height, which includes both the status bar height and the bottom bar
    // So we need to subtract the bottom inset and top inset to get the actual height of the screen.
    const height = screenHeight - bottomInset - topInset;

    return {width, height};
}

export default useWindowDimensionsForAutoCompleteSuggestions;
