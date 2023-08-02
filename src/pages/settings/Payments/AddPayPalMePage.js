import React, {useRef, useCallback} from 'react';
import {View, Linking} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import ROUTES from '../../../ROUTES';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import TextLink from '../../../components/TextLink';
import Text from '../../../components/Text';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Form from '../../../components/Form';
import Growl from '../../../libs/Growl';
import TextInput from '../../../components/TextInput';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as User from '../../../libs/actions/User';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import variables from '../../../styles/variables';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import paypalMeDataPropTypes from '../../../components/paypalMeDataPropTypes';

const propTypes = {
    /** Account details for PayPal.Me */
    payPalMeData: paypalMeDataPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeData: {},
};

const validate = (values) => {
    const errors = {};
    if (!ValidationUtils.isValidPaypalUsername(values.payPalMeUsername)) {
        errors.payPalMeUsername = 'addPayPalMePage.formatError';
    }

    return errors;
};

function AddPayPalMePage(props) {
    const payPalMeInput = useRef(null);

    const hasPaypalAccount = !_.isEmpty(props.payPalMeData);

    const growlMessageOnSave = props.translate(hasPaypalAccount ? 'addPayPalMePage.growlMessageOnUpdate' : 'addPayPalMePage.growlMessageOnSave');

    /**
     * Sets the payPalMe username and error data for the current user
     */
    const setPayPalMeData = useCallback(
        (values) => {
            User.addPaypalMeAddress(values.payPalMeUsername);
            Growl.show(growlMessageOnSave, CONST.GROWL.SUCCESS, 3000);
            Navigation.goBack(ROUTES.SETTINGS_PAYMENTS);
        },
        [growlMessageOnSave],
    );

    return (
        <ScreenWrapper onEntryTransitionEnd={() => payPalMeInput.current && payPalMeInput.current.focus()}>
            <HeaderWithBackButton
                title={props.translate('common.payPalMe')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PAYMENTS)}
            />
            <Form
                style={[styles.flex1, styles.p5]}
                formID={ONYXKEYS.FORMS.PAYPAL_FORM}
                validate={validate}
                onSubmit={setPayPalMeData}
                submitButtonText={props.translate(hasPaypalAccount ? 'addPayPalMePage.updatePaypalAccount' : 'addPayPalMePage.addPayPalAccount')}
                enabledWhenOffline
            >
                <Text style={[styles.mb4]}>{props.translate('addPayPalMePage.enterYourUsernameToGetPaidViaPayPal')}</Text>
                <TextInput
                    inputID="payPalMeUsername"
                    ref={(ref) => (payPalMeInput.current = ref)}
                    label={props.translate('addPayPalMePage.payPalMe')}
                    accessibilityLabel={props.translate('addPayPalMePage.payPalMe')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    autoCompleteType="off"
                    autoCorrect={false}
                    placeholder={props.translate('addPayPalMePage.yourPayPalUsername')}
                    returnKeyType="done"
                    defaultValue={lodashGet(props.payPalMeData, 'accountData.username', '')}
                />
                <View style={[styles.mt3, styles.flexRow, styles.justifyContentBetween, styles.alignSelfStart]}>
                    <Text style={[styles.textMicro, styles.flexRow]}>{props.translate('addPayPalMePage.checkListOf')}</Text>
                    <PressableWithoutFeedback
                        shouldUseAutoHitSlop={false}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                        accessibilityLabel={props.translate('addPayPalMePage.supportedCurrencies')}
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
                    </PressableWithoutFeedback>
                </View>
            </Form>
        </ScreenWrapper>
    );
}

AddPayPalMePage.propTypes = propTypes;
AddPayPalMePage.defaultProps = defaultProps;
AddPayPalMePage.displayName = 'AddPayPalMePage';

export default compose(
    withLocalize,
    withOnyx({
        payPalMeData: {
            key: ONYXKEYS.PAYPAL,
        },
    }),
)(AddPayPalMePage);
