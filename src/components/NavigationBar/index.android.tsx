import {useMemo} from 'react';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

/** NavigationBar renders a semi-translucent background behind the three-button navigation bar on Android. */
function NavigationBar() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {insets, paddingBottom} = useSafeAreaPaddings();
    const {isOffline} = useNetwork();

    const navigationBarType = useMemo(() => StyleUtils.getNavigationBarType(insets), [StyleUtils, insets]);
    const isSoftKeyNavigation = navigationBarType === CONST.NAVIGATION_BAR_TYPE.SOFT_KEYS;

    return isSoftKeyNavigation ? <View style={[isOffline ? styles.appBG : styles.translucentNavigationBarBG, styles.stickToBottom, {height: paddingBottom}]} /> : null;
}

export default NavigationBar;
