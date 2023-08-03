import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as User from '../../../libs/actions/User';
import compose from '../../../libs/compose';
import styles from '../../../styles/styles';
import ScreenWrapper from '../../../components/ScreenWrapper';
import TextInput from '../../../components/TextInput';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import * as CloseAccount from '../../../libs/actions/CloseAccount';
import ONYXKEYS from '../../../ONYXKEYS';
import Form from '../../../components/Form';
import CONST from '../../../CONST';
import ConfirmModal from '../../../components/ConfirmModal';

const propTypes = {
    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
};

function CloseAccountPage(props) {
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const [reasonForLeaving, setReasonForLeaving] = useState('');

    // If you are new to hooks this might look weird but basically it is something that only runs when the component unmounts
    // nothing runs on mount and we pass empty dependencies to prevent this from running on every re-render.
    // TODO: We should refactor this so that the data in instead passed directly as a prop instead of "side loading" the data
    // here, we left this as is during refactor to limit the breaking changes.
    useEffect(() => () => CloseAccount.clearError(), []);

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const onConfirm = () => {
        User.closeAccount(reasonForLeaving);
        hideConfirmModal();
    };

    const showConfirmModal = (values) => {
        setConfirmModalVisibility(true);
        setReasonForLeaving(values.reasonForLeaving);
    };

    const validate = (values) => {
        const userEmailOrPhone = props.formatPhoneNumber(props.session.email);
        const errors = {};

        if (_.isEmpty(values.phoneOrEmail) || userEmailOrPhone.toLowerCase() !== values.phoneOrEmail.toLowerCase()) {
            errors.phoneOrEmail = 'closeAccountPage.enterYourDefaultContactMethod';
        }
        return errors;
    };

    const userEmailOrPhone = props.formatPhoneNumber(props.session.email);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('closeAccountPage.closeAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
            <Form
                formID={ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM}
                validate={validate}
                onSubmit={showConfirmModal}
                submitButtonText={props.translate('closeAccountPage.closeAccount')}
                style={[styles.flexGrow1, styles.mh5]}
                isSubmitActionDangerous
            >
                <View style={[styles.flexGrow1]}>
                    <Text>{props.translate('closeAccountPage.reasonForLeavingPrompt')}</Text>
                    <TextInput
                        inputID="reasonForLeaving"
                        autoGrowHeight
                        textAlignVertical="top"
                        label={props.translate('closeAccountPage.enterMessageHere')}
                        accessibilityLabel={props.translate('closeAccountPage.enterMessageHere')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt5, styles.autoGrowHeightMultilineInput]}
                    />
                    <Text style={[styles.mt5]}>
                        {props.translate('closeAccountPage.enterDefaultContactToConfirm')} <Text style={[styles.textStrong]}>{userEmailOrPhone}</Text>
                    </Text>
                    <TextInput
                        inputID="phoneOrEmail"
                        autoCapitalize="none"
                        label={props.translate('closeAccountPage.enterDefaultContact')}
                        accessibilityLabel={props.translate('closeAccountPage.enterDefaultContact')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt5]}
                        autoCorrect={false}
                        keyboardType={Str.isValidEmail(userEmailOrPhone) ? CONST.KEYBOARD_TYPE.EMAIL_ADDRESS : CONST.KEYBOARD_TYPE.DEFAULT}
                    />
                    <ConfirmModal
                        danger
                        title={props.translate('closeAccountPage.closeAccountWarning')}
                        onConfirm={onConfirm}
                        onCancel={hideConfirmModal}
                        isVisible={isConfirmModalVisible}
                        prompt={props.translate('closeAccountPage.closeAccountPermanentlyDeleteData')}
                        confirmText={props.translate('common.yesContinue')}
                        cancelText={props.translate('common.cancel')}
                        shouldDisableConfirmButtonWhenOffline
                        shouldShowCancelButton
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(CloseAccountPage);
