import React from 'react';
import {Image, View} from 'react-native';
import Text from '../components/Text';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import styles from '../styles/styles';
import confettiPop from '../../assets/images/confetti-pop.gif';
import Button from '../components/Button';
import FixedFooter from '../components/FixedFooter';
import Navigation from '../libs/Navigation/Navigation';

const propTypes = {
    ...withLocalizePropTypes,
};

const RequestCallConfirmationScreen = props => (
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
                {props.translate('requestCallConfirmationScreen.callRequested')}
            </Text>
            <Text style={styles.textAlignCenter}>
                {props.translate('requestCallConfirmationScreen.allSet')}
            </Text>
        </View>
        <FixedFooter>
            <Button
                success
                text={props.translate('requestCallConfirmationScreen.gotIt')}
                style={styles.mt6}
                pressOnEnter
                onPress={() => Navigation.goBack()}
            />
        </FixedFooter>
    </>
);

RequestCallConfirmationScreen.propTypes = propTypes;
RequestCallConfirmationScreen.displayName = 'RequestCallConfirmationScreen';

export default withLocalize(RequestCallConfirmationScreen);
