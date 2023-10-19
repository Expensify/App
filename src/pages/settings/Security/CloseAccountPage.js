import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
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
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as PolicyUtils from '../../../libs/PolicyUtils';
import policyMemberPropType from '../../policyMemberPropType';
import {policyPropTypes} from '../../workspace/withPolicy';
import BlockingView from '../../../components/BlockingViews/BlockingView';
import * as Illustrations from '../../../components/Icon/Illustrations';
import variables from '../../../styles/variables';

const propTypes = {
    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }),

    /** The employee list of all policies (coming from Onyx) */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    /** All the user's policies (coming from Onyx) */
    policies: PropTypes.objectOf(policyPropTypes.policy),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
    allPolicyMembers: {},
    policies: {},
};

function CloseAccountPage(props) {
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const [reasonForLeaving, setReasonForLeaving] = useState('');
    const [shouldAllowClosing, setshouldAllowClosing] = useState(PolicyUtils.hasSharedPolicies(props.policies, props.allPolicyMembers));

    // If you are new to hooks this might look weird but basically it is something that only runs when the component unmounts
    // nothing runs on mount and we pass empty dependencies to prevent this from running on every re-render.
    // TODO: We should refactor this so that the data in instead passed directly as a prop instead of "side loading" the data
    // here, we left this as is during refactor to limit the breaking changes.
    useEffect(
        () => () => {
            setshouldAllowClosing(PolicyUtils.hasSharedPolicies(props.policies, props.allPolicyMembers));
            CloseAccount.clearError();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

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
            {!shouldAllowClosing ? (
                <BlockingView
                    icon={Illustrations.ToddBehindCloud}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={props.translate('closeAccountPage.hasSharedPoliciesTitle')}
                    subtitle={props.translate('closeAccountPage.hasSharedPoliciesSubTitle')}
                    linkKey="closeAccountPage.goToWorkspacesSettings"
                    shouldShowLink
                    onLinkPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                />
            ) : (
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
            )}
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
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
    }),
)(CloseAccountPage);
