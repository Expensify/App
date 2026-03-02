import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import {useActionsLocalize} from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function PaymentCardCurrencyHeader({isSectionList}: {isSectionList?: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useActionsLocalize();
    return (
        <View style={[styles.renderHTML, styles.flexRow, styles.mt3, isSectionList && styles.mh5, isSectionList && styles.mb5]}>
            <RenderHTML html={translate('billingCurrency.note')} />
        </View>
    );
}

export default PaymentCardCurrencyHeader;
