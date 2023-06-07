import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import Icon from '../Icon';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import * as Expensicons from '../Icon/Expensicons';
import * as Illustrations from '../Icon/Illustrations';
import variables from '../../styles/variables';

const propTypes = {
    ...withLocalizePropTypes,

    /** Whether the 2FA is needed to get fully authenticated. */
    is2FARequired: PropTypes.bool.isRequired,
};

function JustSignedInModal(props) {
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={variables.modalTopIconWidth}
                        height={props.is2FARequired ? variables.modalTopIconHeight : variables.modalTopBigIconHeight}
                        src={props.is2FARequired ? Illustrations.SafeBlue : Illustrations.Abracadabra}
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
                    fill={colors.green}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

JustSignedInModal.propTypes = propTypes;
export default withLocalize(JustSignedInModal);
