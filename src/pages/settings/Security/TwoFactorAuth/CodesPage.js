import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import styles from '../../../../styles/styles';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import Section from '../../../../components/Section';
import TextFileLink from '../../../../components/TextFileLink';
import ONYXKEYS from '../../../../ONYXKEYS';
import Clipboard from '../../../../libs/Clipboard';

const propTypes = {
    account: PropTypes.shape({
        /** User recovery codes for setting up 2-FA */
        recoveryCodes: PropTypes.string,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {
        recoveryCodes: '',
    },
};

class CodesPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isNextButtonDisabled: true,
        };
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('twoFactorAuth.headerTitle')}
                    subtitle={this.props.translate('twoFactorAuth.stepCodes')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                <FullPageOfflineBlockingView>
                    <Section
                        title={this.props.translate('twoFactorAuth.keepCodesSafe')}
                        icon={Illustrations.ShieldYellow}
                        containerStyles={[styles.twoFactorAuthSection]}
                    >
                        <View style={[styles.mv3]}>
                            <Text>{this.props.translate('twoFactorAuth.codesLoseAccess')}</Text>
                        </View>

                        <View style={[styles.twoFactorAuthCodesBox]}>
                            <View style={[styles.twoFactorAuthCodesContainer]}>
                                {Boolean(this.props.account.recoveryCodes) &&
                                    _.map(this.props.account.recoveryCodes.split(', '), (code) => (
                                        <Text
                                            style={[styles.twoFactorAuthCode]}
                                            key={code}
                                        >
                                            {code}
                                        </Text>
                                    ))}
                            </View>

                            <View style={[styles.twoFactorAuthCodesButtonsContainer]}>
                                <Button
                                    text="Copy codes"
                                    medium
                                    onPress={() => {
                                        Clipboard.setString(this.props.account.recoveryCodes);
                                        this.setState({isNextButtonDisabled: false});
                                    }}
                                    style={[styles.twoFactorAuthCodesButton]}
                                />

                                <TextFileLink
                                    fileName="two-factor-auth-codes"
                                    textContent={this.props.account.recoveryCodes}
                                >
                                    {(downloadFile) => (
                                        <Button
                                            text="Download"
                                            medium
                                            onPress={() => {
                                                downloadFile();
                                                this.setState({isNextButtonDisabled: false});
                                            }}
                                            style={[styles.twoFactorAuthCodesButton]}
                                        />
                                    )}
                                </TextFileLink>
                            </View>
                        </View>
                    </Section>

                    <FixedFooter style={[styles.twoFactorAuthFooter]}>
                        <Button
                            success
                            text={this.props.translate('common.next')}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_VERIFY)}
                            isDisabled={this.state.isNextButtonDisabled}
                        />
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }
}

CodesPage.propTypes = propTypes;
CodesPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(CodesPage);
