// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';

function useWindowDimensionsForAutoCompleteSuggestions() {
    const {width} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const StyleUtils = useStyleUtils();
    const {paddingBottom: bottomInset, paddingTop: topInset} = StyleUtils.getPlatformSafeAreaPadding(insets ?? undefined);

    // For Android devices with API level 35 or higher, useWindowDimensions returns the screen height, which includes both the status bar height and the bottom bar
    // So we need to subtract the bottom inset and top inset to get the actual height of the screen.
    const height = Dimensions.get('screen').height - bottomInset - topInset;

    return {width, height};
}

export default useWindowDimensionsForAutoCompleteSuggestions;
