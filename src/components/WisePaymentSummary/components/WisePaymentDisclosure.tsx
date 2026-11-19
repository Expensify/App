import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type WisePaymentDisclosureProps = {
    /** Text of the button that confirms the payment, which the disclosure quotes */
    buttonText: string;
};

/** Wise's terms the admin accepts by paying, shown under the quote */
function WisePaymentDisclosure({buttonText}: WisePaymentDisclosureProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <View style={styles.mt5}>
            <RenderHTML html={translate('iou.wisePaymentSummary.paymentDisclosure', {buttonText})} />
        </View>
    );
}

export default WisePaymentDisclosure;
