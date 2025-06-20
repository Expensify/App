import React from 'react';
import {View} from 'react-native';
import LocalePicker from '@components/LocalePicker';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <Text style={[styles.textExtraSmallSupporting]}>
                <RenderHTML html={`<muted-text-label>${translate('termsOfUse.licenses')}</muted-text-label>`} />
            </Text>
            <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
                <LocalePicker size="small" />
            </View>
        </>
    );
}

Licenses.displayName = 'Licenses';

export default Licenses;
