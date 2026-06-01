import React from 'react';
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
import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

function HighContrastModeSwitcher() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const icons = useMemoizedLazyExpensifyIcons(['Moon']);

    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = isHighContrastTheme(currentTheme);

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
            accessibilityLabel={translate('themePage.enableHighContrast')}
            accessibilityState={{checked: isHighContrast}}
            style={[styles.flexRow, styles.alignItemsCenter]}
        >
            <Icon
                src={icons.Moon}
                fill={isHighContrast ? theme.text : theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
                accessibilityLabel={translate('themePage.enableHighContrast')}
            />
            <Text style={[styles.textSmall, styles.ml2]}>{translate('themePage.enableHighContrast')}</Text>
        </PressableWithFeedback>
    );
}

export default HighContrastModeSwitcher;
