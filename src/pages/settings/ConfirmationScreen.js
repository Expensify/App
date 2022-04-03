import React from 'react';
import {Image, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import confettiPop from '../../../assets/images/confetti-pop.gif';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import * as Link from '../../libs/actions/Link';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** Whether or not two factor authentication is enabled */
        requiresTwoFactorAuth: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

const ConfirmationScreen = props => (
    <>
        <View style={[styles.flex1, styles.p5, styles.justifyContentCenter]}>
            <View style={[styles.alignItemsCenter, styles.mb10]}>
                <Image
                    source={confettiPop}
                    style={styles.confettiIcon}
                />
                <Text
                    style={[
                        styles.textStrong,
                        styles.textLarge,
                        styles.mb2,
                    ]}
                >
                    {props.translate('confirmationScreen.passwordUpdated')}
                </Text>
                <Text style={styles.textAlignCenter}>
                    <Text style={styles.textAlignCenter}>
                        {props.translate('confirmationScreen.allSet')}
                    </Text>
                    {!props.requiresTwoFactorAuth && (
                        <>
                            <Text>
                                {' '}
                                {props.translate('confirmationScreen.set2FAPartOne')}
                            </Text>
                            <Text
                                style={styles.link}
                                onPress={() => Link.openExternalLink('')}
                            >
                                {' '}
                                {props.translate('confirmationScreen.set2FAPartTwo')}
                                {' '}
                            </Text>
                            <Text>{props.translate('confirmationScreen.set2FAPartThree')}</Text>
                        </>
                    )}
                </Text>
            </View>
        </View>
        <FixedFooter>
            <Button
                success
                text={props.translate('confirmationScreen.gotIt')}
                style={styles.mt6}
                pressOnEnter
                onPress={() => Navigation.goBack()}
            />
        </FixedFooter>
    </>
);

ConfirmationScreen.propTypes = propTypes;
ConfirmationScreen.defaultProps = defaultProps;
ConfirmationScreen.displayName = 'ConfirmationScreen';

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(ConfirmationScreen);
