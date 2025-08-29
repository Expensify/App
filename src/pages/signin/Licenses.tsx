import React from 'react';
import {View} from 'react-native';
import LocalePicker from '@components/LocalePicker';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const licensesURL = CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL;
    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <Text style={[styles.textExtraSmallSupporting]}>
                <RenderHTML html={translate('termsOfUse.licenses', {licensesURL})} />
            </Text>
            <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
                <LocalePicker size="small" />
            </View>
        </>
    );
}

Licenses.displayName = 'Licenses';

export default Licenses;
