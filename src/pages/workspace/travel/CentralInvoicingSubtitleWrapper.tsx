import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type CentralInvoicingSubtitleWrapperProps = {
    htmlComponent?: React.ReactNode;
};

function CentralInvoicingSubtitleWrapper({htmlComponent}: CentralInvoicingSubtitleWrapperProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.mt2, styles.mr5]}>
            <Text style={[styles.mutedNormalTextLabel, styles.textLabelSupportingEmptyValue, styles.lh20]}>
                {translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subtitle')} {htmlComponent}
            </Text>
        </View>
    );
}

export default CentralInvoicingSubtitleWrapper;
