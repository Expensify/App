import React from 'react';
import {View} from 'react-native';
import HighContrastModeSwitcher from '@components/HighContrastModeSwitcher';
import LocalePicker from '@components/LocalePicker';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={`<muted-text-xs>${translate('termsOfUse.license')}</muted-text-xs>`} />
            </View>
            <View style={[styles.mt4, styles.mb2, {maxWidth: variables.signInLocalePickerWidth}]}>
                <View style={[styles.alignItemsCenter, styles.mb2, styles.flexRow]}>
                    <HighContrastModeSwitcher />
                </View>
                <View style={[styles.alignItemsCenter, styles.flexRow]}>
                    <LocalePicker size="small" />
                </View>
            </View>
        </>
    );
}

export default Licenses;
