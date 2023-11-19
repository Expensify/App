import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as CloseAccount from '@userActions/CloseAccount';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
    const styles = useThemeStyles();
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

    /**
     * Removes spaces and transform the input string to lowercase.
     * @param {String} phoneOrEmail - The input string to be sanitized.
     * @returns {String} The sanitized string
     */
    const sanitizePhoneOrEmail = (phoneOrEmail) => phoneOrEmail.replace(/\s+/g, '').toLowerCase();

    const validate = (values) => {
        const requiredFields = ['phoneOrEmail'];
        const userEmailOrPhone = props.formatPhoneNumber(props.session.email);
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        if (values.phoneOrEmail && sanitizePhoneOrEmail(userEmailOrPhone) !== sanitizePhoneOrEmail(values.phoneOrEmail)) {
            errors.phoneOrEmail = 'closeAccountPage.enterYourDefaultContactMethod';
        }
        return errors;
    };

    const userEmailOrPhone = props.formatPhoneNumber(props.session.email);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={CloseAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('closeAccountPage.closeAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM}
                validate={validate}
                onSubmit={showConfirmModal}
                submitButtonText={props.translate('closeAccountPage.closeAccount')}
                style={[styles.flexGrow1, styles.mh5]}
                isSubmitActionDangerous
            >
                <View style={[styles.flexGrow1]}>
                    <Text>{props.translate('closeAccountPage.reasonForLeavingPrompt')}</Text>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="reasonForLeaving"
                        autoGrowHeight
                        label={props.translate('closeAccountPage.enterMessageHere')}
                        aria-label={props.translate('closeAccountPage.enterMessageHere')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputStyle={[styles.verticalAlignTop]}
                        containerStyles={[styles.mt5, styles.autoGrowHeightMultilineInput]}
                    />
                    <Text style={[styles.mt5]}>
                        {props.translate('closeAccountPage.enterDefaultContactToConfirm')} <Text style={[styles.textStrong]}>{userEmailOrPhone}</Text>
                    </Text>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="phoneOrEmail"
                        autoCapitalize="none"
                        label={props.translate('closeAccountPage.enterDefaultContact')}
                        aria-label={props.translate('closeAccountPage.enterDefaultContact')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt5]}
                        autoCorrect={false}
                        inputMode={Str.isValidEmail(userEmailOrPhone) ? CONST.INPUT_MODE.EMAIL : CONST.INPUT_MODE.TEXT}
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
            </FormProvider>
        </ScreenWrapper>
    );
}

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.defaultProps = defaultProps;
CloseAccountPage.displayName = 'CloseAccountPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(CloseAccountPage);
