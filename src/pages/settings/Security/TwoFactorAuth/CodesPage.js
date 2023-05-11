import React, {useState} from 'react';
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
    ...withLocalizePropTypes,
    account: PropTypes.shape({
        /** User recovery codes for setting up 2-FA */
        recoveryCodes: PropTypes.string,
    }),
};

const defaultProps = {
    account: {
        recoveryCodes: '',
    },
};

function CodesPage(props) {
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('twoFactorAuth.headerTitle')}
                shouldShowStepCounter
                stepCounter={{
                    step: 1,
                    text: props.translate('twoFactorAuth.stepCodes'),
                }}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <FullPageOfflineBlockingView>
                <Section
                    title={props.translate('twoFactorAuth.keepCodesSafe')}
                    icon={Illustrations.ShieldYellow}
                    containerStyles={[styles.twoFactorAuthSection]}
                >
                    <View style={styles.mv3}>
                        <Text>{props.translate('twoFactorAuth.codesLoseAccess')}</Text>
                    </View>
                    <View style={styles.twoFactorAuthCodesBox}>
                        <View style={styles.twoFactorAuthCodesContainer}>
                            {Boolean(props.account.recoveryCodes) &&
                                _.map(props.account.recoveryCodes.split(', '), (code) => (
                                    <Text
                                        style={styles.twoFactorAuthCode}
                                        key={code}
                                    >
                                        {code}
                                    </Text>
                                ))}
                        </View>
                        <View style={styles.twoFactorAuthCodesButtonsContainer}>
                            <Button
                                text={props.translate('twoFactorAuth.copyCodes')}
                                medium
                                onPress={() => {
                                    Clipboard.setString(props.account.recoveryCodes);
                                    setIsNextButtonDisabled(false);
                                }}
                                style={styles.twoFactorAuthCodesButton}
                            />
                            <TextFileLink
                                fileName="two-factor-auth-codes"
                                textContent={props.account.recoveryCodes}
                            >
                                {(downloadFile) => (
                                    <Button
                                        text="Download"
                                        medium
                                        onPress={() => {
                                            downloadFile();
                                            setIsNextButtonDisabled(false);
                                        }}
                                        style={styles.twoFactorAuthCodesButton}
                                    />
                                )}
                            </TextFileLink>
                        </View>
                    </View>
                </Section>
                <FixedFooter style={[styles.twoFactorAuthFooter]}>
                    <Button
                        success
                        text={props.translate('common.next')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_VERIFY)}
                        isDisabled={isNextButtonDisabled}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

CodesPage.propTypes = propTypes;
CodesPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(CodesPage);
