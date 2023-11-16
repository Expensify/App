import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeIllustrations from '@styles/illustrations/useThemeIllustrations';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    ...withLocalizePropTypes,

    /** Whether the 2FA is needed to get fully authenticated. */
    is2FARequired: PropTypes.bool.isRequired,
};

function JustSignedInModal(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={variables.modalTopIconWidth}
                        height={props.is2FARequired ? variables.modalTopIconHeight : variables.modalTopBigIconHeight}
                        src={props.is2FARequired ? illustrations.SafeBlue : illustrations.Abracadabra}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                    {props.translate(props.is2FARequired ? 'validateCodeModal.tfaRequiredTitle' : 'validateCodeModal.successfulSignInTitle')}
                </Text>
                <View style={[styles.mt2, styles.mb2]}>
                    <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                        {props.translate(props.is2FARequired ? 'validateCodeModal.tfaRequiredDescription' : 'validateCodeModal.successfulSignInDescription')}
                    </Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

JustSignedInModal.propTypes = propTypes;
JustSignedInModal.displayName = 'JustSignedInModal';

export default withLocalize(JustSignedInModal);
