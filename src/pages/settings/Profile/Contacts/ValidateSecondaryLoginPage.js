import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import * as User from '../../../../libs/actions/User';
import ONYXKEYS from '../../../../ONYXKEYS';
import Button from '../../../../components/Button';
import ROUTES from '../../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import FixedFooter from '../../../../components/FixedFooter';
import TextInput from '../../../../components/TextInput';
import userPropTypes from '../../userPropTypes';
import Permissions from '../../../../libs/Permissions';

const propTypes = {

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }).isRequired,

    /* Onyx Props */
    user: userPropTypes,

    // Route object from navigation
    route: PropTypes.shape({
        // Params that are passed into the route
        params: PropTypes.shape({
            // The login being validated
            login: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {},
    route: {},
    betas: [],
};

class ValidateSecondaryLoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {validateCode: ''};

        this.formType = props.route.params.type;
        this.submitForm = this.submitForm.bind(this);
    }

    componentWillUnmount() {
        User.clearUserErrorMessage();
    }

    /**
     * Validate the secondary login via validate code
     */
    submitForm() {
        User.validateSecondaryLoginAndNavigate(this.props.session.accountID, this.state.validateCode, this.props.route.params.login);
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={`${this.props.translate('validateSecondaryLoginPage.validate')} ${this.props.route.params.login}`}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                {/* We use keyboardShouldPersistTaps="handled" to prevent the keyboard from being hidden when switching focus on input fields  */}
                <ScrollView style={styles.flex1} contentContainerStyle={styles.p5} keyboardShouldPersistTaps="handled">
                    <Text style={[styles.mb6]}>
                        {`${this.props.translate('validateSecondaryLoginPage.enterMagicCodeToValidate', {login: this.props.route.params.login})}`}
                    </Text>
                    <View style={styles.mb6}>
                        <TextInput
                            label={this.props.translate('common.magicCode')}
                            value={this.state.validateCode}
                            onChangeText={validateCode => this.setState({validateCode})}
                            textContentType="oneTimeCode"
                        />
                    </View>
                    {!_.isEmpty(this.props.user.error) && (
                        <Text style={styles.formError}>
                            {this.props.user.error}
                        </Text>
                    )}
                </ScrollView>
                <FixedFooter style={[styles.flexGrow0]}>
                    <Button
                        success
                        isDisabled={!this.state.validateCode}
                        isLoading={this.props.user.loading}
                        text={this.props.translate('validateSecondaryLoginPage.submit')}
                        onPress={this.submitForm}
                        pressOnEnter
                    />
                </FixedFooter>
            </ScreenWrapper>
        );
    }
}

ValidateSecondaryLoginPage.propTypes = propTypes;
ValidateSecondaryLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ValidateSecondaryLoginPage);
