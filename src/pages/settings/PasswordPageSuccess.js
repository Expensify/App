import React from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Button from '../../components/Button';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import FixedFooter from '../../components/FixedFooter';

const propTypes = {
    /* Onyx Props */
    ...withLocalizePropTypes,
};

const PasswordPageSuccess = props => (
    <ScreenWrapper>
        <KeyboardAvoidingView>
            <HeaderWithCloseButton
                title={props.translate('passwordPage.changePassword')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.p5}

                        // Allow the user to click show password while password input is focused.
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                keyboardShouldPersistTaps="always"
            >
                <Text style={[styles.mb6]}>
                    {props.translate('successPasswordPage.passwordUpdated')}
                </Text>
                <Text style={[styles.mb6]}>
                    {props.translate('successPasswordPage.passwordPrompt')}
                </Text>
            </ScrollView>
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    text={props.translate('successPasswordPage.gotIt')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                />
            </FixedFooter>
        </KeyboardAvoidingView>
    </ScreenWrapper>
);

PasswordPageSuccess.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(PasswordPageSuccess);
