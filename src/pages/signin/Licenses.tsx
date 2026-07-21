import HighContrastModeSwitcher from '@components/HighContrastModeSwitcher';
import LocalePicker from '@components/LocalePicker';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useIsHighContrast from '@hooks/useIsHighContrast';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Only underline the Licenses link in high-contrast themes, so it is distinguishable by more than color (WCAG 1.4.1).
    const {isHighContrast} = useIsHighContrast();
    const licenseHTML = translate('termsOfUse.license', {licenseLink: translate('termsOfUse.licenseLink', {underline: isHighContrast})});
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
