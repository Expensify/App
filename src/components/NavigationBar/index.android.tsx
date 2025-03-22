import {useMemo} from 'react';
import {View} from 'react-native';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

/** NavigationBar renders a semi-translucent background behind the three-button navigation bar on Android. */
function NavigationBar() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {insets, paddingBottom} = useSafeAreaPaddings();

    const navigationBarType = useMemo(() => StyleUtils.getNavigationBarType(insets), [StyleUtils, insets]);
    const isSoftKeyNavigation = navigationBarType === CONST.NAVIGATION_BAR_TYPE.SOFT_KEYS;

    return isSoftKeyNavigation ? <View style={[styles.navigationBarBG, styles.stickToBottom, {height: paddingBottom}]} /> : null;
}
NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
