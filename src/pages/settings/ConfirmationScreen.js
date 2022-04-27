import React from 'react';
import {Image, View} from 'react-native';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import confettiPop from '../../../assets/images/confetti-pop.gif';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    ...withLocalizePropTypes,
};

const ConfirmationScreen = props => (
    <>
        <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
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
                {props.translate('confirmationScreen.allSet')}
            </Text>
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
ConfirmationScreen.displayName = 'ConfirmationScreen';

export default withLocalize(ConfirmationScreen);
