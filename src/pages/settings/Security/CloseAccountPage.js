import React, {Component} from 'react';
import {Linking, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
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
    /** Onyx Props */

    /** Is the Close Account information modal open? */
    isCloseAccoutModalOpen: PropTypes.bool,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    isCloseAccoutModalOpen: false,
};

class CloseAccountPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reasonForLeaving: '',
            phoneOrEmail: '',
        };
    }

    render() {
        const userEmailOrPhone = Str.removeSMSDomain(this.props.session.email);
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
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={this.state.reasonForLeaving}
                            onChangeText={reasonForLeaving => this.setState({reasonForLeaving})}
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
                        <Text style={[styles.mt5]}>
                            <Text style={[styles.textStrong]}>
                                {this.props.translate('closeAccountPage.defaultContact')}
                            </Text>
                            {' '}
                            {userEmailOrPhone}
                        </Text>
                        <TextInput
                            autoCapitalize="none"
                            value={this.state.phoneOrEmail}
                            onChangeText={phoneOrEmail => this.setState({phoneOrEmail: phoneOrEmail.toLowerCase()})}
                            label={this.props.translate('closeAccountPage.enterDefaultContact')}
                            containerStyles={[styles.mt5]}
                        />
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            danger
                            text={this.props.translate('closeAccountPage.closeAccount')}
                            isLoading={this.state.loading}
                            onPress={() => User.closeAccount(this.state.reasonForLeaving)}
                            isDisabled={Str.removeSMSDomain(userEmailOrPhone).toLowerCase() !== this.state.phoneOrEmail.toLowerCase()}
                        />
                    </FixedFooter>
                    <ConfirmModal
                        title=""
                        success
                        confirmText={this.props.translate('closeAccountPage.okayGotIt')}
                        prompt={(
                            <Text>
                                {this.props.translate('closeAccountPage.closeAccountActionRequired')}
                                {' '}
                                <Text
                                    style={styles.link}
                                    onPress={() => { Linking.openURL('https://community.expensify.com/discussion/4724/faq-why-cant-i-close-my-account'); }}
                                >
                                    {this.props.translate('common.here')}
                                </Text>
                                {' '}
                                {this.props.translate('closeAccountPage.closeAccountTryAgainAfter')}
                            </Text>
                        )}
                        onConfirm={CloseAccountActions.hideCloseAccountModal}
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
        isCloseAccoutModalOpen: {
            key: ONYXKEYS.IS_CLOSE_ACCOUNT_MODAL_OPEN,
            initWithStoredValues: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(CloseAccountPage);
