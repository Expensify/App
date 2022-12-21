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

const PasswordConfirmationScreen = props => (
    <>
        <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
            <Image
                source={confettiPop}
                style={styles.confettiIcon}
            />
            <Text
                style={[
                    styles.headlineFont,
                    styles.textLarge,
                    styles.mb2,
                ]}
            >
                {props.translate('passwordConfirmationScreen.passwordUpdated')}
            </Text>
            <Text style={styles.textAlignCenter}>
                {props.translate('passwordConfirmationScreen.allSet')}
            </Text>
        </View>
        <FixedFooter>
            <Button
                success
                text={props.translate('passwordConfirmationScreen.gotIt')}
                style={styles.mt6}
                pressOnEnter
                onPress={() => Navigation.goBack()}
            />
        </FixedFooter>
    </>
);

PasswordConfirmationScreen.propTypes = propTypes;
PasswordConfirmationScreen.displayName = 'PasswordConfirmationScreen';

export default withLocalize(PasswordConfirmationScreen);
