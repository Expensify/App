import React, {useRef, useState, useCallback} from 'react';
import {View, TouchableWithoutFeedback, Linking} from 'react-native';
import _ from 'underscore';
import CONST from '../../../CONST';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import TextLink from '../../../components/TextLink';
import Text from '../../../components/Text';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
import TextInput from '../../../components/TextInput';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as User from '../../../libs/actions/User';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import variables from '../../../styles/variables';

const AddPayPalMePage = (props) => {
    const [payPalMeUsername, setPayPalMeUsername] = useState('');
    const [payPalMeUsernameError, setPayPalMeUsernameError] = useState(false);
    const payPalMeInput = useRef(null);

    const growlMessageOnSave = props.translate('addPayPalMePage.growlMessageOnSave');

    /**
     * Sets the payPalMe username and error data for the current user
     */
    const setPayPalMeData = useCallback(() => {
        if (!ValidationUtils.isValidPaypalUsername(payPalMeUsername)) {
            setPayPalMeUsernameError(true);
            return;
        }
        setPayPalMeUsernameError(false);
        User.addPaypalMeAddress(payPalMeUsername);

        Growl.show(growlMessageOnSave, CONST.GROWL.SUCCESS, 3000);
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
    }, [payPalMeUsername, growlMessageOnSave]);

    return (
        <ScreenWrapper onEntryTransitionEnd={() => payPalMeInput.current && payPalMeInput.current.focus()}>
            <HeaderWithCloseButton
                title={props.translate('common.payPalMe')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <View style={[styles.flex1, styles.p5]}>
                <View style={[styles.flex1]}>
                    <Text style={[styles.mb4]}>{props.translate('addPayPalMePage.enterYourUsernameToGetPaidViaPayPal')}</Text>
                    <TextInput
                        ref={payPalMeInput}
                        label={props.translate('addPayPalMePage.payPalMe')}
                        autoCompleteType="off"
                        autoCorrect={false}
                        value={payPalMeUsername}
                        placeholder={props.translate('addPayPalMePage.yourPayPalUsername')}
                        onChangeText={(text) => {
                            setPayPalMeUsername(text);
                            setPayPalMeUsernameError(false);
                        }}
                        returnKeyType="done"
                        hasError={payPalMeUsernameError}
                        errorText={payPalMeUsernameError ? props.translate('addPayPalMePage.formatError') : ''}
                    />
                    <View style={[styles.mt3, styles.flexRow, styles.justifyContentBetween, styles.alignSelfStart]}>
                        <Text style={[styles.textMicro, styles.flexRow]}>{props.translate('addPayPalMePage.checkListOf')}</Text>
                        <TouchableWithoutFeedback
                            // eslint-disable-next-line max-len
                            onPress={() => Linking.openURL('https://developer.paypal.com/docs/reports/reference/paypal-supported-currencies')}
                        >
                            <View style={[styles.flexRow, styles.cursorPointer]}>
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href="https://developer.paypal.com/docs/reports/reference/paypal-supported-currencies"
                                    style={[styles.textMicro]}
                                >
                                    {props.translate('addPayPalMePage.supportedCurrencies')}
                                </TextLink>
                                <View style={[styles.ml1]}>
                                    <Icon
                                        src={Expensicons.NewWindow}
                                        height={variables.iconSizeExtraSmall}
                                        width={variables.iconSizeExtraSmall}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
            <FixedFooter>
                <Button
                    success
                    onPress={setPayPalMeData}
                    pressOnEnter
                    style={[styles.mt3]}
                    isDisabled={_.isEmpty(payPalMeUsername.trim())}
                    text={props.translate('addPayPalMePage.addPayPalAccount')}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
};

AddPayPalMePage.propTypes = {...withLocalizePropTypes};
AddPayPalMePage.displayName = 'AddPayPalMePage';

export default withLocalize(AddPayPalMePage);
