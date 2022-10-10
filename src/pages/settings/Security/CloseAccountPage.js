import React, {Component} from 'react';
import {Linking, ScrollView, View} from 'react-native';
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
import ConfirmModal from '../../../components/ConfirmModal';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import * as CloseAccount from '../../../libs/actions/CloseAccount';
import ONYXKEYS from '../../../ONYXKEYS';
import OfflineIndicator from '../../../components/OfflineIndicator';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';

const propTypes = {
    /** Onyx Props */

    /** Data from when user attempts to close their account */
    closeAccount: PropTypes.shape({
        /** Error message if previous attempt to close account was unsuccessful */
        error: PropTypes.string,

        /** Is account currently being closed? */
        isLoading: PropTypes.bool.isRequired,
    }),

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }).isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    closeAccount: {error: '', isLoading: false},
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
                    <View style={[styles.flexGrow1]}>
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
                        <Text textBreakStrategy="simple" style={[styles.mt5]}>
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
                    </View>
                    <Button
                        danger
                        text={this.props.translate('closeAccountPage.closeAccount')}
                        isLoading={this.props.closeAccount.isLoading}
                        onPress={() => User.closeAccount(this.state.reasonForLeaving)}
                        isDisabled={Str.removeSMSDomain(userEmailOrPhone).toLowerCase() !== this.state.phoneOrEmail.toLowerCase() || this.props.network.isOffline}
                        style={[styles.mt5]}
                    />
                    {!this.props.isSmallScreenWidth
                        && <OfflineIndicator containerStyles={[styles.mt2]} />}
                </ScrollView>
                <ConfirmModal
                    title={this.props.translate('closeAccountPage.closeAccountError')}
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
                    onConfirm={CloseAccount.clearError}
                    isVisible={Boolean(this.props.closeAccount.error)}
                    shouldShowCancelButton={false}
                />
            </ScreenWrapper>
        );
    }
}

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withNetwork(),
    withOnyx({
        closeAccount: {
            key: ONYXKEYS.CLOSE_ACCOUNT,
            initWithStoredValues: {error: '', isLoading: false},
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(CloseAccountPage);
