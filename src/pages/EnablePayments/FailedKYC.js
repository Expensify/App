import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    ...withLocalizePropTypes,
};

function FailedKYC(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1]}>
            <View style={[styles.ph5]}>
                <Text style={styles.mb3}>
                    {props.translate('additionalDetailsStep.failedKYCTextBefore')}
                    <TextLink
                        href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                        style={[styles.link]}
                    >
                        {CONST.EMAIL.CONCIERGE}
                    </TextLink>
                    {props.translate('additionalDetailsStep.failedKYCTextAfter')}
                </Text>
            </View>
        </View>
    );
}

FailedKYC.propTypes = propTypes;
FailedKYC.displayName = 'FailedKYC';

export default withLocalize(FailedKYC);
