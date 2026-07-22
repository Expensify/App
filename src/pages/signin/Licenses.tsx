import HighContrastModeSwitcher from '@components/HighContrastModeSwitcher';
import LocalePicker from '@components/LocalePicker';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isHighContrastTheme} from '@styles/theme/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const [highContrastIntent] = useOnyx(ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT);

    // Only underline the Licenses link in high-contrast themes, so it is distinguishable by more than color (WCAG 1.4.1).
    // Detection mirrors the sibling HighContrastModeSwitcher, since the logged-out sign-in flow tracks contrast via SIGN_IN_HIGH_CONTRAST_INTENT.
    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = highContrastIntent ?? isHighContrastTheme(currentTheme);
    // In high contrast, opt the link into an underline via the link-underline class, which AnchorRenderer honors when rendering the HTML.
    const license = translate('termsOfUse.license');
    const licenseHTML = isHighContrast ? license.replace('<a ', '<a class="link-underline" ') : license;
    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={`<muted-text-xs>${licenseHTML}</muted-text-xs>`} />
            </View>
            <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
                <HighContrastModeSwitcher />
            </View>
            <View style={[styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
                <LocalePicker size="small" />
            </View>
        </>
    );
}

export default Licenses;
