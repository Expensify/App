import type {ViewStyle} from 'react-native';

import useIsMobileWebLandscape from './useIsMobileWebLandscape';
import useThemeStyles from './useThemeStyles';

function useStackedHeaderRowPadding(): ViewStyle {
    const styles = useThemeStyles();
    const isMobileWebLandscape = useIsMobileWebLandscape();

    return isMobileWebLandscape ? styles.pb1 : styles.pb3;
}

export default useStackedHeaderRowPadding;
