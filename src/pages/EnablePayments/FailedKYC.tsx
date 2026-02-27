import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function FailedKYC() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <View style={styles.flex1}>
            <View style={[styles.ph5, styles.flexRow, styles.renderHTML]}>
                <RenderHTML
                    html={translate('additionalDetailsStep.failedKYCMessage', {
                        conciergeEmail: CONST.EMAIL.CONCIERGE,
                    })}
                />
            </View>
        </View>
    );
}

export default FailedKYC;
