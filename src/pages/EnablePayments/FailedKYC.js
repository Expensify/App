import React from 'react';
import {
    View,
} from 'react-native';
import CONST from '../../CONST';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const FailedKYC = props => (
    <View style={[styles.flex1]}>
        <View style={[styles.ph5]}>
            <Text style={styles.mb3}>
                {props.translate('additionalDetailsStep.failedKYCTextBefore')}
                <TextLink href={`mailto:${CONST.EMAIL.CONCIERGE}`} style={[styles.link]}>
                    {CONST.EMAIL.CONCIERGE}
                </TextLink>
                {props.translate('additionalDetailsStep.failedKYCTextAfter')}
            </Text>
        </View>
    </View>
);

FailedKYC.propTypes = propTypes;
FailedKYC.displayName = 'FailedKYC';

export default withLocalize(FailedKYC);
