import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getBaseTheme, getContrastTheme, isHighContrastTheme} from '@styles/theme/utils';
import variables from '@styles/variables';

import {setHighContrastIntent, updateTheme} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

function HighContrastModeSwitcher() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const [highContrastIntent] = useOnyx(ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT);
    const icons = useMemoizedLazyExpensifyIcons(['Moon']);

    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = highContrastIntent ?? isHighContrastTheme(currentTheme);
    const label = translate(isHighContrast ? 'themePage.disableHighContrast' : 'themePage.enableHighContrast');

    const toggleHighContrast = () => {
        const baseTheme = getBaseTheme(currentTheme);
        updateTheme(isHighContrast ? baseTheme : getContrastTheme(baseTheme), false);
        setHighContrastIntent(!isHighContrast);
    };

    return (
        <PressableWithFeedback
            onPress={toggleHighContrast}
            sentryLabel={CONST.SENTRY_LABEL.HIGH_CONTRAST_MODE_SWITCHER.TOGGLE}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={label}
            style={[styles.flexRow, styles.alignItemsCenter]}
        >
            <Icon
                src={icons.Moon}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
                accessibilityLabel={label}
            />
            <Text style={[styles.textSmall, styles.ml2]}>{label}</Text>
        </PressableWithFeedback>
    );
}

export default HighContrastModeSwitcher;
