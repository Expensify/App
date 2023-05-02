import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import _ from 'underscore';
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

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class CodesPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isNextButtonDisabled: true,
            codes: 's11yRDJ 123123z ch1hal8 aa9s8fs dl0sd92 12hjk33 s97d2k2 09scsop c1cjisa 0c92anh',
        };

        this.copyCodes = this.copyCodes.bind(this);
        this.downloadCodes = this.downloadCodes.bind(this);
    }

    componentDidMount() {
        // TODO: TO BE IMPLEMENTED
        // Session.toggleTwoFactorAuth(true);
    }

    copyCodes() {
        // TODO: TO BE IMPLEMENTED
        this.setState({isNextButtonDisabled: false});
    }

    downloadCodes() {
        // TODO: TO BE IMPLEMENTED
        this.setState({isNextButtonDisabled: false});
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
                            <Text>
                                {this.props.translate('twoFactorAuth.codesLoseAccess')}
                            </Text>
                        </View>

                        <View style={[styles.twoFactorAuthCodesBox]}>
                            <View style={[styles.twoFactorAuthCodesContainer]}>
                                {_.map(this.state.codes.split(' '), code => (
                                    <Text style={[styles.twoFactorAuthCode]} key={code}>
                                        {code}
                                    </Text>
                                ))}
                            </View>

                            <View style={[styles.twoFactorAuthCodesButtonsContainer]}>
                                <Button text="Copy codes" medium onPress={this.copyCodes} />

                                <TextFileLink
                                    fileName="two-factor-auth-codes"
                                    textContent={this.state.codes}
                                    child={downloadFile => <Button text="Download" medium onPress={downloadFile} />}
                                />
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
    }),
)(CodesPage);
