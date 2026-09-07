import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type TravelBillingSubtitleWrapperProps = {
    htmlComponent?: React.ReactNode;
};

function TravelBillingSubtitleWrapper({htmlComponent}: TravelBillingSubtitleWrapperProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.mt2, styles.mr5]}>
            <Text style={[styles.mutedNormalTextLabel, styles.textLabelSupportingEmptyValue, styles.lh20]}>
                {translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subtitle')} {htmlComponent}
            </Text>
        </View>
    );
}

export default TravelBillingSubtitleWrapper;
