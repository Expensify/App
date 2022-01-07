import React, {Component} from 'react';
import {Linking, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as User from '../../../libs/actions/User';
import compose from '../../../libs/compose';
import styles from '../../../styles/styles';
import ScreenWrapper from '../../../components/ScreenWrapper';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import FixedFooter from '../../../components/FixedFooter';
import ConfirmModal from '../../../components/ConfirmModal';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import * as CloseAccountActions from '../../../libs/actions/CloseAccount';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    /* The user's primary email or phone number */
    accountPhoneOrEmail: PropTypes.string,

    /*  */
    isCloseAccoutModalOpen: PropTypes.bool,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    accountPhoneOrEmail: 'jules',
    isCloseAccoutModalOpen: false,
};

class CloseAccountPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reasonForLeaving: 'a',
            phoneOrEmail: 'b',
            loading: false,
        };

        this.submitForm = this.submitForm.bind(this);
    }

    /**
     * Attempt to close the user's account
     */
    submitForm() {
        User.closeAccount(this.state.reasonForLeaving);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('closeAccountPage.closeAccount')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView
                        contentContainerStyle={[
                            styles.flexGrow1,
                            styles.flexColumn,
                            styles.p5,
                        ]}
                    >
                        <Text>{this.props.translate('closeAccountPage.reasonForLeavingPrompt')}</Text>
                        <TextInput
                            value={this.state.reasonForLeaving}
                            onChangeText={reasonForLeaving => this.setState({reasonForLeaving})}
                            label={this.props.translate('closeAccountPage.typeMessageHere')}
                            containerStyles={[styles.mt5]}
                        />
                        <Text style={[styles.mt5]}>
                            {this.props.translate('closeAccountPage.closeAccountWarning')}
                        </Text>
                        <TextInput
                            value={this.state.phoneOrEmail}
                            onChangeText={phoneOrEmail => this.setState({phoneOrEmail})}
                            label={this.props.translate('loginForm.phoneOrEmail')}
                            containerStyles={[styles.mt5]}
                        />
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            danger
                            style={[styles.mb5]}
                            text={this.props.translate('closeAccountPage.closeAccount')}
                            isLoading={this.state.loading}
                            onPress={this.submitForm}
                            isDisabled={this.props.accountPhoneOrEmail !== this.state.phoneOrEmail}
                        />
                    </FixedFooter>
                    <ConfirmModal
                        title=""
                        confirmText={this.props.translate('closeAccountPage.okayGotIt')}
                        prompt={(
                            <Text>
                                {this.props.translate('closeAccountPage.closeAccountActionRequiredPart1')}
                                {' '}
                                <Text
                                    style={styles.link}
                                    onPress={() => { Linking.openURL('http://http.cat'); }}
                                >
                                    {this.props.translate('common.here')}
                                </Text>
                                {' '}
                                {this.props.translate('closeAccountPage.closeAccountActionRequiredPart2')}
                            </Text>
                        )}
                        onConfirm={() => {CloseAccountActions.hideCloseAccountModal();}}
                        isVisible={this.props.isCloseAccoutModalOpen}
                        shouldShowCancelButton={false}
                    />
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.defaultProps = defaultProps;
CloseAccountPage.displayName = 'CloseAccountPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        isCloseAccoutModalOpen: {key: ONYXKEYS.IS_CLOSE_ACCOUNT_MODAL_OPEN},
    }),
)(CloseAccountPage);
