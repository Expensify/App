import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
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

const propTypes = {

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};
class CloseAccountPage extends Component {
    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
        CloseAccount.clearError();
    }

    componentWillUnmount() {
        CloseAccount.clearError();
    }

    onSubmit(values) {
        User.closeAccount(values.reasonForLeaving);
    }

    validate(values) {
        const userEmailOrPhone = Str.removeSMSDomain(this.props.session.email);
        const errors = {};

        if (_.isEmpty(values.phoneOrEmail) || userEmailOrPhone.toLowerCase() !== values.phoneOrEmail.toLowerCase()) {
            errors.phoneOrEmail = this.props.translate('closeAccountPage.enterYourDefaultContactMethod');
        }
        return errors;
    }

    render() {
        const userEmailOrPhone = Str.removeSMSDomain(this.props.session.email);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('closeAccountPage.closeAccount')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    formID={ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM}
                    validate={this.validate}
                    onSubmit={this.onSubmit}
                    submitButtonText={this.props.translate('closeAccountPage.closeAccount')}
                    style={[styles.flexGrow1, styles.mh5]}
                    isDangerousAction
                >
                    <View style={[styles.flexGrow1]}>
                        <Text>{this.props.translate('closeAccountPage.reasonForLeavingPrompt')}</Text>
                        <TextInput
                            inputID="reasonForLeaving"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            label={this.props.translate('closeAccountPage.enterMessageHere')}
                            containerStyles={[styles.mt5, styles.closeAccountMessageInput]}
                        />
                        <Text style={[styles.mt5]}>
                            <Text style={[styles.textStrong]}>
                                {this.props.translate('closeAccountPage.closeAccountWarning')}
                            </Text>
                            {' '}
                            {this.props.translate('closeAccountPage.closeAccountPermanentlyDeleteData')}
                        </Text>
                        <Text textBreakStrategy="simple" style={[styles.mt5]}>
                            <Text style={[styles.textStrong]}>
                                {this.props.translate('closeAccountPage.defaultContact')}
                            </Text>
                            {' '}
                            {userEmailOrPhone}
                        </Text>
                        <TextInput
                            inputID="phoneOrEmail"
                            autoCapitalize="none"
                            label={this.props.translate('closeAccountPage.enterDefaultContact')}
                            containerStyles={[styles.mt5]}
                            autoCorrect={false}
                            keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

CloseAccountPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(CloseAccountPage);
