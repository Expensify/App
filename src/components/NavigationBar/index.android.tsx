import {useMemo} from 'react';
import {View} from 'react-native';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';

/** NavigationBar renders a semi-translucent background behind the three-button navigation bar on Android. */
function NavigationBar() {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {insets} = useSafeAreaPaddings();

    const navigationBarType = useMemo(() => StyleUtils.getNavigationBarType(insets), [StyleUtils, insets]);

    const isSoftKeyNavigation = navigationBarType === CONST.NAVIGATION_BAR_TYPE.SOFT_KEYS;

    return isSoftKeyNavigation ? <View style={[{position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: theme.navigationBarBackgroundColor}]} /> : null;
}
NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
