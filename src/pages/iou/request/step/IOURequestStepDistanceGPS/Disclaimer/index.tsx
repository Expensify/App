import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

function Disclaimer() {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['Crosshair']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    if (gpsDraftDetails?.isTracking || (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0) {
        return null;
    }

    return (
        <View style={[styles.p5, styles.flexRow, styles.overflowHidden, styles.gap3, styles.alignItemsCenter]}>
            <Icon
                src={icons.Crosshair}
                small
                fill={theme.textSupporting}
            />
            <Text style={[styles.flexShrink1, styles.textSupporting, styles.fontSizeLabel]}>{translate('gps.disclaimer')}</Text>
        </View>
    );
}

export default Disclaimer;
