import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import useLocalize from '@hooks/useLocalize';

function FailedKYC() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1]}>
            <View style={[styles.ph5]}>
                <Text style={styles.mb3}>
                    {translate('additionalDetailsStep.failedKYCTextBefore')}
                    <TextLink
                        href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                        style={[styles.link]}
                    >
                        {CONST.EMAIL.CONCIERGE}
                    </TextLink>
                    {translate('additionalDetailsStep.failedKYCTextAfter')}
                </Text>
            </View>
        </View>
    );
}

FailedKYC.displayName = 'FailedKYC';

export default FailedKYC;
