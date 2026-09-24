/**
 * The "Automatic" hint the Scan confirmation shows inside the amount, merchant and date fields while SmartScan is
 * still the one filling them in. It mirrors the right label the category field carries for the same promise, and
 * each field drops it as soon as the user takes the field over, on focus or once it has a value of its own.
 */
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

function AutomaticFieldHint() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap1]}>
            <Icon
                src={icons.Sparkles}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text style={styles.rightLabelMenuItem}>{translate('common.automatic')}</Text>
        </View>
    );
}

export default AutomaticFieldHint;
